// @flow
import { combineReducers } from 'redux';
import players from './playerReducer';
import games from './gameReducer';
import teams from './teamReducer';
import type {IGameStore} from './gameReducer';
import type {IPlayerStore} from './playerReducer';
import type {ITeamStore} from "./teamReducer";

export interface RootStore {
    players: IPlayerStore,
    games: IGameStore,
    teams: ITeamStore
}

export default combineReducers({
    players,
    games,
    teams
})