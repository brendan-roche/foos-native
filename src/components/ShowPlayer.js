// @flow
import React, { Component } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { Big } from 'big.js';
import type {
  NavigationScreenProp,
  NavigationStateRoute,
  NavigationStackScreenOptions,
} from 'react-navigation';

import { Col, Rows, Table, TableWrapper } from 'react-native-table-component';
import { NavigationActions } from 'react-navigation';
import type { RootStore } from '../reducers';
import type { IPlayer, PlayersType } from '../reducers/playerReducer';
import type { ITeam } from '../reducers/teamReducer';
import type { GameTeamType, IGame } from '../reducers/gameReducer';
import AppHeader from './AppHeader';

type Props = {
  player: IPlayer,
  // eslint-disable-next-line react/no-unused-prop-types
  teams: ITeam[],
  games: IGame[],
  // eslint-disable-next-line react/no-unused-prop-types
  players: PlayersType,
  navigation: NavigationScreenProp<NavigationStateRoute>,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: '#fff',
    flexDirection: 'column',
    margin: 20,
  },
  head: {
    height: 40,
    backgroundColor: '#f1f8ff',
  },
  wrapper: {
    flexDirection: 'row',
  },
  title: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    // justifyContent: 'left'
  },
  row: {
    height: 28,
  },
  text: {
    textAlign: 'center',
    fontSize: 11,
  },
  button: {
    // alignContent: 'right'
  },
});

function isPartOfGameTeam(player: IPlayer, team: GameTeamType): boolean {
  return team.defenderId === player.id || team.attackerId === player.id;
}

function isPartOfGame(player: IPlayer, game: IGame): boolean {
  return isPartOfGameTeam(player, game.team1) || isPartOfGameTeam(player, game.team2);
}

function isPartOfTeam(player: IPlayer, team: ITeam): boolean {
  return team.player1Id === player.id || team.player2Id === player.id;
}

class ShowPlayer extends Component<Props> {
  static navigationOptions: NavigationStackScreenOptions = ({ navigation }) => ({
    headerTitle: (
      <AppHeader
        title={navigation.state.params.player.name}
        icon="users"
        iconFamily="FontAwesome"
      />
    ),
  });

  goHome = () => {
    const { navigation } = this.props;
    const navAction = NavigationActions.navigate({
      routeName: 'Home',
    });
    if (navigation.reset) {
      navigation.reset([navAction], 0);
    }
  };

  showGames = () => {
    const { player, navigation } = this.props;
    navigation.navigate('Games', { filter: (game: IGame) => isPartOfGame(player, game) });
  };

  render() {
    const { player, games } = this.props;

    let donuts = 0;
    let winStreak = 0;
    let losingStreak = 0;
    let longestWinStreak = 0;
    let longestLosingStreak = 0;
    games.forEach((g: IGame) => {
      const isTeam1 = isPartOfGameTeam(player, g.team1);
      const isWin =
        g.team1.score != null &&
        g.team2.score != null &&
        ((g.team1.score > g.team2.score && isTeam1) || (g.team2.score > g.team1.score && !isTeam1));

      if ((g.team1.score === 0 && isTeam1) || (g.team2.score === 0 && !isTeam1)) {
        donuts += 1;
      }

      if (isWin) {
        winStreak += 1;
        losingStreak = 0;
        if (winStreak > longestWinStreak) {
          longestWinStreak = winStreak;
        }
      } else {
        losingStreak += 1;
        winStreak = 0;
        if (losingStreak > longestLosingStreak) {
          longestLosingStreak = losingStreak;
        }
      }
    });
    const data = [
      [player.name],
      [Big(player.trueskill).toFixed(2)],
      [Big(player.trueskillSigma).toFixed(2)],
      [player.wins + player.losses],
      [player.wins],
      [player.losses],
      [donuts],
      [longestWinStreak],
      [longestLosingStreak],
    ];
    return (
      <View style={styles.container}>
        <Table>
          <TableWrapper style={styles.wrapper}>
            <Col
              data={[
                'Short Name',
                'Trueskill',
                'Trueskill σ',
                'Total Games',
                'Total Wins',
                'Total Losses',
                'Donuts',
                'Winning Streak',
                'Losing Streak',
              ]}
              heightArr={[28, 28]}
              style={styles.title}
              textStyle={styles.text}
            />
            <Rows data={data} flexArr={[1]} style={styles.row} textStyle={styles.text} />
          </TableWrapper>
        </Table>
        <View style={styles.button}>
          <Button title="Show Games" onPress={this.showGames} />
        </View>

        <Button title="Home" onPress={this.goHome} />
      </View>
    );
  }
}

const mapStateToProps = (state: RootStore, ownProps: Props): $Shape<Props> => {
  const player = ((ownProps.navigation.state?.params?.player: any): IPlayer);

  return {
    ...(ownProps.navigation.state.params ? ownProps.navigation.state.params : {}),
    games: Array.from(state.games.games.values()).filter((game: IGame) =>
      isPartOfGame(player, game),
    ),
    teams: Array.from(state.teams.teams.values()).filter((team: ITeam) =>
      isPartOfTeam(player, team),
    ),
    players: state.players.players,
  };
};

export default connect(mapStateToProps)(ShowPlayer);
