// @flow
import React, {Component} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {connect} from 'react-redux';

import {getPlayers} from '../reducers/playerReducer';
import type {RootStore} from "../reducers";

type Props = {
    getPlayers: () => Object
}

class ListPlayers extends Component<Props> {
    componentDidMount() {
        this.props.getPlayers();
    }

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
    let storedPlayers = Object.values(state.players.players).map(player => ({key: String(player.id), ...player}));
    return {
        players: storedPlayers
    };
};

const mapDispatchToProps = {
    getPlayers
};

export default connect(mapStateToProps, mapDispatchToProps)(ListPlayers);