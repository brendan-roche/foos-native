// @flow
import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, TouchableOpacity, RefreshControl} from 'react-native';
import {connect} from 'react-redux';
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';

import type {RootStore} from '../reducers';
import type {IGame} from '../reducers/gameReducer';
import {getGames} from '../reducers/gameReducer';
import type {TeamsType} from '../reducers/teamReducer';

type Props = {
    players: TeamsType,
    games: IGame[],
    loading: boolean,
    filter?: (game: IGame) => boolean,
}

type State = {
    dataProvider: DataProvider,
    sortCol: string,
    sortAsc: boolean,
}

const ViewTypes = {
    ODD: 1,
    EVEN: 2,
};

type DimensionsType = {
    width: number,
    height: number
}

class ListGames extends Component<Props, State> {
    recyclerView: RecyclerListView;

    constructor(props: Props) {
        super(props);

        let { width } = Dimensions.get('window');

        // Create the data provider and provide method which takes in two rows of data
        // and return if those two are different or not.
        // THIS IS VERY IMPORTANT, FORGET PERFORMANCE IF THIS IS MESSED UP
        let dataProvider = new DataProvider((r1, r2) => {
            return r1 !== r2;
        });

        this._layoutProvider = new LayoutProvider(
            (index: number): number => {
                return index % 2 === 0
                    ? ViewTypes.EVEN
                    : ViewTypes.ODD;
            },
            (type: number, dim: DimensionsType) => {
                dim.width = width;
                dim.height = 35;
            }
        );

        // Since component should always render once data has changed, make data provider part of the state
        this.state = {
            dataProvider: dataProvider.cloneWithRows(this.props.games),
            sortCol: 'name',
            sortAsc: true,
        };
    }

    showGame = (game: IGame) => {
        return () => {
            this.props.navigation.navigate(
                'ShowGame',
                {game}
            );
        }
    };

    _rowRenderer = (type: number, game: IGame) => {
        const { players } = this.props;
        const {team1, team2} = game;
        return (
            <>
                <TouchableOpacity
                    style={type === ViewTypes.EVEN ? styles.rowEven : styles.rowOdd}
                    onPress={this.showGame(game)}
                >
                    <Text style={styles.nameCol}>{players.get(team1.defenderId).name}</Text>
                    <Text style={styles.nameCol}>{players.get(team1.attackerId).name}</Text>
                    <Text style={styles.scoreCol}>{team1.score}</Text>
                    <Text style={styles.nameCol}>{players.get(team2.defenderId).name}</Text>
                    <Text style={styles.nameCol}>{players.get(team2.attackerId).name}</Text>
                    <Text style={styles.scoreCol}>{team2.score}</Text>
                </TouchableOpacity>
            </>
        );
    };

    listViewRef = (ref: RecyclerListView) => {
        this.recyclerView = ref
    };

    render() {
        return <>
            <View style={styles.rowHeader}>
                <Text
                    style={styles.nameHeader}
                >Defender</Text>
                <Text
                    style={styles.nameHeader}
                >Attacker</Text>
                <Text
                    style={styles.scoreHeader}
                >Score</Text>
                <Text
                    style={styles.nameHeader}
                >Defender</Text>
                <Text
                    style={styles.nameHeader}
                >Attacker</Text>
                <Text
                    style={styles.scoreHeader}
                >Score</Text>
            </View>
            <RecyclerListView
                ref={this.listViewRef}
                canChangeSize
                scrollViewProps={{
                    refreshControl:
                        <RefreshControl
                            refreshing={this.props.loading}
                            onRefresh={this.props.getGames}
                        />
                }}
                layoutProvider={this._layoutProvider}
                dataProvider={this.state.dataProvider}
                rowRenderer={this._rowRenderer}
            />
        </>;
    }
}

const styles = StyleSheet.create({
    rowHeader: {
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: 'row',
        backgroundColor: '#ffbb00',
        height: 40,
    },
    rowEven: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#00BFFF',
    },
    rowOdd: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#ffffff',
    },
    nameHeader: {
        marginLeft: 5,
        flex: 1.4,
        fontWeight: 'bold',
        fontSize: 11,
    },
    scoreHeader: {
        flex: 0.7,
        fontWeight: 'bold',
        fontSize: 11,
    },
    nameCol: {
        marginLeft: 5,
        flex: 1.4,
        fontSize: 11,
    },
    scoreCol: {
        flex: 0.7,
        fontSize: 11,
    },
});

const mapStateToProps = (state: RootStore, ownProps: Props) => {
    let games = Array.from(state.games.games.values());
    if (ownProps.filter) {
        games = games.filter(ownProps.filter);
    }
    return {
        loading: state.games.loading,
        players: state.players.players,
        games,
    };
};

const mapDispatchToProps = {
    getGames,
};


export default connect(mapStateToProps, mapDispatchToProps)(ListGames);