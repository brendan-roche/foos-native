// @flow

import { Text } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import React from 'react';

type Props = {
  iconFamily: 'FontAwesome' | 'AntDesign',
  icon: string,
  title: string,
};

function AppHeader({ title, icon, iconFamily = 'FontAwesome' }: Props) {
  const headerTitle = <Text style={{ fontSize: 15 }}>{title}</Text>;

  if (iconFamily === 'AntDesign') {
    return (
      <AntDesign.Button
        name={icon}
        backgroundColor="transparent"
        underlayColor="transparent"
        color="black"
      >
        {headerTitle}
      </AntDesign.Button>
    );
  }

  return (
    <FontAwesome.Button
      name={icon}
      backgroundColor="transparent"
      underlayColor="transparent"
      color="black"
    >
      {headerTitle}
    </FontAwesome.Button>
  );
}

export default AppHeader;
