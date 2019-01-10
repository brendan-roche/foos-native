// @flow

import Fuse from 'fuse.js';

import type { ICreateGame } from '../reducers/gameReducer';
import type { IPlayer } from '../reducers/playerReducer';

type IFuseResultType = {
  item: IPlayer,
  score: number,
};

export default class TranscodeGame {
  players: IPlayer[];

  fuse: Fuse;

  constructor(players: IPlayer[]) {
    this.players = players;
    this.fuse = new Fuse(players, {
      threshold: 0.5,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 2,
      shouldSort: true,
      includeScore: true,
      keys: ['name', 'shortName'],
    });
  }

  transcode(text: string): $Shape<ICreateGame> {
    const numbersRegEx =
      '10|[0-9]|(?:zero|none|do(?:ugh)?nut|one|won|too?|two|three|fou?r|five|six|seven|eight|ate|nine|ten)';
    const teamScoreRegEx = `([a-z]+(?:(?! and) [a-z]+\\b)?)(?: and\\b)? ?([a-z]+(?:(?! (?:${numbersRegEx})) [a-z]+\\b)?) (${numbersRegEx})`;
    const gameRegEx = new RegExp(`^${teamScoreRegEx}(?: ${teamScoreRegEx})?`, 'i');
    const parts = gameRegEx.exec(text);

    if (!parts) {
      return {};
    }

    const team1DefenderId = this.findPlayer(parts[1]);
    const team1AttackerId = this.findPlayer(parts[2]);
    const team1Score = typeof parts[3] !== 'undefined' ? TranscodeGame.toNumber(parts[3]) : null;

    const team2DefenderId = this.findPlayer(parts[4]);
    const team2AttackerId = this.findPlayer(parts[5]);
    const team2Score = typeof parts[6] !== 'undefined' ? TranscodeGame.toNumber(parts[6]) : null;

    const team1 = {
      ...(team1DefenderId ? { defenderId: team1DefenderId } : {}),
      ...(team1AttackerId ? { attackerId: team1AttackerId } : {}),
      ...(team1Score != null ? { score: team1Score } : {}),
    };

    const team2 = {
      ...(team2DefenderId ? { defenderId: team2DefenderId } : {}),
      ...(team2AttackerId ? { attackerId: team2AttackerId } : {}),
      ...(team2Score != null ? { score: team2Score } : {}),
    };

    // console.log('transcode: ', text, parts, team1, team2);

    return {
      ...(Object.keys(team1).length > 0 ? { team1 } : {}),
      ...(Object.keys(team2).length > 0 ? { team2 } : {}),
    };
  }

  findPlayer(text: ?string): ?number {
    if (!text) {
      return null;
    }
    const results: IFuseResultType[] = this.fuse.search(text);

    return results.length > 0 ? results[0].item.id : null;
  }

  static toNumber(text: string): number {
    const textToNumber = {
      zero: 0,
      none: 0,
      donut: 0,
      doughnut: 0,
      one: 1,
      won: 1,
      to: 2,
      two: 2,
      too: 2,
      three: 3,
      four: 4,
      for: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      ate: 8,
      nine: 9,
      ten: 10,
    };

    return typeof textToNumber[text] !== 'undefined' ? textToNumber[text] : parseInt(text, 10);
  }
}
