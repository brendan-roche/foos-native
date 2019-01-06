// @flow
import React from 'react';
import type {ITeam} from '../reducers/teamReducer';
import ShowTeam from './ShowTeam';

type Props = {
    navigation: any,
}

export default function NavToTeam(props: Props) {
    const { navigation } = props;
    const team: ITeam = navigation.getParam('team');
    return (
        <ShowTeam navigation={navigation} team={team} />
    );
}
