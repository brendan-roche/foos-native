// @flow
import React, {Component} from 'react';
import {View, Text, Picker, Slider, StyleSheet, Button} from 'react-native';
import {connect} from 'react-redux';
import {produce} from 'immer';
import {Big} from 'big.js';

import {getPlayer} from '../reducers/playerReducer';
import {getTeam} from '../reducers/teamReducer';
import type {RootStore} from '../reducers';
import type {CreateGameTeamType, GameTeamType, ICreateGame, IGame} from '../reducers/gameReducer';
import {createGame, clearNewGame} from '../reducers/gameReducer';
import type {ITeam, TeamsType} from '../reducers/teamReducer';
import type {PlayersType} from '../reducers/playerReducer';
import { NavigationActions } from 'react-navigation';

type Props = {
    createGame: (game: ICreateGame) => Promise<Object>,
    reloadPlayersAndTeams: (team1: GameTeamType, team2: GameTeamType) => Promise<Object>,
    loading: boolean,
    error: string | null,
    players: PlayersType,
    playerTeams: number[][],
    teams: TeamsType,
    newGame: IGame | null,
    team1DefenderId?: number,
    team1AttackerId?: number,
    team2DefenderId?: number,
    team2AttackerId?: number,
    attackerId?: number,
    navigation: any
}

type State = ICreateGame;

class EditGame extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            team1: {
                defenderId: props.team1DefenderId || null,
                attackerId: props.team1AttackerId || null,
                score: 0,
            },
            team2: {
                defenderId: props.team2DefenderId || null,
                attackerId: props.team2AttackerId || null,
                score: 0,
            }
        };
    }

    componentDidUpdate(prevProps: Props) {
        const {newGame, reloadPlayersAndTeams, navigation} = this.props;
        if (!prevProps.newGame && newGame) {
            // after submitting a new game, reload players and teams with their new stats
            reloadPlayersAndTeams(newGame.team1, newGame.team2);
        }

        if (prevProps.newGame && !newGame) {
            navigation.reset([
                NavigationActions.navigate({
                    routeName: 'CompleteGame',
                    params: {game: prevProps.newGame}
                })], 0
            );
        }
    }

    renderPlayers = () => {
        const selected = [
            this.state.team1.attackerId,
            this.state.team1.defenderId,
            this.state.team2.attackerId,
            this.state.team2.defenderId,
        ].filter((item: number): Boolean => Boolean(item));

        const {players} = this.props;
        return [{id: 0, name: 'Select Player', active: true}]
            .concat(Array.from(players.values()))
            .filter(player => player.active || selected.indexOf(player.id) !== -1)
            .map(player => <Picker.Item
                    key={player.id}
                    label={player.name}
                    value={player.id}
                />
            );
    };

    updateTeamDefender = (team: CreateGameTeamType, newDefenderId: number): CreateGameTeamType =>
        produce(team, (draftTeam: CreateGameTeamType) => {
            draftTeam.defenderId = newDefenderId;
        });

    updateTeamAttacker = (team: CreateGameTeamType, newAttackerId: number): CreateGameTeamType =>
        produce(team, (draftTeam: CreateGameTeamType) => {
            draftTeam.attackerId = newAttackerId;
        });

    updateTeamScore = (team: CreateGameTeamType, newScore: number): CreateGameTeamType =>
        produce(team, (draftTeam: CreateGameTeamType) => {
            draftTeam.score = newScore;
        });

    updateTeam = (
        callback: (team: CreateGameTeamType, newValue: number) => CreateGameTeamType,
        team: 'team1' | 'team2'
    ) => {
        return (newValue: number) => {
            this.setState({
                [team]: callback(this.state[team], newValue)
            })
        };
    };

    findTeamFromPlayers(player1Id: number, player2Id: number): ITeam | null {
        const {playerTeams} = this.props;

        const teamId = (playerTeams[player1Id] && playerTeams[player1Id][player2Id]) ||
            (playerTeams[player2Id] && playerTeams[player2Id][player1Id]);
        return teamId ? this.props.teams.get(teamId) : null;
    }

    saveGame = () => {
        this.props.createGame(this.state);
    };

    isValidGame = () => {
        const {team1, team2} = this.state;
        return team1.defenderId && team1.attackerId && team2.defenderId && team2.attackerId
            && (team1.score > team2.score || team2.score > team1.score)
            && [...new Set([team1.defenderId, team2.attackerId, team2.defenderId, team1.attackerId])].length === 4;
    };

    renderTeam = (
        team: CreateGameTeamType,
        header: string,
        onDefenderChange: Function,
        onAttackerChange: Function,
        onScoreChange: Function,
    ) => {
        const players = this.renderPlayers();
        const t = team.defenderId && team.attackerId
            ? this.findTeamFromPlayers(team.defenderId, team.attackerId)
            : null;
        return (
            <View style={styles.teamContainer}>
                <Text style={styles.teamHeader}>{header + (t ? ' (' + Big(t.elo).toFixed(2) + ')' : '')}</Text>
                <View style={styles.playersHeader}>
                    <Text style={styles.playerSelectorLabel}>Defender</Text>
                    <Text style={styles.playerSelectorLabel}>Attacker</Text>
                </View>
                <View style={styles.playersRow}>
                    <Picker
                        selectedValue={team.defenderId}
                        style={styles.playerSelector}
                        itemStyle={styles.playerSelectorItem}
                        onValueChange={onDefenderChange}>
                        {players}
                    </Picker>
                    <Picker
                        selectedValue={team.attackerId}
                        style={styles.playerSelector}
                        itemStyle={styles.playerSelectorItem}
                        onValueChange={onAttackerChange}>
                        {players}
                    </Picker>
                </View>
                <Text style={styles.scoreLabel}>Score: {team.score}</Text>
                <Slider
                    style={styles.scoreSelector}
                    step={1}
                    value={team.score}
                    maximumValue={10}
                    minimumValue={0}
                    onValueChange={onScoreChange}
                ></Slider>
            </View>
        );
    };

    render() {
        const {team1, team2} = this.state;
        const {loading, error} = this.props;
        if (loading) {
            return <Text>Loading</Text>
        } else if (error) {
            return <Text>{error}</Text>
        }

        return (
            <View style={styles.container}>
                <Text style={styles.pageHeader}>New Game</Text>
                {this.renderTeam(
                    team1,
                    'Team 1',
                    this.updateTeam(this.updateTeamDefender, 'team1'),
                    this.updateTeam(this.updateTeamAttacker, 'team1'),
                    this.updateTeam(this.updateTeamScore, 'team1'),
                )}
                {this.renderTeam(
                    team2,
                    'Team 2',
                    this.updateTeam(this.updateTeamDefender, 'team2'),
                    this.updateTeam(this.updateTeamAttacker, 'team2'),
                    this.updateTeam(this.updateTeamScore, 'team2'),
                )}
                <Button
                    style={styles.saveButton}
                    title="Save Game"
                    disabled={!this.isValidGame()}
                    onPress={this.saveGame}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        margin: 20,
    },
    pageHeader: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    teamContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    teamHeader: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    playersHeader: {
        marginTop: 10,
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    playersRow: {
        flex: 5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    team2Container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#cccccc'
    },
    team2Players: {
        flex: 5,
        flexDirection: 'row'
    },
    playerSelectorLabel: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    playerSelector: {
        height: 132,
        width: 100,
    },
    playerSelectorItem: {
        height: 132,
        fontSize: 12,
    },
    scoreSelector: {},
    scoreLabel: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold'
    },
    homeButton: {
        // alignContent: 'right'
    }
});

const mapStateToProps = (state: RootStore) => {
    // Given the two selected players we need to look up the team, so we store a hash of two player id mapped to their
    // team id, so we can do an easy lookup
    const playerTeams = {};
    state.teams.teams.forEach((team, teamId) => {
        if (!playerTeams[team.player1Id]) {
            playerTeams[team.player1Id] = {};
        }
        playerTeams[team.player1Id][team.player2Id] = teamId;
    });

    return {
        players: state.players.players,
        teams: state.teams.teams,
        playerTeams: playerTeams,
        loading: state.players.loading || state.teams.loading || state.games.loading,
        error: state.players.error || state.teams.loading || state.games.error,
        newGame: state.games.newGameId ? state.games.games.get(state.games.newGameId) : null
    };
};

const mapDispatchToProps = dispatch => ({
    createGame: (game: ICreateGame) => dispatch(createGame(game)),
    reloadPlayersAndTeams: (team1: GameTeamType, team2: GameTeamType): Promise<Object> =>
        Promise.all([
            dispatch(getTeam(team1.id)),
            dispatch(getTeam(team2.id)),
            dispatch(getPlayer(team1.defenderId)),
            dispatch(getPlayer(team1.attackerId)),
            dispatch(getPlayer(team2.defenderId)),
            dispatch(getPlayer(team2.attackerId)),
        ]).then(() => {
            dispatch(clearNewGame())
        })
});

export default connect(mapStateToProps, mapDispatchToProps)(EditGame);