// @flow
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';
import axiosMiddleware from 'redux-axios-middleware';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import Reactotron from './src/tools/ReactotronConfig';
import { API_BASE_URL } from './src/constants/api';
import reducer from './src/reducers/index';
import ListPlayers from './src/components/ListPlayers';
import ListGames from './src/components/ListGames';
import HomeScreen from './src/components/HomeScreen';
import EditGame from './src/components/EditGame';
import NavToGame from './src/components/NavToGame';
import NewGame from './src/components/NewGame';
import NavToPlayer from './src/components/NavToPlayer';
import NavToGames from './src/components/NavToGames';
import ListTeams from './src/components/ListTeams';
import NavToTeams from './src/components/NavToTeams';
import NavToTeam from './src/components/NavToTeam';

// eslint-disable-next-line no-undef
if (__DEV__) {
  // eslint-disable-next-line global-require
  // const MessageQueue = require('react-native/Libraries/BatchedBridge/MessageQueue.js');
  // const spyFunction = (msg: any) => {
  //   // eslint-disable-next-line no-console
  //   console.log(msg);
  // };
  //
  // MessageQueue.spy(spyFunction);

  // eslint-disable-next-line no-console
  import('./src/tools/ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

const client = axios.create({
  baseURL: API_BASE_URL,
  responseType: 'json',
  // access to fetch requests on aws blocked
  // https://stackoverflow.com/questions/53203024/access-to-fetch-at-aws-lambda-site-from-origin-http-localhost3000-has-been
  headers: {
    'access-control-allow-origin': 'localhost',
    'access-control-allow-credentials': 'true',
  },
});

const store = Reactotron.createStore(reducer, applyMiddleware(axiosMiddleware(client)));

const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    Players: ListPlayers,
    Games: ListGames,
    Teams: ListTeams,
    EditGame,
    NewGame,
    NavToPlayer,
    NavToGame,
    NavToGames,
    NavToTeams,
    NavToTeam,
  },
  {
    initialRouteName: 'Home',
  },
);

const AppContainer = createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
  },
});

export default class App extends Component<{}> {
  // eslint-disable-next-line react/sort-comp
  navigator: ?typeof AppContainer;

  handleNavigationChange = (prevState: Object, newState: Object, action: string) => {
    // eslint-disable-next-line no-console
    console.log('handleNavigationChange', prevState, newState, action);
  };

  render() {
    return (
      <Provider store={store}>
        <View style={styles.container}>
          <AppContainer
            onNavigationStateChange={this.handleNavigationChange}
            uriPrefix="/app"
            ref={(nav: ?AppContainer) => {
              this.navigator = nav;
            }}
          />
        </View>
      </Provider>
    );
  }
}
