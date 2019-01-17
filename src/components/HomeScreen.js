// @flow
import React, { Component } from 'react';
import { findNodeHandle, Image, StyleSheet, Text, View } from 'react-native';
import type { NavigationScreenProp, NavigationStateRoute } from 'react-navigation';
import { BlurView } from 'react-native-blur';
import Spinner from 'react-native-loading-spinner-overlay';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import connect from 'react-redux/es/connect/connect';
import type { PlayersType } from '../reducers/playerReducer';
import { getPlayers } from '../reducers/playerReducer';
import type { TeamsType } from '../reducers/teamReducer';
import { getTeams } from '../reducers/teamReducer';
import type { GamesType } from '../reducers/gameReducer';
import { getGames } from '../reducers/gameReducer';
import type { RootStore } from '../reducers';

type Props = {
  getPlayers: () => Object,
  getTeams: () => Object,
  getGames: () => Object,
  loading: boolean,
  error: string | null,
  players: PlayersType,
  teams: TeamsType,
  games: GamesType,
  navigation: NavigationScreenProp<NavigationStateRoute>,
};

type State = {
  viewRef: BlurView | null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#00BFFF',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});

class HomeScreen extends Component<Props, State> {
  // eslint-disable-next-line react/sort-comp
  backgroundImage: ?Image;

  state = { viewRef: null };

  componentDidMount() {
    const {
      players,
      getPlayers: getPlayersFn,
      teams,
      getTeams: getTeamsFn,
      games,
      getGames: getGamesFn,
    } = this.props;

    if (players.size === 0) {
      getPlayersFn();
    }
    if (teams.size === 0) {
      getTeamsFn();
    }
    if (games.size === 0) {
      getGamesFn();
    }
  }

  imageLoaded = () => {
    this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
  };

  render() {
    const { loading, error, navigation } = this.props;
    const { viewRef } = this.state;

    if (error) {
      return <Text>{error}</Text>;
    }

    return (
      <View style={styles.container}>
        {<Spinner visible={loading} textContent="Loading..." textStyle={styles.spinnerTextStyle} />}
        <Image
          ref={(img: ?Image) => {
            this.backgroundImage = img;
          }}
          /* eslint-disable-next-line global-require */
          source={require('../../assets/images/foosball-1.jpg')}
          style={styles.backgroundImage}
          onLoadEnd={this.imageLoaded}
        />
        {viewRef && (
          <BlurView
            style={styles.backgroundImage}
            viewRef={viewRef}
            blurType="light"
            blurAmount={5}
          />
        )}

        {!loading && (
          <FontAwesome.Button
            name="plus"
            onPress={() => navigation.navigate('EditGame')}
            style={styles.button}
            marginBottom={10}
            backgroundColor="transparent"
          >
            New Game
          </FontAwesome.Button>
        )}

        {!loading && (
          <FontAwesome.Button
            name="users"
            onPress={() => navigation.navigate('Players')}
            marginBottom={10}
            style={styles.button}
            backgroundColor="transparent"
          >
            Show Players
          </FontAwesome.Button>
        )}

        {!loading && (
          <FontAwesome.Button
            name="soccer-ball-o"
            onPress={() => navigation.navigate('Games')}
            style={styles.button}
            marginBottom={10}
            backgroundColor="transparent"
          >
            Show Games
          </FontAwesome.Button>
        )}

        {!loading && (
          <AntDesign.Button
            name="team"
            onPress={() => navigation.navigate('Teams')}
            style={styles.button}
            backgroundColor="transparent"
          >
            Show Teams
          </AntDesign.Button>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state: RootStore): $Shape<Props> => ({
  players: state.players.players,
  teams: state.teams.teams,
  games: state.games.games,
  loading: state.players.loading || state.games.loading || state.teams.loading,
  error: state.players.error || state.games.error || state.teams.error,
});

const mapDispatchToProps = {
  getPlayers,
  getTeams,
  getGames,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);
