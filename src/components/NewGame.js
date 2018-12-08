// @flow
import React from 'react';
import type {IGame} from '../reducers/gameReducer';
import EditGame from './EditGame';

type Props = {
    navigation: any,
    game: IGame
}

export default function NewGame(props: Props) {
    const { navigation } = props;
    const team1DefenderId: IGame = navigation.getParam('team1DefenderId', null);
    const team1AttackerId: IGame = navigation.getParam('team1AttackerId', null);
    const team2DefenderId: IGame = navigation.getParam('team2DefenderId', null);
    const team2AttackerId: IGame = navigation.getParam('team2AttackerId', null);
    return (
        <EditGame
            navigation={navigation}
            team1DefenderId={team1DefenderId}
            team1AttackerId={team1AttackerId}
            team2DefenderId={team2DefenderId}
            team2AttackerId={team2AttackerId}
        />
    );
}
