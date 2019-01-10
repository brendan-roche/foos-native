/* eslint-disable react/no-unused-prop-types,react/no-unused-state */
/**
 * @format
 * @flow
 */
import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import Voice from 'react-native-voice';
import Icon from 'react-native-vector-icons/FontAwesome';

type VoiceEvent = {
  error: string,
  value: string[],
};

type VolumeVoiceEvent = {
  value: string,
} & VoiceEvent;

type Props = {
  onError?: (error: string) => void,
  onToggleListening?: (listening: boolean) => void,
  onSpeech: (text: string[]) => void,
  onSpeechStart?: () => void,
  onSpeechEnd?: () => void,
  stopListening?: () => void,
  startListening?: () => void,
};

type State = {
  recognized: boolean,
  pitch: string,
  error: string,
  end: boolean,
  started: boolean,
  results: string[],
  partialResults: string[],
  listening: boolean,
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class VoiceToText extends Component<Props, State> {
  state = {
    recognized: false,
    pitch: '',
    error: '',
    end: false,
    started: false,
    results: [],
    partialResults: [],
    listening: false,
  };

  static defaultProps = {
    onError: undefined,
    onToggleListening: undefined,
    onSpeechStart: undefined,
    onSpeechEnd: undefined,
    stopListening: undefined,
    startListening: undefined,
  };

  constructor(props: Props) {
    super(props);
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged.bind(this);
    this.startRecognizing();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { started, listening, results, end, error } = this.state;
    const { onToggleListening, onSpeech, onSpeechStart, onSpeechEnd, onError } = this.props;

    if (prevState.listening !== listening && onToggleListening) {
      onToggleListening(listening);
    }

    if (results.length > 0 && results !== prevState.results) {
      onSpeech(results);
    }

    if (started && prevState.started !== started && onSpeechStart) {
      onSpeechStart();
    }

    if (end && prevState.end !== end && onSpeechEnd) {
      onSpeechEnd();
    }

    if (error && prevState.error !== error && onError) {
      onError(error);
    }
  }

  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
  }

  onSpeechStart() {
    this.setState({
      started: true,
    });
  }

  onSpeechRecognized() {
    this.setState({
      recognized: true,
    });
  }

  onSpeechEnd() {
    this.setState({
      end: true,
    });
  }

  onSpeechError(e: VoiceEvent) {
    this.setState({
      error: JSON.stringify(e.error),
    });
  }

  onSpeechResults(e: VoiceEvent) {
    this.setState({
      results: e.value,
    });
  }

  onSpeechPartialResults(e: VoiceEvent) {
    this.setState({
      partialResults: e.value,
    });
  }

  onSpeechVolumeChanged(e: VolumeVoiceEvent) {
    this.setState({
      pitch: e.value,
    });
  }

  startRecognizing = async () => {
    try {
      const { started } = this.state;
      if (!started) {
        await Voice.start('en-AU');
      }
      this.setState({
        recognized: false,
        pitch: '',
        error: '',
        started: true,
        results: [],
        partialResults: [],
        end: false,
        listening: true,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  _stopRecognizing = async () => {
    try {
      await Voice.stop();
      this.setState({
        listening: false,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  _cancelRecognizing = async () => {
    try {
      await Voice.cancel();
      this.setState({
        listening: false,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  destroyRecognizer = async () => {
    try {
      await Voice.destroy();
      this.setState({
        recognized: false,
        pitch: '',
        error: '',
        started: false,
        results: [],
        partialResults: [],
        end: false,
        listening: false,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  startListening = () => {
    this.startRecognizing();
  };

  stopListening = () => {
    this.destroyRecognizer();
  };

  render() {
    const { listening, results } = this.state;
    const icon = listening ? 'microphone' : 'microphone-slash';
    const iconColour = listening ? '#900' : '#ccc';
    const callback = listening ? this.stopListening : this.startListening;

    return (
      <View style={styles.container}>
        <Icon name={icon} size={30} color={iconColour} onPress={callback} />
        {listening &&
          results.map((result, index) => (
            <Text
              /* eslint-disable-next-line react/no-array-index-key */
              key={`${index}:${result}`}
            >
              {result}
            </Text>
          ))}
      </View>
    );
  }
}

AppRegistry.registerComponent('VoiceToText', () => VoiceToText);
