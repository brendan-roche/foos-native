// @flow
import React from 'react';
import ListGames from './ListGames';

type Props = {
  navigation: any,
};

export default function NavToGames(props: Props) {
  const { navigation } = props;
  const filter = navigation.getParam('filter');
  return <ListGames navigation={navigation} filter={filter} />;
}
