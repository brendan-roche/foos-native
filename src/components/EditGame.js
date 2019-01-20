/* eslint-disable react/no-unused-state */
// @flow
import React, { Component } from 'react';
import { Button, Picker, Slider, StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { produce } from 'immer';
import { NavigationActions } from 'react-navigation';
import { Big } from 'big.js';
import type { NavigationScreenProp, NavigationStateRoute } from 'react-navigation';
import AntDesign from 'react-native-vector-icons/AntDesign';

import type { PlayersType } from '../reducers/playerReducer';
import { getPlayer } from '../reducers/playerReducer';
import type { ITeam, TeamsType } from '../reducers/teamReducer';
import { getTeam } from '../reducers/teamReducer';
import type { RootStore } from '../reducers';
import type { CreateGameTeamType, GameTeamType, ICreateGame, IGame } from '../reducers/gameReducer';
import { clearNewGame, createGame } from '../reducers/gameReducer';
import VoiceToText from './VoiceToText';
import TranscodeGame from '../helpers/TranscodeGame';

type NumberHashType = { [key: number]: number };

type Props = {
  createGame: (game: ICreateGame) => Promise<Object>,
  reloadPlayersAndTeams: (team1: GameTeamType, team2: GameTeamType) => Promise<Object>,
  loading: boolean,
  error: string | null,
  players: PlayersType,
  playerTeams: { [key: number]: NumberHashType },
  teams: TeamsType,
  newGame: IGame | null,
  team1DefenderId?: number,
  team1AttackerId?: number,
  team2DefenderId?: number,
  team2AttackerId?: number,
  navigation: NavigationScreenProp<NavigationStateRoute>,
};

type State = ICreateGame & {
  speech: string,
  listening: boolean,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    margin: 20,
  },
  pageHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  teamHeader: {
    fontSize: 14,
    fontWeight: 'bold',
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
    backgroundColor: '#cccccc',
  },
  team2Players: {
    flex: 5,
    flexDirection: 'row',
  },
  playerSelectorLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerSelector: {
    height: 132,
    width: 150,
  },
  playerSelectorItem: {
    height: 132,
    fontSize: 12,
  },
  scoreSelector: {},
  scoreLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  homeButton: {
    // alignContent: 'right'
  },
  saveButton: {
    flex: 0,
    flexBasis: 50,
    height: 50,
    marginBottom: 20,
  },
  saveAndAddNewButton: {
    flex: 0,
    flexBasis: 50,
    height: 50,
  },
  speechToText: {
    flex: 0,
    flexBasis: 50,
    height: 50,
  },
});

class EditGame extends Component<Props, State> {
  // eslint-disable-next-line react/sort-comp
  voiceToText: VoiceToText | null;

  // eslint-disable-next-line react/sort-comp
  addNew = false;

  static navigationOptions = {
    headerTitle: (
      <AntDesign.Button
        name="team"
        backgroundColor="transparent"
        underlayColor="transparent"
        color="black"
      >
        <Text style={{ fontSize: 15 }}>New Game</Text>
      </AntDesign.Button>
    ),
  };

  static defaultProps = {
    team1DefenderId: undefined,
    team1AttackerId: undefined,
    team2DefenderId: undefined,
    team2AttackerId: undefined,
  };

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
      },
      speech: '',
      listening: true,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { newGame, reloadPlayersAndTeams, navigation } = this.props;
    if (!prevProps.newGame && newGame) {
      // after submitting a new game, reload players and teams with their new stats
      reloadPlayersAndTeams(newGame.team1, newGame.team2);
    }

    if (prevProps.newGame && !newGame) {
      if (this.addNew) {
        this.addNew = false;
      } else {
        const navAction = NavigationActions.navigate({
          routeName: 'ShowGame',
        });
        if (navigation.reset) {
          navigation.reset([navAction], 0);
        }
      }
    }
  }

  renderPlayers = () => {
    const { team1, team2 } = this.state;
    const selected = [
      team1.attackerId,
      team1.defenderId,
      team2.attackerId,
      team2.defenderId,
    ].filter((item: ?number): boolean => Boolean(item));

    const { players } = this.props;
    return [
      {
        id: 0,
        name: 'Select Player',
        active: true,
      },
    ]
      .concat(Array.from(players.values()))
      .filter(player => player.active || selected.indexOf(player.id) !== -1)
      .map(player => <Picker.Item key={player.id} label={player.name} value={player.id} />);
  };

  updateTeamDefender = (team: CreateGameTeamType, newDefenderId: number): CreateGameTeamType =>
    produce(team, (draft: CreateGameTeamType) => {
      draft.defenderId = newDefenderId;
    });

  updateTeamAttacker = (team: CreateGameTeamType, newAttackerId: number): CreateGameTeamType =>
    produce(team, (draft: CreateGameTeamType) => {
      draft.attackerId = newAttackerId;
    });

  updateTeamScore = (team: CreateGameTeamType, newScore: number): CreateGameTeamType =>
    produce(team, (draft: CreateGameTeamType) => {
      draft.score = newScore;
    });

  updateTeam = (
    callback: (team: CreateGameTeamType, newValue: number) => CreateGameTeamType,
    teamName: 'team1' | 'team2',
  ) => (newValue: number) => {
    const { team1, team2 } = this.state;
    const team = teamName === 'team1' ? team1 : team2;
    this.setState({
      [teamName]: callback(team, newValue),
    });
  };

  findTeamFromPlayers(player1Id: number, player2Id: number): ?ITeam {
    const { playerTeams, teams } = this.props;

    const teamId =
      (playerTeams[player1Id] && playerTeams[player1Id][player2Id]) ||
      (playerTeams[player2Id] && playerTeams[player2Id][player1Id]);
    return teamId ? teams.get(teamId) : null;
  }

  saveGame = () => {
    const { createGame: createGameFn } = this.props;
    const { team1, team2 } = this.state;
    createGameFn({ team1, team2 });
  };

  saveAndAddNew = () => {
    this.addNew = true;
    this.saveGame();
  };

  isValidGame = () => {
    const { team1, team2 } = this.state;
    return (
      team1.defenderId &&
      team1.attackerId &&
      team2.defenderId &&
      team2.attackerId &&
      team1.score != null &&
      team2.score != null &&
      (team1.score > team2.score || team2.score > team1.score) &&
      [...new Set([team1.defenderId, team2.attackerId, team2.defenderId, team1.attackerId])]
        .length === 4
    );
  };

  onSpeech = (results: string[]) => {
    const { players } = this.props;
    const speech = results.join(' ');
    const game = new TranscodeGame(Array.from(players.values())).transcode(speech);

    // If we have successfully transcoded the game we can stop listening
    if (game.team2 && game.team2.score && this.voiceToText) {
      this.voiceToText.stopListening();
    }
    this.setState({
      speech,
      ...game,
    });
  };

  onToggleListening = (listening: boolean) => {
    this.setState({ listening });
  };

  voiceToTextRef = (voiceToText: VoiceToText | null) => {
    this.voiceToText = voiceToText;
  };

  renderTeam = (
    team: CreateGameTeamType,
    header: string,
    onDefenderChange: Function,
    onAttackerChange: Function,
    onScoreChange: Function,
  ) => {
    const players = this.renderPlayers();
    const t =
      team.defenderId && team.attackerId
        ? this.findTeamFromPlayers(team.defenderId, team.attackerId)
        : null;
    return (
      <View style={styles.teamContainer}>
        <Text style={styles.teamHeader}>{header + (t ? ` (${Big(t.elo).toFixed(2)})` : '')}</Text>
        <View style={styles.playersHeader}>
          <Text style={styles.playerSelectorLabel}>Defender</Text>
          <Text style={styles.playerSelectorLabel}>Attacker</Text>
        </View>
        <View style={styles.playersRow}>
          <Picker
            selectedValue={team.defenderId}
            style={styles.playerSelector}
            itemStyle={styles.playerSelectorItem}
            onValueChange={onDefenderChange}
          >
            {players}
          </Picker>
          <Picker
            selectedValue={team.attackerId}
            style={styles.playerSelector}
            itemStyle={styles.playerSelectorItem}
            onValueChange={onAttackerChange}
          >
            {players}
          </Picker>
        </View>
        <Text style={styles.scoreLabel}>
          Score:
          {team.score}
        </Text>
        <Slider
          style={styles.scoreSelector}
          step={1}
          value={team.score}
          maximumValue={10}
          minimumValue={0}
          onValueChange={onScoreChange}
        />
      </View>
    );
  };

  render() {
    const { team1, team2 } = this.state;
    const { loading, error } = this.props;
    if (loading) {
      return <Text>Loading</Text>;
    }
    if (error) {
      return <Text>{error}</Text>;
    }

    return (
      <View style={styles.container}>
        <VoiceToText
          ref={this.voiceToTextRef}
          onSpeech={this.onSpeech}
          onToggleListening={this.onToggleListening}
          style={styles.speechToText}
        />
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
        <Button
          style={styles.saveAndAddNewButton}
          title="Save & Add New"
          disabled={!this.isValidGame()}
          onPress={this.saveGame}
        />
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  createGame: (game: ICreateGame) => dispatch(createGame(game)),
  reloadPlayersAndTeams: (team1: GameTeamType, team2: GameTeamType): Promise<Object> => {
    const { defenderId: t1DefId, attackerId: t1AtkId } = team1;
    const { defenderId: t2DefId, attackerId: t2AtkId } = team2;
    if (t1AtkId && t1DefId && t2AtkId && t2DefId) {
      return Promise.all([
        dispatch(getTeam(team1.id)),
        dispatch(getTeam(team2.id)),
        dispatch(getPlayer(t1DefId)),
        dispatch(getPlayer(t1AtkId)),
        dispatch(getPlayer(t2DefId)),
        dispatch(getPlayer(t2AtkId)),
      ]).then(() => {
        dispatch(clearNewGame());
      });
    }

    return Promise.resolve();
  },
});

const mapStateToProps = (state: RootStore, ownProps: Props): $Shape<Props> => {
  // Given the two selected players we need to look up the team,
  // so we store a hash of two player id mapped to their
  // team id, so we can do an easy lookup
  const playerTeams = {};
  state.teams.teams.forEach((team, teamId) => {
    if (!playerTeams[team.player1Id]) {
      playerTeams[team.player1Id] = {};
    }
    playerTeams[team.player1Id][team.player2Id] = teamId;
  });

  return {
    ...(ownProps.navigation.state.params ? ownProps.navigation.state.params : {}),
    players: state.players.players,
    teams: state.teams.teams,
    playerTeams,
    loading: state.players.loading || state.teams.loading || state.games.loading,
    error: state.players.error || state.teams.error || state.games.error,
    newGame: state.games.newGameId ? state.games.games.get(state.games.newGameId) : null,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EditGame);
