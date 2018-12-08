// @flow
import {produce} from 'immer';

interface ICreatePlayer {
    name: string,
}

interface ApiPlayer {
    id: number,
    name: string,
    active: boolean,
    wins: number,
    losses: number,
    trueskill: number,
    trueskill_sigma: number
}

export interface ApiBasicPlayer {
    id: number,
    name: string,
}


interface IPlayer extends ICreatePlayer {
    id: number,
    active: boolean,
    losses: number,
    trueskill: number,
    trueskillSigma: number,
    wins: number
}

export type PlayersType = Map<number, IPlayer>;

export interface IPlayerStore {
    players: PlayersType,
    loading: boolean,
    error: string
}

export const GET_PLAYERS = 'players/LOAD';
export const GET_PLAYERS_SUCCESS = 'players/LOAD_SUCCESS';
export const GET_PLAYERS_FAIL = 'players/LOAD_FAIL';

export const GET_PLAYER = 'player/LOAD';
export const GET_PLAYER_SUCCESS = 'player/LOAD_SUCCESS';
export const GET_PLAYER_FAIL = 'player/LOAD_FAIL';

export const CREATE_PLAYER = 'player/CREATE';
export const CREATE_PLAYER_SUCCESS = 'player/CREATE_SUCCESS';
export const CREATE_PLAYER_FAIL = 'player/CREATE_FAIL';

const playerReducer = produce((draft: IPlayerStore, action) => {
    switch (action.type) {
        case GET_PLAYERS:
        case GET_PLAYER:
        case CREATE_PLAYER:
            draft.loading = true;
            return;
        case GET_PLAYERS_SUCCESS:
            draft.loading = false;
            draft.players = toMap(action.payload.data);
            return;
        case GET_PLAYERS_FAIL:
            draft.loading = false;
            draft.error = 'Error while fetching players';
            return;
        case GET_PLAYER_SUCCESS: {
            draft.loading = false;
            const player = toPlayer(action.payload.data);
            draft.players.set(player.id, player);
            return;
        }
        case GET_PLAYER_FAIL:
            draft.loading = false;
            draft.error = 'Error while fetching player';
            return;
        case CREATE_PLAYER_SUCCESS:
            draft.loading = false;
            return;
        case CREATE_PLAYER_FAIL:
            draft.loading = false;
            draft.error = 'Error while creating player';
            return;
    }
}, {players: new Map(), loading: false, error: ''});

export default playerReducer;

// The returned order of our players is important, so we use Map
function toMap(playersList: ApiPlayer[]): PlayersType {
    return playersList.reduce((map: PlayersType, player: ApiPlayer) => {
        map.set(player.id, toPlayer(player));
        return map;
    }, new Map());
}

function toPlayer(player: ApiPlayer): IPlayer {
    return {
        id: player.id,
        name: player.name,
        active: player.active,
        wins: player.wins,
        losses: player.losses,
        trueskill: player.trueskill,
        trueskillSigma: player.trueskill_sigma,
    };
}

export function getPlayers() {
    return {
        type: GET_PLAYERS,
        payload: {
            request: {
                url: '/player'
            }
        }
    };
}

export function getPlayer(playerId) {
    return {
        type: GET_PLAYER,
        payload: {
            request: {
                url: `/player/${playerId}`
            }
        }
    };
}

export function createPlayer(player: ICreatePlayer) {
    return {
        type: CREATE_PLAYER,
        payload: {
            request: {
                method: 'POST',
                url: '/player',
                data: player
            }
        }
    };
}