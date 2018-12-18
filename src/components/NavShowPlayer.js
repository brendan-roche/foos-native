// @flow
import React from 'react';
import type {IPlayer} from '../reducers/playerReducer';
import ShowPlayer from './ShowPlayer';

type Props = {
    navigation: any,
}

export default function NavShowPlayer(props: Props) {
    const { navigation } = props;
    const player: IPlayer = navigation.getParam('player');
    return (
        <ShowPlayer navigation={navigation} player={player} />
    );
}
