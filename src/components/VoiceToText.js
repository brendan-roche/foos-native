/**
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    AppRegistry
} from 'react-native';
import Voice from 'react-native-voice';
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = {
    onError?: (error: string) => void,
    onToggleListening?: (listening: boolean) => void,
    onSpeech: (text: String[]) => void,
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
    listening: boolean
}

export default class VoiceToText extends Component<Props, State> {
    state = {
        recognized: false,
        pitch: '',
        error: '',
        end: false,
        started: false,
        results: [],
        partialResults: [],
        listening: false
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
        this._startRecognizing()
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevState.listening !== this.state.listening && this.props.onToggleListening) {
            this.props.onToggleListening(this.state.listening);
        }

        if (this.state.results.length > 0 && this.state.results !== prevState.results) {
            this.props.onSpeech(this.state.results)
        }

        if (this.state.started && prevState.started !== this.state.started && this.props.onSpeechStart) {
            this.props.onSpeechStart();
        }

        if (this.state.end && prevState.end !== this.state.end && this.props.onSpeechEnd) {
            this.props.onSpeechEnd();
        }

        if (this.state.error && prevState.error !== this.state.error && this.props.onError) {
            this.props.onError(this.state.error);
        }

    }

    componentWillUnmount() {
        Voice.destroy().then(Voice.removeAllListeners);
    }

    onSpeechStart(e) {
        this.setState({
            started: true
        });
    }

    onSpeechRecognized(e) {
        this.setState({
            recognized: true,
        });
    }

    onSpeechEnd(e) {
        this.setState({
            end: true,
        });
    }

    onSpeechError(e) {
        this.setState({
            error: JSON.stringify(e.error),
        });
    }

    onSpeechResults(e) {
        this.setState({
            results: e.value,
        });
    }

    onSpeechPartialResults(e) {
        this.setState({
            partialResults: e.value,
        });
    }

    onSpeechVolumeChanged(e) {
        this.setState({
            pitch: e.value,
        });
    }

    _startRecognizing = async () => {
        try {
            if (!this.state.started) {
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
                listening: true
            });
        } catch (e) {
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
            console.error(e);
        }
    };

    _cancelRecognizing = async (e) => {
        try {
            await Voice.cancel();
            this.setState({
                listening: false,
            });
        } catch (e) {
            console.error(e);
        }
    };

    _destroyRecognizer = async (e) => {
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
            console.error(e);
        }
    };

    startListening = () => {
        this._startRecognizing();
    };

    stopListening = () => {
        this._destroyRecognizer();
    };

    render() {
        const icon = this.state.listening ? 'microphone' : 'microphone-slash';
        const iconColour = this.state.listening ? '#900' : '#ccc';
        const callback = this.state.listening
            ? this.stopListening
            : this.startListening;

        return (
            <View style={styles.container}>
                <Icon name={icon} size={30} color={iconColour} onPress={callback}/>
                {this.state.listening && this.state.results.map((result, index) => {
                    return (
                        <Text
                            key={`result-${index}`}
                            style={styles.stat}>
                            {result}
                        </Text>
                    )
                })}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

AppRegistry.registerComponent('VoiceToText', () => VoiceNative);
