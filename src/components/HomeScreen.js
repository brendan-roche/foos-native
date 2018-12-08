import React, {Component} from 'react';
import { Button, View, Text } from 'react-native';
import {getPlayers} from '../reducers/playerReducer';
import {getTeams} from '../reducers/teamReducer';
import {getGames} from '../reducers/gameReducer';
import connect from 'react-redux/es/connect/connect';
import type {GamesType} from "../reducers/gameReducer";
import type {PlayersType} from "../reducers/playerReducer";
import type {TeamsType} from "../reducers/teamReducer";
import type {RootStore} from "../reducers";

type Props = {
    getPlayers: () => Object,
    getTeams: () => Object,
    getGames: () => Object,
    loading: boolean,
    error: string | null,
    players: PlayersType,
    teams: TeamsType,
    game: GamesType,
    navigation: any
}

class HomeScreen extends Component<Props> {

    componentDidMount() {
        if (this.props.players.size === 0) {
            this.props.getPlayers();
        }
        if (this.props.teams.size === 0) {
            this.props.getTeams();
        }
        if (this.props.games.size === 0) {
            this.props.getGames();
        }
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Home Screen</Text>
                <Button
                    title="New Game"
                    onPress={() => this.props.navigation.navigate('EditGame')}
                />

                <Button
                    title="List Players"
                    onPress={() => this.props.navigation.navigate('Players')}
                />
            </View>
        );
    }
}

const mapStateToProps = (state: RootStore) => {
    return {
        players: state.players.players,
        teams: state.teams.teams,
        games: state.games.games,
        loading: state.players.loading || state.games.loading || state.teams.loading,
        error: state.players.error || state.games.error || state.teams.error,
    };
};


const mapDispatchToProps = {
    getPlayers,
    getTeams,
    getGames,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
