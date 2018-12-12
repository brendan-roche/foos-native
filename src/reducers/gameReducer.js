// @flow
import {produce} from 'immer';
import type {ApiBasicPlayer} from './playerReducer';

export type CreateGameTeamType = {
    defenderId: ?number,
    attackerId: ?number,
    score: ?number,
};

export interface ICreateGame {
    team1: CreateGameTeamType,
    team2: CreateGameTeamType,
}

export type GameTeamType = {
    id: number,
    elo: number,
    ratingChange: number,
    trueskill: number,
    trueskillChange: number,
    trueskillSigma: number,
    attackerTrueskill: number,
    attackerTrueskillSigma: number,
    attackerTrueskillChange: number,
    defenderTrueskill: number,
    defenderTrueskillSigma: number,
    defenderTrueskillChange: number,
} & CreateGameTeamType;

export interface IGame {
    id: number,
    team1: GameTeamType,
    team2: GameTeamType,
}

export type GamesType = Map<number, IGame>;

export interface IGameStore {
    games: GamesType,
    loading: boolean,
    error: string,
    newGameId: number | null
}

interface ApiGame {
    id: number,
    team1_id: number,
    team2_id: number,
    team1_defender: ApiBasicPlayer,
    team1_attacker: ApiBasicPlayer,
    team2_defender: ApiBasicPlayer,
    team2_attacker: ApiBasicPlayer,
    team1_score: number,
    team2_score: number,
    team1_rating: number,
    team2_rating: number,
    rating_change: number,
    team1_trueskill: number,
    team1_trueskill_sigma: number,
    team1_trueskill_change: number,
    team2_trueskill: number,
    team2_trueskill_sigma: number,
    team2_trueskill_change: number,
    team1_attacker_trueskill: number,
    team1_attacker_trueskill_sigma: number,
    team1_attacker_trueskill_change: number,
    team1_defender_trueskill: number,
    team1_defender_trueskill_sigma: number,
    team1_defender_trueskill_change: number,
    team2_attacker_trueskill: number,
    team2_attacker_trueskill_sigma: number,
    team2_attacker_trueskill_change: number,
    team2_defender_trueskill: number,
    team2_defender_trueskill_sigma: number,
    team2_defender_trueskill_change: number,
}

export const GET_GAMES = 'games/LOAD';
export const GET_GAMES_SUCCESS = 'games/LOAD_SUCCESS';
export const GET_GAMES_FAIL = 'games/LOAD_FAIL';

export const CREATE_GAME = 'game/CREATE';
export const CREATE_GAME_SUCCESS = 'game/CREATE_SUCCESS';
export const CREATE_GAME_FAIL = 'game/CREATE_FAIL';

export const CLEAR_NEW_GAME = 'game/CLEAR_NEW_GAME';

const gameReducer = produce((draft: IGameStore, action: Object) => {
    switch (action.type) {
        case GET_GAMES:
        case CREATE_GAME:
            draft.loading = true;
            return;
        case GET_GAMES_SUCCESS:
            draft.loading = false;
            draft.games = toMap(action.payload.data);
            return;
        case GET_GAMES_FAIL:
            draft.loading = false;
            draft.error = 'Error fetching games';
            return;
        case CREATE_GAME_SUCCESS: {
            draft.loading = false;
            const game = toGame(action.payload.data);
            draft.games.set(game.id, game);
            draft.newGameId = game.id;
            return;
        }
        case CREATE_GAME_FAIL:
            draft.loading = false;
            draft.error = 'Error creating game: ';
            return;
        case CLEAR_NEW_GAME:
            draft.newGameId = null;
            return;
    }
}, {games: new Map(), loading: false, error: '', newGameId: null});

export default gameReducer;

function toMap(gamesList: ApiGame[]): GamesType {
    return gamesList.reduce((map: GamesType, game: ApiGame) => {
        map.set(game.id, toGame(game));
        return map;
    }, new Map());
}

function toGame(game: ApiGame): IGame {
    return {
        id: game.id,
        team1: {
            id: game.team1_id,
            defenderId: game.team1_defender.id,
            attackerId: game.team1_attacker.id,
            score: game.team1_score,
            elo: game.team1_rating,
            ratingChange: game.rating_change,
            trueskill: game.team1_trueskill,
            trueskillChange: game.team1_trueskill_change,
            trueskillSigma: game.team1_trueskill_sigma,
            attackerTrueskill: game.team1_attacker_trueskill,
            attackerTrueskillSigma: game.team1_attacker_trueskill_sigma,
            attackerTrueskillChange: game.team1_attacker_trueskill_change,
            defenderTrueskill: game.team1_defender_trueskill,
            defenderTrueskillSigma: game.team1_defender_trueskill_sigma,
            defenderTrueskillChange: game.team1_defender_trueskill_change,
        },
        team2: {
            id: game.team2_id,
            defenderId: game.team2_defender.id,
            attackerId: game.team2_attacker.id,
            score: game.team2_score,
            elo: game.team2_rating,
            ratingChange: game.rating_change * -1,
            trueskill: game.team2_trueskill,
            trueskillChange: game.team2_trueskill_change,
            trueskillSigma: game.team2_trueskill_sigma,
            attackerTrueskill: game.team2_attacker_trueskill,
            attackerTrueskillSigma: game.team2_attacker_trueskill_sigma,
            attackerTrueskillChange: game.team2_attacker_trueskill_change,
            defenderTrueskill: game.team2_defender_trueskill,
            defenderTrueskillSigma: game.team2_defender_trueskill_sigma,
            defenderTrueskillChange: game.team2_defender_trueskill_change,
        }
    };
}

export function getGames() {
    return {
        type: GET_GAMES,
        payload: {
            request: {
                url: '/game'
            }
        }
    };
}

export function createGame(game: ICreateGame) {
    return {
        types: [CREATE_GAME, CREATE_GAME_SUCCESS, CREATE_GAME_FAIL],
        payload: {
            request: {
                method: 'POST',
                url: '/game',
                data: {
                    team1_defender_id: game.team1.defenderId,
                    team1_attacker_id: game.team1.attackerId,
                    team1_score: game.team1.score,
                    team2_defender_id: game.team2.defenderId,
                    team2_attacker_id: game.team2.attackerId,
                    team2_score: game.team2.score,
                }
            }
        }
    };
}

export function clearNewGame() {
    return {
        type: CLEAR_NEW_GAME
    }
}