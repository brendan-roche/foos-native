// @flow
import { combineReducers } from 'redux';
import type { IPlayerStore } from './playerReducer';
import players from './playerReducer';
import type { IGameStore } from './gameReducer';
import games from './gameReducer';
import type { ITeamStore } from './teamReducer';
import teams from './teamReducer';

export interface RootStore {
  players: IPlayerStore;
  games: IGameStore;
  teams: ITeamStore;
}

export default combineReducers({
  players,
  games,
  teams,
});
