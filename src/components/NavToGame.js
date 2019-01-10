// @flow
import React from 'react';
import type { IGame } from '../reducers/gameReducer';
import ShowGame from './ShowGame';

type Props = {
  navigation: any,
};

export default function NavToGame(props: Props) {
  const { navigation } = props;
  const game: IGame = navigation.getParam('game');
  return <ShowGame navigation={navigation} game={game} />;
}
