// @flow
import React, { Component } from 'react';
import { Dimensions, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { Big } from 'big.js';
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type {
  NavigationScreenProp,
  NavigationStateRoute,
  NavigationStackScreenOptions,
} from 'react-navigation';

import type { RootStore } from '../reducers';
import type { IPlayer } from '../reducers/playerReducer';
import { getPlayers } from '../reducers/playerReducer';
import AppHeader from './AppHeader';

type Props = {
  players: IPlayer[],
  loading: boolean,
  getPlayers: Function,
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

function comparePlayers(
  sortCol: string | number,
  ascending: boolean,
  p1: IPlayer,
  p2: IPlayer,
): number {
  if ((p1[sortCol] < p2[sortCol] && ascending) || (p1[sortCol] > p2[sortCol] && !ascending)) {
    return -1;
  }
  if ((p1[sortCol] > p2[sortCol] && ascending) || (p1[sortCol] < p2[sortCol] && !ascending)) {
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
  nameHeader: {
    marginLeft: 5,
    flex: 1.4,
    fontWeight: 'bold',
  },
  winsHeader: {
    flex: 0.7,
    fontWeight: 'bold',
  },
  lossesHeader: {
    flex: 0.9,
    fontWeight: 'bold',
  },
  trueSkillHeader: {
    flex: 1.2,
    fontWeight: 'bold',
  },
  trueSkillSigmaHeader: {
    flex: 1.3,
    fontWeight: 'bold',
  },
  nameCol: {
    marginLeft: 5,
    flex: 1.4,
  },
  winsCol: {
    flex: 0.7,
  },
  lossesCol: {
    flex: 0.9,
  },
  trueSkillCol: {
    flex: 1.2,
  },
  trueSkillSigmaCol: {
    flex: 1.3,
  },
});

class ListPlayers extends Component<Props, State> {
  // eslint-disable-next-line react/sort-comp
  recyclerView: RecyclerListView;

  layoutProvider: LayoutProvider;

  static navigationOptions: NavigationStackScreenOptions = {
    headerTitle: <AppHeader title="Players" icon="users" iconFamily="FontAwesome" />,
  };

  constructor(props: Props) {
    super(props);

    const { width } = Dimensions.get('window');
    const { players } = this.props;

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
      dataProvider: dataProvider.cloneWithRows(players),
      sortCol: 'name',
      sortAsc: true,
    };
  }

  orderBy(column: string) {
    const { players } = this.props;
    return () => {
      const { sortAsc, sortCol, dataProvider } = this.state;
      const ascending = column === sortCol ? !sortAsc : true;

      this.setState({
        dataProvider: dataProvider.cloneWithRows(
          players.sort(comparePlayers.bind(this, column, ascending)),
        ),
        sortCol: column,
        sortAsc: ascending,
      });
    };
  }

  showPlayer = (player: IPlayer) => () => {
    const { navigation } = this.props;
    navigation.navigate('ShowPlayer', { player });
  };

  rowRenderer = (type: number, player: IPlayer) => (
    <>
      <TouchableOpacity
        style={type === ViewTypes.EVEN ? styles.rowEven : styles.rowOdd}
        onPress={this.showPlayer(player)}
      >
        <Text style={styles.nameCol}>{player.name}</Text>
        <Text style={styles.winsCol}>{player.wins}</Text>
        <Text style={styles.lossesCol}>{player.losses}</Text>
        <Text style={styles.trueSkillCol}>{Big(player.trueskill).toFixed(2)}</Text>
        <Text style={styles.trueSkillSigmaCol}>{Big(player.trueskillSigma).toFixed(2)}</Text>
      </TouchableOpacity>
    </>
  );

  listViewRef = (ref: RecyclerListView) => {
    this.recyclerView = ref;
  };

  render() {
    const { sortCol, sortAsc, dataProvider } = this.state;
    const { loading, getPlayers: getPlayersFn } = this.props;
    const icon = <FontAwesome name={sortAsc ? 'arrow-down' : 'arrow-up'} size={10} />;

    return (
      <>
        <View style={styles.rowHeader}>
          <Text onPress={this.orderBy('name')} style={styles.nameHeader}>
            Name
            {sortCol === 'name' ? icon : null}
          </Text>
          <Text onPress={this.orderBy('wins')} style={styles.winsHeader}>
            Wins
            {sortCol === 'wins' ? icon : null}
          </Text>
          <Text onPress={this.orderBy('losses')} style={styles.lossesHeader}>
            Losses
            {sortCol === 'losses' ? icon : null}
          </Text>
          <Text onPress={this.orderBy('trueskill')} style={styles.trueSkillHeader}>
            TrueSkill
            {sortCol === 'trueskill' ? icon : null}
          </Text>
          <Text onPress={this.orderBy('trueskillSigma')} style={styles.trueSkillSigmaHeader}>
            TrueSkill σ{sortCol === 'trueskillSigma' ? icon : null}
          </Text>
        </View>
        <RecyclerListView
          ref={this.listViewRef}
          canChangeSize
          scrollViewProps={{
            refreshControl: <RefreshControl refreshing={loading} onRefresh={getPlayersFn} />,
          }}
          layoutProvider={this.layoutProvider}
          dataProvider={dataProvider}
          rowRenderer={this.rowRenderer}
        />
      </>
    );
  }
}

const mapStateToProps = (state: RootStore, ownProps: Props): $Shape<Props> => ({
  ...(ownProps.navigation.state.params ? ownProps.navigation.state.params : {}),
  loading: state.players.loading,
  players: Array.from(state.players.players.values()).filter((player: IPlayer) => player.active),
});

const mapDispatchToProps = {
  getPlayers,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ListPlayers);
