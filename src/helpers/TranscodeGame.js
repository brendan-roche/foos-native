// @flow

import Fuse from 'fuse.js';
import type {IPlayer} from '../reducers/playerReducer';
import type {ICreateGame} from '../reducers/gameReducer';

export default class TranscodeGame {
    text: string;
    fuse: Fuse;

    constructor(text: string, players: IPlayer[]) {
        this.text = text;
        this.fuse = new Fuse(players, {
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 2,
            keys: ['name', 'shortName']
        });
    }

    transcode(): ICreateGame {
        const numbersRegEx = '10|[0-9]|(?:zero|none|donut|one|won|too?|two|three|fou?r|five|six|seven|eight|ate|nine|ten)';
        const teamScoreRegEx = `([a-z]+(?: [a-z]+\\b(?<! and))?)(?: and)? ?([a-z]+(?: [a-z]+\\b(?<! (?:${numbersRegEx})))?) (${numbersRegEx})`;
        const gameRegEx = new RegExp(`^${teamScoreRegEx}(?: ${teamScoreRegEx})?`, 'i');
        const parts = gameRegEx.exec(this.text);

        if (!parts) {
            return {};
        }

        const team1DefenderId = this.findPlayer(parts[1]);
        const team1AttackerId = this.findPlayer(parts[2]);
        const team1Score = parts[3]
            ? TranscodeGame.toNumber(parts[3])
            : null;

        const team2DefenderId = this.findPlayer(parts[4]);
        const team2AttackerId = this.findPlayer(parts[5]);
        const team2Score = parts[6]
            ? TranscodeGame.toNumber(parts[6])
            : null;

        const team1 = {
            ...(team1DefenderId && {defenderId: team1DefenderId}),
            ...(team1AttackerId && {attackerId: team1AttackerId}),
            ...(team1Score && {score: team1Score}),
        };

        const team2 = {
            ...(team2DefenderId && {defenderId: team2DefenderId}),
            ...(team2AttackerId && {attackerId: team2AttackerId}),
            ...(team2Score && {score: team2Score}),
        };

        console.log('transcode: ', this.text, parts, team1, team2);

        return {
            ...(Object.keys(team1).length > 0 && {team1}),
            ...(Object.keys(team2).length > 0 && {team2}),
        };
    };

    findPlayer(text: ?string): ?number {
        const players: IPlayer[] = (text && this.fuse.search(text)) || [];

        return players.length > 0 ? players[0].id : null;
    }

    static toNumber(text: string): number {
        const textToNumber = {
            zero: 0,
            none: 0,
            donut: 0,
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
            ten: 10
        };

        return textToNumber[text]
            ? textToNumber[text]
            : parseInt(text, 10)
    }

}