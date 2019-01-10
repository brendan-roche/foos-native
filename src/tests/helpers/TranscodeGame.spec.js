// @flow
import TranscodeGame from '../../helpers/TranscodeGame';
import players from './fixtures/players';
import type { ICreateGame } from '../../reducers/gameReducer';

const games = [
  [
    'Brendan and Muhammad 10',
    {
      team1: {
        defenderId: 3,
        attackerId: 41,
        score: 10,
      },
    },
  ],
  [
    'Brendan Muhammad 10',
    {
      team1: {
        defenderId: 3,
        attackerId: 41,
        score: 10,
      },
    },
  ],
  [
    'Brendan Muhammad 10 Elliot',
    {
      team1: {
        defenderId: 3,
        attackerId: 41,
        score: 10,
      },
    },
  ],
  [
    'Brendan and Muhammad 10 Elliot Jack 7',
    {
      team1: {
        defenderId: 3,
        attackerId: 41,
        score: 10,
      },
      team2: {
        defenderId: 1,
        attackerId: 18,
        score: 7,
      },
    },
  ],
  [
    'Jamie Justin 10 Jimbo and Michael C 7',
    {
      team1: {
        defenderId: 5,
        attackerId: 2,
        score: 10,
      },
      team2: {
        defenderId: 8,
        attackerId: 10,
        score: 7,
      },
    },
  ],
  [
    'Michael L Michael C six Greg and Milos ten',
    {
      team1: {
        defenderId: 11,
        attackerId: 10,
        score: 6,
      },
      team2: {
        defenderId: 15,
        attackerId: 6,
        score: 10,
      },
    },
  ],
  [
    'Nick and SLG ate Omid Jonathon ten',
    {
      team1: {
        defenderId: 9,
        attackerId: 14,
        score: 8,
      },
      team2: {
        defenderId: 7,
        attackerId: 44,
        score: 10,
      },
    },
  ],
  [
    'Jack Greg ten Elliot Kraig donut',
    {
      team1: {
        defenderId: 18,
        attackerId: 15,
        score: 10,
      },
      team2: {
        defenderId: 1,
        attackerId: 12,
        score: 0,
      },
    },
  ],
];

test.each(games)('Transcode Game', (gameStr: string, expectedGame: ICreateGame) => {
  const result = new TranscodeGame(players).transcode(gameStr);
  expect(result).toMatchObject(expectedGame);
});

const playerData = [
  ['Brendan', 3],
  ['Brendon', 3],
  ['Muhammad', 41],
  ['Muhamad', 41],
  ['Jingbo', 8],
  ['Jimbo', 8],
  ['Jamie', 5],
  ['John', 44],
  ['JH', 5],
  ['AJ', 43],
  ['Michael', 10],
  ['Michael C', 10],
  ['MC', 10],
  ['JC', 2],
  ['Justin', 2],
  ['Michael L', 11],
  ['ML', 11],
  ['Alex', 16],
  // ['testing', null],
];

test.each(playerData)('Find Player', (playerName: string, expectedPlayerId: ?number) => {
  const playerId = new TranscodeGame(players).findPlayer(playerName);
  expect(playerId).toBe(expectedPlayerId);
});
