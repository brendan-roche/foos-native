// @flow
import React from 'react';
import ListTeams from './ListTeams';

type Props = {
  navigation: any,
};

export default function NavToTeams(props: Props) {
  const { navigation } = props;
  const filter = navigation.getParam('filter');
  return <ListTeams navigation={navigation} filter={filter} />;
}
