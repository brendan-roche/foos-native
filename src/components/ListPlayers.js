// @flow
import React, {Component} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {connect} from 'react-redux';

import type {RootStore} from '../reducers';
import type {IPlayer} from '../reducers/playerReducer';

type Props = {
    players: () => IPlayer[]
}

class ListPlayers extends Component<Props> {
    renderItem = ({item}) => (
        <View style={styles.item}>
            <Text>{item.name}</Text>
        </View>
    );

    render() {
        const {players} = this.props;
        return (
            <FlatList
                styles={styles.container}
                data={players}
                renderItem={this.renderItem}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    }
});

const mapStateToProps = (state: RootStore) => {
    return {
        players: Array.from(state.players.players.values())
    };
};

export default connect(mapStateToProps)(ListPlayers);