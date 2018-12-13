import React, {Component} from 'react';
import {View, findNodeHandle, Image, StyleSheet} from 'react-native';
import {BlurView} from 'react-native-blur';
import Icon from 'react-native-vector-icons/FontAwesome';
import {getPlayers} from '../reducers/playerReducer';
import {getTeams} from '../reducers/teamReducer';
import {getGames} from '../reducers/gameReducer';
import connect from 'react-redux/es/connect/connect';
import type {RootStore} from '../reducers';

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

type State = {
    viewRef: BlurView | null
}

class HomeScreen extends Component<Props, State> {
    backgroundImage: Image;

    state = { viewRef: null };

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

    imageLoaded = () => {
        this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
    };

    render() {
        return (
            <View style={styles.container}>
                <Image
                    ref={(img) => { this.backgroundImage = img; }}
                    source={require('../../assets/images/foosball-1.jpg')}
                    style={styles.backgroundImage}
                    onLoadEnd={this.imageLoaded}
                />
                <BlurView
                    style={styles.backgroundImage}
                    viewRef={this.state.viewRef}
                    blurType="light"
                    blurAmount={5}
                />

                <Icon.Button
                    name="plus"
                    onPress={() => this.props.navigation.navigate('EditGame')}
                    style={styles.button}
                    marginBottom={10}
                    backgroundColor='transparent'
                >
                    New Game
                </Icon.Button>

                <Icon.Button
                    name="users"
                    onPress={() => this.props.navigation.navigate('Players')}
                    style={styles.button}
                >
                    List Players
                </Icon.Button>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        position: "absolute",
        width: '100%',
        height: '100%',
    },
    button: {
        backgroundColor: '#00BFFF',
        paddingBottom: 10,
    }
});

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
