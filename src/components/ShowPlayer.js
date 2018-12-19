// @flow
import React, {Component} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {connect} from 'react-redux';
import {Big} from 'big.js';

import type {RootStore} from '../reducers';
import type {PlayersType, IPlayer} from '../reducers/playerReducer';
import type {ITeam, TeamsType} from '../reducers/teamReducer';
import {Col, Rows, Table, TableWrapper} from 'react-native-table-component';
import type {GamesType, GameTeamType, IGame} from '../reducers/gameReducer';
import {NavigationActions} from "react-navigation";

type Props = {
    player: IPlayer,
    teams: TeamsType,
    games: GamesType,
    players: PlayersType,
    navigation: any
}

class ShowPlayer extends Component<Props> {
    goHome = () => {
        const {navigation} = this.props;
        navigation.reset([
            NavigationActions.navigate({
                routeName: 'Home',
            })], 0
        );
    };

    showGames = () => {
        const { player, navigation } = this.props;
        navigation.navigate(
            'NavToGames',
            {filter: (game: IGame) => isPartOfGame(player, game)}
        );
    };

    render() {
        const {player, games} = this.props;

        let donuts = 0;
        let winStreak = 0;
        let losingStreak = 0;
        let longestWinStreak = 0;
        let longestLosingStreak = 0;
        games.forEach((g: IGame) => {
            const isTeam1 = isPartOfGameTeam(player, g.team1);
            const isWin = (g.team1.score > g.team2.score && isTeam1)
                || (g.team2.score > g.team1.score && !isTeam1);

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
        const data = [
            [player.name],
            [Big(player.trueskill).toFixed(2)],
            [Big(player.trueskillSigma).toFixed(2)],
            [player.wins + player.losses],
            [player.wins],
            [player.losses],
            [donuts],
            [longestWinStreak],
            [longestLosingStreak],
        ];
        return (
            <View style={styles.container}>
                <Text style={styles.pageHeader}>{player.name}</Text>

                <Table>
                    <TableWrapper style={styles.wrapper}>
                        <Col
                            data={
                                [
                                    'Short Name',
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

function isPartOfGame(player: IPlayer, game: IGame): boolean {
    return isPartOfGameTeam(player, game.team1) || isPartOfGameTeam(player, game.team2);
}

function isPartOfTeam(player: IPlayer, team: ITeam): boolean {
    return team.player1Id === player.id || team.player2Id === player.id;
}

function isPartOfGameTeam(player: IPlayer, team: GameTeamType): boolean {
    return team.defenderId === player.id || team.attackerId === player.id;
}

const mapStateToProps = (state: RootStore, ownProps: Props) => {
    const {player} = ownProps;

    return {
        games: Array.from(state.games.games.values()).filter((game: IGame) => isPartOfGame(player, game)),
        teams: Array.from(state.teams.teams.values()).filter((team: ITeam) => isPartOfTeam(player, team)),
        players: state.players.players,
    };
};

export default connect(mapStateToProps)(ShowPlayer);