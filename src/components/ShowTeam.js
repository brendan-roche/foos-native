// @flow
import React, {Component} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {connect} from 'react-redux';
import {Big} from 'big.js';
import {NavigationActions} from 'react-navigation';

import type {RootStore} from '../reducers';
import type {ITeam} from '../reducers/teamReducer';
import {Col, Rows, Table, TableWrapper} from 'react-native-table-component';
import type {GamesType, IGame} from '../reducers/gameReducer';
import type {PlayersType} from '../reducers/playerReducer';

type Props = {
    team: ITeam,
    games: GamesType,
    players: PlayersType,
    navigation: any
}

class ShowTeam extends Component<Props> {
    goHome = () => {
        const {navigation} = this.props;
        navigation.reset([
            NavigationActions.navigate({
                routeName: 'Home',
            })], 0
        );
    };

    showGames = () => {
        const { team, navigation } = this.props;
        navigation.navigate(
            'NavToGames',
            {filter: (game: IGame) => isPartOfGame(team, game)}
        );
    };

    render() {
        const {team, games, players} = this.props;

        let donuts = 0;
        let winStreak = 0;
        let losingStreak = 0;
        let longestWinStreak = 0;
        let longestLosingStreak = 0;
        games.forEach((g: IGame) => {
            const isTeam1 = team.id === g.team1.id;
            const isWin = g.team1.score != null && g.team2.score != null && ((g.team1.score > g.team2.score && isTeam1)
                || (g.team2.score > g.team1.score && !isTeam1));

            if ((g.team1.score === 0 && isTeam1)
                || (g.team2.score === 0 && !isTeam1)
            ) {
                donuts++;
            }

            if (isWin) {
                winStreak++;
                losingStreak = 0;
                if (winStreak > longestWinStreak) {
                    longestWinStreak = winStreak;
                }
            } else {
                losingStreak++;
                winStreak = 0;
                if (losingStreak > longestLosingStreak) {
                    longestLosingStreak = losingStreak;
                }
            }
        });
        const p1 = players.get(team.player1Id);
        const p2 = players.get(team.player2Id);
        const p1Name = (p1 && p1.name) || '';
        const p2Name = (p2 && p2.name) || '';
        const data = [
            [p1Name],
            [p2Name],
            [Big(team.elo).toFixed(2)],
            [Big(team.trueskill).toFixed(2)],
            [Big(team.trueskillSigma).toFixed(2)],
            [team.wins + team.losses],
            [team.wins],
            [team.losses],
            [donuts],
            [longestWinStreak],
            [longestLosingStreak],
        ];
        return (
            <View style={styles.container}>
                <Text style={styles.pageHeader}>{p1Name + ' & ' + p2Name}</Text>

                <Table>
                    <TableWrapper style={styles.wrapper}>
                        <Col
                            data={
                                [
                                    'Player 1',
                                    'Player 2',
                                    'Elo',
                                    'Trueskill',
                                    'Trueskill σ',
                                    'Total Games',
                                    'Total Wins',
                                    'Total Losses',
                                    'Donuts',
                                    'Winning Streak',
                                    'Losing Streak',
                                ]
                            }
                            heightArr={[28, 28]}
                            style={styles.title}
                            textStyle={styles.text}
                        />
                        <Rows data={data} flexArr={[1]} style={styles.row} textStyle={styles.text}/>
                    </TableWrapper>
                </Table>

                <Button
                    style={styles.button}
                    title="Show Games"
                    onPress={this.showGames}
                />

                <Button
                    style={styles.button}
                    title="Home"
                    onPress={this.goHome}
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

function isPartOfGame(team: ITeam, game: IGame): boolean {
    return team.id === game.team1.id || team.id === game.team2.id;
}

const mapStateToProps = (state: RootStore, ownProps: Props) => {
    const {team} = ownProps;

    return {
        games: Array.from(state.games.games.values()).filter((game: IGame) => isPartOfGame(team, game)),
        players: state.players.players,
    };
};

export default connect(mapStateToProps)(ShowTeam);
