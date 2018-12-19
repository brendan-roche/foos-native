// @flow
import React, {Component} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {connect} from 'react-redux';
import {Big} from 'big.js';

import type {RootStore} from '../reducers';
import type {GamesType, GameTeamType, IGame} from '../reducers/gameReducer';
import type {TeamsType} from '../reducers/teamReducer';
import {Col, Row, Rows, Table, TableWrapper} from 'react-native-table-component';
import type {PlayersType} from '../reducers/playerReducer';

type Props = {
    game: IGame,
    isNewGame: boolean,
    teams: TeamsType,
    players: PlayersType,
    games: GamesType,
    navigation: any
}

class ShowGame extends Component<Props> {
    findHeadToHead = (): IGame[] => {
        const { game } = this.props;
        const {team1, team2} = game;

        return Array.from(this.props.games.values()).filter(
            (g: IGame) => (this.isSameTeam(g.team1, team1) || this.isSameTeam(g.team1, team2))
                && (this.isSameTeam(g.team2, team1) || this.isSameTeam(g.team2, team2))
        )
    };

    isSameTeam(team1: GameTeamType, team2: GameTeamType): boolean {
        const t1Players =  [team1.defenderId, team1.attackerId];
        const t2Players =  [team2.defenderId, team2.attackerId];

        return t1Players.every(p => t2Players.includes(p));
    }

    render() {
        const {game, players, teams} = this.props;

        const {team1, team2} = game;
        const team1Defender = players.get(team1.defenderId).name;
        const team1Attacker = players.get(team1.attackerId).name;
        const team2Defender = players.get(team2.defenderId).name;
        const team2Attacker = players.get(team2.attackerId).name;
        const recentGames = this.findHeadToHead();
        let team1Wins = 0;
        let team2Wins = 0;
        recentGames.forEach((g: IGame) => {
            if ((this.isSameTeam(team1, g.team1) && g.team1.score > g.team2.score)
                || (this.isSameTeam(team1, g.team2) && g.team2.score > g.team1.score)
            ) {
                team1Wins++;
            } else {
                team2Wins++;
            }
        });
        const last5Games = recentGames.slice(recentGames.length - 6,recentGames.length - 1).reverse();
        const data = [
            [team1Defender, team2Defender],
            [team1Attacker, team2Attacker],
            [team1.score, team2.score],
            [Big(team1.elo).toFixed(2), Big(team2.elo).toFixed(2)],
            [Big(team1.ratingChange).toFixed(2), Big(team2.ratingChange).toFixed(2)],
            [Big(team1.trueskill).toFixed(2), Big(team2.trueskill).toFixed(2)],
            [Big(team1.trueskillSigma).toFixed(2), Big(team2.trueskillSigma).toFixed(2)],
            [Big(team1.trueskillChange).toFixed(2), Big(team2.trueskillChange).toFixed(2)],
            [team1Wins, team2Wins],
            [teams.get(team1.id).wins, teams.get(team2.id).wins],
            [teams.get(team1.id).losses, teams.get(team2.id).losses],
        ].concat(last5Games.map(g =>
            this.isSameTeam(g.team1, team1) ? [g.team1.score, g.team2.score] : [g.team2.score, g.team1.score]
        ));
        return (
            <View style={styles.container}>
                <Text style={styles.pageHeader}>Game {game.id}</Text>

                <Table>
                    <Row
                        data={['', 'Team 1', 'Team 2']}
                        flexArr={[1, 1, 1]}
                        style={styles.head}
                        textStyle={styles.text}
                    />
                    <TableWrapper style={styles.wrapper}>
                        <Col
                            data={
                                [
                                    'Defender',
                                    'Attacker',
                                    'Score',
                                    'Elo',
                                    'Elo +/-',
                                    'Trueskill',
                                    'Trueskill σ',
                                    'Trueskill +/-',
                                    'Head to Head',
                                    'Total Wins',
                                    'Total Losses'
                                ].concat(last5Games.map((g, i) => `Recent ${i + 1}`))
                            }
                            heightArr={[28, 28]}
                            style={styles.title}
                            textStyle={styles.text}
                        />
                        <Rows data={data} flexArr={[1, 1]} style={styles.row} textStyle={styles.text}/>
                    </TableWrapper>
                </Table>

                <Button
                    style={styles.button}
                    title="Home"
                    onPress={() => this.props.navigation.navigate('Home')}
                />
                <Button
                    style={styles.button}
                    title="Teams New Game"
                    onPress={
                        () => this.props.navigation.navigate(
                            'NewGame',
                            {
                                team1DefenderId: team1.defenderId,
                                team1AttackerId: team1.attackerId,
                                team2DefenderId: team2.defenderId,
                                team2AttackerId: team2.attackerId
                            }
                        )
                    }
                />
                <Button
                    style={styles.button}
                    title="Team 1 New Game"
                    onPress={
                        () => this.props.navigation.navigate(
                            'NewGame',
                            {
                                team1DefenderId: team1.defenderId,
                                team1AttackerId: team1.attackerId
                            }
                        )
                    }
                />
                <Button
                    style={styles.button}
                    title="Team 2 New Game"
                    onPress={
                        () => this.props.navigation.navigate(
                            'NewGame',
                            {
                                team2DefenderId: team2.defenderId,
                                team2AttackerId: team2.attackerId
                            }
                        )
                    }
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 16,
        paddingTop: 30,
        backgroundColor: '#fff',
        flexDirection: 'column',
        margin: 20,
    },
    pageHeader: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    head: {
        height: 40,
        backgroundColor: '#f1f8ff'
    },
    wrapper: {
        flexDirection: 'row'
    },
    title: {
        flex: 1,
        backgroundColor: '#f6f8fa',
        // justifyContent: 'left'
    },
    row: {
        height: 28
    },
    text: {
        textAlign: 'center',
        fontSize: 11
    },
    button: {
        // alignContent: 'right'
    }
});

const mapStateToProps = (state: RootStore) => {
    // Given the two selected players we need to look up the team, so we store a hash of two player id mapped to their
    // team id, so we can do an easy lookup
    return {
        players: state.players.players,
        teams: state.teams.teams,
        games: state.games.games,
    };
};

export default connect(mapStateToProps)(ShowGame);