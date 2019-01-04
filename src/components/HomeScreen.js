import React, {Component} from 'react';
import {View, findNodeHandle, Image, StyleSheet, Text} from 'react-native';
import {BlurView} from 'react-native-blur';
import Spinner from 'react-native-loading-spinner-overlay';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
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
        const { loading, error, navigation } = this.props;
        const { viewRef } = this.state;

        if (error) {
            return <Text>{error}</Text>
        }

        return (
            <View style={styles.container}>

                { <Spinner
                    visible={loading}
                    textContent={'Loading...'}
                    textStyle={styles.spinnerTextStyle}
                /> }
                <Image
                    ref={(img) => { this.backgroundImage = img; }}
                    source={require('../../assets/images/foosball-1.jpg')}
                    style={styles.backgroundImage}
                    onLoadEnd={this.imageLoaded}
                />
                {viewRef && <BlurView
                    style={styles.backgroundImage}
                    viewRef={viewRef}
                    blurType="light"
                    blurAmount={5}
                />
                }

                {!loading && <FontAwesome.Button
                    name="plus"
                    onPress={() => navigation.navigate('EditGame')}
                    style={styles.button}
                    marginBottom={10}
                    backgroundColor='transparent'
                >
                    New Game
                </FontAwesome.Button>
                }

                {!loading && <FontAwesome.Button
                    name="users"
                    onPress={() => this.props.navigation.navigate('Players')}
                    marginBottom={10}
                    style={styles.button}
                    backgroundColor='transparent'
                >
                    Show Players
                </FontAwesome.Button>
                }

                {!loading && <FontAwesome.Button
                    name="soccer-ball-o"
                    onPress={() => this.props.navigation.navigate('Games')}
                    style={styles.button}
                    marginBottom={10}
                    backgroundColor='transparent'
                >
                    Show Games
                </FontAwesome.Button>
                }

                {!loading && <AntDesign.Button
                    name="team"
                    onPress={() => this.props.navigation.navigate('Teams')}
                    style={styles.button}
                    backgroundColor='transparent'
                >
                    Show Teams
                </AntDesign.Button>
                }

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
    },
    spinnerTextStyle: {
        color: '#FFF'
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
