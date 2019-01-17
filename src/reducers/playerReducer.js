// @flow
import { produce } from 'immer';

type ICreatePlayer = {
  name: string,
};

type ApiPlayer = {
  id: number,
  name: string,
  short_name: string,
  active: boolean,
  wins: number,
  losses: number,
  trueskill: number,
  trueskill_sigma: number,
};

export type ApiBasicPlayer = {
  id: number,
  name: string,
};

export type IPlayer = ICreatePlayer & {
  id: number,
  shortName: string,
  active: boolean,
  losses: number,
  trueskill: number,
  trueskillSigma: number,
  wins: number,
};

export type PlayersType = Map<number, IPlayer>;

export type IPlayerStore = {
  players: PlayersType,
  loading: boolean,
  error: string,
};

export const GET_PLAYERS = 'players/LOAD';
export const GET_PLAYERS_SUCCESS = 'players/LOAD_SUCCESS';
export const GET_PLAYERS_FAIL = 'players/LOAD_FAIL';

export const GET_PLAYER = 'player/LOAD';
export const GET_PLAYER_SUCCESS = 'player/LOAD_SUCCESS';
export const GET_PLAYER_FAIL = 'player/LOAD_FAIL';

export const CREATE_PLAYER = 'player/CREATE';
export const CREATE_PLAYER_SUCCESS = 'player/CREATE_SUCCESS';
export const CREATE_PLAYER_FAIL = 'player/CREATE_FAIL';

function toPlayer(player: ApiPlayer): IPlayer {
  return {
    id: player.id,
    name: player.name,
    shortName: player.short_name,
    active: player.active,
    wins: player.wins,
    losses: player.losses,
    trueskill: player.trueskill,
    trueskillSigma: player.trueskill_sigma,
  };
}

// The returned order of our players is important, so we use Map
function toMap(playersList: ApiPlayer[]): PlayersType {
  return playersList.reduce((map: PlayersType, player: ApiPlayer) => {
    map.set(player.id, toPlayer(player));
    return map;
  }, new Map());
}

export function getPlayers(): Object {
  return {
    type: GET_PLAYERS,
    payload: {
      request: {
        url: '/player',
      },
    },
  };
}

export function getPlayer(playerId: number): Object {
  return {
    type: GET_PLAYER,
    payload: {
      request: {
        url: `/player/${playerId}`,
      },
    },
  };
}

export function createPlayer(player: ICreatePlayer): Object {
  return {
    type: CREATE_PLAYER,
    payload: {
      request: {
        method: 'POST',
        url: '/player',
        data: player,
      },
    },
  };
}

const playerReducer = produce<IPlayerStore, Object>(
  (draft: IPlayerStore, action: Object): IPlayerStore | void => {
    // eslint-disable-next-line default-case
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
    }
  },
  {
    players: new Map(),
    loading: false,
    error: '',
  },
);

export default playerReducer;
