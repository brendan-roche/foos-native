// @flow
import React, { Component } from 'react';
import { Dimensions, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { Big } from 'big.js';
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview';
import Icon from 'react-native-vector-icons/FontAwesome';

import type { RootStore } from '../reducers';
import type { ITeam } from '../reducers/teamReducer';
import { getTeams } from '../reducers/teamReducer';
import type { IPlayer, PlayersType } from '../reducers/playerReducer';

type Props = {
  players: PlayersType,
  teams: ITeam[],
  loading: boolean,
  getTeams: Function,
  navigation: any,
};

type State = {
  dataProvider: DataProvider,
  sortCol: string,
  sortAsc: boolean,
};

const ViewTypes = {
  ODD: 1,
  EVEN: 2,
};

type DimensionsType = {
  width: number,
  height: number,
};

function getPlayerById(playerId: number, players: PlayersType): IPlayer {
  const player = players.get(playerId);
  if (!player) {
    throw new Error(`Player with id ${playerId} doesn't exist`);
  }

  return player;
}

function comparePlayers(sortCol: string, ascending: boolean, p1: IPlayer, p2: IPlayer): number {
  if ((p1[sortCol] < p2[sortCol] && ascending) || (p1[sortCol] > p2[sortCol] && !ascending)) {
    return -1;
  }
  if ((p1[sortCol] > p2[sortCol] && ascending) || (p1[sortCol] < p2[sortCol] && !ascending)) {
    return 1;
  }

  return 0;
}

function compareTeams(sortCol: string, ascending: boolean, t1: ITeam, t2: ITeam): number {
  if (['player1', 'player2'].indexOf(sortCol) !== -1) {
    const { players } = this.props;
    return sortCol === 'player1'
      ? comparePlayers(
          'name',
          ascending,
          getPlayerById(t1.player1Id, players),
          getPlayerById(t2.player1Id, players),
        )
      : comparePlayers(
          'name',
          ascending,
          getPlayerById(t1.player2Id, players),
          getPlayerById(t2.player2Id, players),
        );
  }
  if ((t1[sortCol] < t2[sortCol] && ascending) || (t1[sortCol] > t2[sortCol] && !ascending)) {
    return -1;
  }
  if ((t1[sortCol] > t2[sortCol] && ascending) || (t1[sortCol] < t2[sortCol] && !ascending)) {
    return 1;
  }

  return 0;
}

const styles = StyleSheet.create({
  rowHeader: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#ffbb00',
    height: 40,
  },
  rowEven: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#00BFFF',
  },
  rowOdd: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  player1Header: {
    marginLeft: 5,
    flex: 1.4,
    fontWeight: 'bold',
    fontSize: 11,
  },
  player2Header: {
    marginLeft: 5,
    flex: 1.4,
    fontWeight: 'bold',
    fontSize: 11,
  },
  winsHeader: {
    flex: 0.7,
    fontWeight: 'bold',
    fontSize: 11,
  },
  lossesHeader: {
    flex: 0.9,
    fontWeight: 'bold',
    fontSize: 11,
  },
  eloHeader: {
    flex: 0.9,
    fontWeight: 'bold',
    fontSize: 11,
  },
  trueSkillHeader: {
    flex: 0.7,
    fontWeight: 'bold',
    fontSize: 11,
  },
  trueSkillSigmaHeader: {
    flex: 0.7,
    fontWeight: 'bold',
    fontSize: 11,
  },
  player1Col: {
    marginLeft: 5,
    flex: 1.4,
    fontSize: 11,
  },
  player2Col: {
    marginLeft: 5,
    flex: 1.4,
    fontSize: 11,
  },
  winsCol: {
    flex: 0.7,
    fontSize: 11,
  },
  lossesCol: {
    flex: 0.9,
    fontSize: 11,
  },
  eloCol: {
    flex: 0.9,
    fontSize: 11,
  },
  trueSkillCol: {
    flex: 0.7,
    fontSize: 11,
  },
  trueSkillSigmaCol: {
    flex: 0.7,
    fontSize: 11,
  },
});

class ListTeams extends Component<Props, State> {
  // eslint-disable-next-line react/sort-comp
  recyclerView: RecyclerListView;

  layoutProvider: LayoutProvider;

  constructor(props: Props) {
    super(props);

    const { width } = Dimensions.get('window');

    // Create the data provider and provide method which takes in two rows of data
    // and return if those two are different or not.
    // THIS IS VERY IMPORTANT, FORGET PERFORMANCE IF THIS IS MESSED UP
    const dataProvider = new DataProvider((r1, r2) => r1 !== r2);

    this.layoutProvider = new LayoutProvider(
      (index: number): number => (index % 2 === 0 ? ViewTypes.EVEN : ViewTypes.ODD),
      (type: number, dim: DimensionsType) => {
        /* eslint-disable no-param-reassign */
        dim.width = width;
        dim.height = 35;
        /* eslint-disable no-param-reassign */
      },
    );
    this.state = {
      dataProvider,
      sortCol: 'elo',
      sortAsc: false,
    };
    this.state = this.getOrderByState('elo', false);
  }

  getOrderByState(column: string, ascending?: boolean) {
    const { sortAsc, sortCol, dataProvider } = this.state;
    const { teams } = this.props;
    if (typeof ascending === 'undefined') {
      ascending = column === sortCol ? !sortAsc : true;
    }

    return {
      dataProvider: dataProvider.cloneWithRows(
        teams.sort(compareTeams.bind(this, column, ascending)),
      ),
      sortCol: column,
      sortAsc: ascending,
    };
  }

  orderBy(column: string, ascending?: boolean) {
    return () => {
      this.setState(this.getOrderByState(column, ascending));
    };
  }

  showTeam = (team: ITeam) => () => {
    const { navigation } = this.props;
    navigation.navigate('NavToTeam', { team });
  };

  rowRenderer = (type: number, team: ITeam) => (
    <>
      <TouchableOpacity
        style={type === ViewTypes.EVEN ? styles.rowEven : styles.rowOdd}
        onPress={this.showTeam(team)}
      >
        <Text style={styles.player1Col}>{this.getPlayerName(team)}</Text>
        <Text style={styles.player2Col}>{this.getPlayerName(team, 2)}</Text>
        <Text style={styles.winsCol}>{team.wins}</Text>
        <Text style={styles.lossesCol}>{team.losses}</Text>
        <Text style={styles.eloCol}>{Big(team.elo).toFixed(1)}</Text>
        <Text style={styles.trueSkillCol}>{Big(team.trueskill).toFixed(1)}</Text>
        <Text style={styles.trueSkillSigmaCol}>{Big(team.trueskillSigma).toFixed(1)}</Text>
      </TouchableOpacity>
    </>
  );

  listViewRef = (ref: RecyclerListView) => {
    this.recyclerView = ref;
  };

  getPlayerName(team: ITeam, playerNumber: number = 1): string {
    const { players } = this.props;
    const playerId = playerNumber === 1 ? team.player1Id : team.player2Id;
    const player = players.get(playerId);
    return (player && player.name) || '';
  }

  render() {
    const { sortCol, sortAsc, dataProvider } = this.state;
    const { loading, getTeams: getTeamsFn } = this.props;
    const icon = <Icon name={sortAsc ? 'arrow-down' : 'arrow-up'} size={10} />;

    return (
      <>
        <View style={styles.rowHeader}>
          <Text onPress={this.orderBy('player1')} style={styles.player1Header}>
            Player 1{sortCol === 'player1' ? icon : null}
          </Text>
          <Text onPress={this.orderBy('player2')} style={styles.player2Header}>
            Player 2{sortCol === 'player2' ? icon : null}
          </Text>
          <Text onPress={this.orderBy('wins')} style={styles.winsHeader}>
            Wins
            {sortCol === 'wins' ? icon : null}
          </Text>
          <Text onPress={this.orderBy('losses')} style={styles.lossesHeader}>
            Losses
            {sortCol === 'losses' ? icon : null}
          </Text>
          <Text onPress={this.orderBy('elo')} style={styles.eloHeader}>
            Elo
            {sortCol === 'elo' ? icon : null}
          </Text>
          <Text onPress={this.orderBy('trueskill')} style={styles.trueSkillHeader}>
            TS
            {sortCol === 'trueskill' ? icon : null}
          </Text>
          <Text onPress={this.orderBy('trueskillSigma')} style={styles.trueSkillSigmaHeader}>
            TS σ{sortCol === 'trueskillSigma' ? icon : null}
          </Text>
        </View>
        <RecyclerListView
          ref={this.listViewRef}
          canChangeSize
          scrollViewProps={{
            refreshControl: <RefreshControl refreshing={loading} onRefresh={getTeamsFn} />,
          }}
          layoutProvider={this.layoutProvider}
          dataProvider={dataProvider}
          rowRenderer={this.rowRenderer}
        />
      </>
    );
  }
}

const mapStateToProps = (state: RootStore) => {
  const { players } = state.players;
  return {
    loading: state.teams.loading,
    players: state.players.players,
    teams: Array.from(state.teams.teams.values()).filter(
      (team: ITeam) => players.get(team.player1Id)?.active && players.get(team.player2Id)?.active,
    ),
  };
};

const mapDispatchToProps = {
  getTeams,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ListTeams);
