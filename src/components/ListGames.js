/* eslint-disable react/no-unused-state */
// @flow
import React, { Component } from 'react';
import { Dimensions, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview';
import type { NavigationScreenProp, NavigationStateRoute } from 'react-navigation';

import type { RootStore } from '../reducers';
import type { IGame } from '../reducers/gameReducer';
import { getGames } from '../reducers/gameReducer';
import type { PlayersType } from '../reducers/playerReducer';

type Props = {
  players: PlayersType,
  games: IGame[],
  getGames: Function,
  loading: boolean,
  // eslint-disable-next-line react/no-unused-prop-types
  filter?: (game: IGame) => boolean,
  navigation: NavigationScreenProp<NavigationStateRoute>,
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
  nameHeader: {
    marginLeft: 5,
    flex: 1.4,
    fontWeight: 'bold',
    fontSize: 11,
  },
  scoreHeader: {
    flex: 0.7,
    fontWeight: 'bold',
    fontSize: 11,
  },
  nameCol: {
    marginLeft: 5,
    flex: 1.4,
    fontSize: 11,
  },
  scoreCol: {
    flex: 0.7,
    fontSize: 11,
  },
});

class ListGames extends Component<Props, State> {
  // eslint-disable-next-line react/sort-comp
  recyclerView: RecyclerListView;

  layoutProvider: LayoutProvider;

  static defaultProps = {
    filter: undefined,
  };

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
        /* eslint-enable no-param-reassign */
      },
    );

    // Since component should always render once data has changed,
    // make data provider part of the state
    this.state = {
      dataProvider: dataProvider.cloneWithRows(props.games),
      sortCol: 'name',
      sortAsc: true,
    };
  }

  showGame = (game: IGame) => () => {
    const { navigation } = this.props;
    navigation.navigate('NavToGame', { game });
  };

  rowRenderer = (type: number, game: IGame) => {
    const { players } = this.props;
    const { team1, team2 } = game;
    const t1Defender = team1.defenderId && players.get(team1.defenderId);
    const t1Attacker = team1.attackerId && players.get(team1.attackerId);
    const t2Defender = team2.defenderId && players.get(team2.defenderId);
    const t2Attacker = team2.attackerId && players.get(team2.attackerId);
    return (
      <>
        <TouchableOpacity
          style={type === ViewTypes.EVEN ? styles.rowEven : styles.rowOdd}
          onPress={this.showGame(game)}
        >
          <Text style={styles.nameCol}>{t1Defender && t1Defender.name}</Text>
          <Text style={styles.nameCol}>{t1Attacker && t1Attacker.name}</Text>
          <Text style={styles.scoreCol}>{team1.score}</Text>
          <Text style={styles.nameCol}>{t2Defender && t2Defender.name}</Text>
          <Text style={styles.nameCol}>{t2Attacker && t2Attacker.name}</Text>
          <Text style={styles.scoreCol}>{team2.score}</Text>
        </TouchableOpacity>
      </>
    );
  };

  listViewRef = (ref: RecyclerListView) => {
    this.recyclerView = ref;
  };

  render() {
    const { loading, getGames: getGamesFn } = this.props;
    const { dataProvider } = this.state;
    return (
      <>
        <View style={styles.rowHeader}>
          <Text style={styles.nameHeader}>Defender</Text>
          <Text style={styles.nameHeader}>Attacker</Text>
          <Text style={styles.scoreHeader}>Score</Text>
          <Text style={styles.nameHeader}>Defender</Text>
          <Text style={styles.nameHeader}>Attacker</Text>
          <Text style={styles.scoreHeader}>Score</Text>
        </View>
        <RecyclerListView
          ref={this.listViewRef}
          canChangeSize
          scrollViewProps={{
            refreshControl: <RefreshControl refreshing={loading} onRefresh={getGamesFn} />,
          }}
          layoutProvider={this.layoutProvider}
          dataProvider={dataProvider}
          rowRenderer={this.rowRenderer}
        />
      </>
    );
  }
}

const mapStateToProps = (state: RootStore, ownProps: Props) => {
  let games = Array.from(state.games.games.values());
  if (ownProps.filter) {
    games = games.filter(ownProps.filter);
  }
  return {
    loading: state.games.loading,
    players: state.players.players,
    games,
  };
};

const mapDispatchToProps = {
  getGames,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ListGames);
