// @flow

import {produce} from 'immer';
import type {ApiBasicPlayer} from './playerReducer';

type ICreateTeam = {
    player1Id: number,
    player2Id: number,
};

export type ITeam = ICreateTeam & {
    id: number,
    elo: number,
    wins: number,
    losses: number,
    trueskill: number,
    trueskillSigma: number,
};


type ApiTeam = {
    id: number,
    player1: ApiBasicPlayer,
    player2: ApiBasicPlayer,
    rating: number,
    trueskill: number,
    trueskill_sigma: number,
    wins: number,
    losses: number
};

export type TeamsType = Map<number, ITeam>;

export type ITeamStore = {
    teams: TeamsType,
    loading: boolean,
    error: string
};

export const GET_TEAMS = 'teams/LOAD';
export const GET_TEAMS_SUCCESS = 'teams/LOAD_SUCCESS';
export const GET_TEAMS_FAIL = 'teams/LOAD_FAIL';

export const GET_TEAM = 'team/LOAD';
export const GET_TEAM_SUCCESS = 'team/LOAD_SUCCESS';
export const GET_TEAM_FAIL = 'team/LOAD_FAIL';

export const CREATE_TEAM = 'team/CREATE';
export const CREATE_TEAM_SUCCESS = 'team/CREATE_SUCCESS';
export const CREATE_TEAM_FAIL = 'team/CREATE_FAIL';

const teamReducer = produce((draft: ITeamStore, action: Object): ITeamStore | void => {
    switch (action.type) {
        case GET_TEAMS:
        case GET_TEAM:
        case CREATE_TEAM:
            draft.loading = true;
            return;
        case GET_TEAMS_SUCCESS:
            draft.loading = false;
            draft.teams = toMap(action.payload.data);
            return;
        case GET_TEAM_SUCCESS: {
            draft.loading = false;
            const team = toTeam(action.payload.data);
            draft.teams.set(team.id, team);
            return;
        }
        case GET_TEAMS_FAIL:
            draft.loading = false;
            draft.error = 'Error while fetching teams';
            return;
        case GET_TEAM_FAIL:
            draft.loading = false;
            draft.error = 'Error while fetching team';
            return;
        case CREATE_TEAM_SUCCESS:
            draft.loading = false;
            return;
        case CREATE_TEAM_FAIL:
            draft.loading = false;
            draft.error = 'Error while creating team';
            return;
    }
}, {teams: new Map(), loading: false, error: ''});

export default teamReducer;

function toMap(teamsList: ApiTeam[]): TeamsType {
    return teamsList.reduce((map: TeamsType, team: ApiTeam) => {
        map.set(team.id, toTeam(team));
        return map;
    }, new Map());
}

function toTeam(team: ApiTeam): ITeam {
    return {
        id: team.id,
        player1Id: team.player1.id,
        player2Id: team.player2.id,
        elo: team.rating,
        trueskill: team.trueskill,
        trueskillSigma: team.trueskill_sigma,
        wins: team.wins,
        losses: team.losses,
    };
}

export function getTeams(): Object {
    return {
        type: GET_TEAMS,
        payload: {
            request: {
                url: '/team'
            }
        }
    };
}

export function getTeam(id: number): Object {
    return {
        type: GET_TEAM,
        payload: {
            request: {
                url: `/team/${id}`
            }
        }
    };
}


export function createTeam(team: ICreateTeam): Object {
    return {
        type: CREATE_TEAM,
        payload: {
            request: {
                method: 'POST',
                url: '/team',
                data: team
            }
        }
    };
}
