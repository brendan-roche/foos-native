/**
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    AppRegistry,
    TouchableHighlight,
} from 'react-native';
import Voice from 'react-native-voice';

type VoiceEvent = {
    error: string,
    value: string[],
};

type VolumeVoiceEvent = {
    value: string,
} & VoiceEvent;

type Props = {};

type State = {
    recognized: boolean,
    pitch: string,
    error: string,
    end: boolean,
    started: boolean,
    results: string[],
    partialResults: string[],
};

class VoiceNative extends Component<Props, State> {
    state = {
        recognized: false,
        pitch: '',
        error: '',
        end: false,
        started: false,
        results: [],
        partialResults: [],
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

    async _startRecognizing() {
        this.setState({
            recognized: false,
            pitch: '',
            error: '',
            started: true,
            results: [],
            partialResults: [],
            end: false,
        });
        try {
            if (!this.state.started) {
                await Voice.start('en-AU');
            }
        } catch (e) {
            console.error(e);
        }
    }

    async _stopRecognizing() {
        try {
            await Voice.stop();
        } catch (e) {
            console.error(e);
        }
    }

    async _cancelRecognizing() {
        try {
            await Voice.cancel();
        } catch (e) {
            console.error(e);
        }
    }

    async _destroyRecognizer() {
        try {
            await Voice.destroy();
        } catch (e) {
            console.error(e);
        }
        this.setState({
            recognized: false,
            pitch: '',
            error: '',
            started: false,
            results: [],
            partialResults: [],
            end: false,
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Welcome to React Native Voice!
                </Text>
                <Text style={styles.instructions}>
                    Press the button and start speaking.
                </Text>
                <Text
                    style={styles.stat}>
                    {`Started: ${(this.state.started) ? '√' : ''}`}
                </Text>
                <Text
                    style={styles.stat}>
                    {`Recognized: ${(this.state.recognized ? '√' : '')}`}
                </Text>
                <Text
                    style={styles.stat}>
                    {`Pitch: ${this.state.pitch}`}
                </Text>
                <Text
                    style={styles.stat}>
                    {`Error: ${this.state.error}`}
                </Text>
                <Text
                    style={styles.stat}>
                    Results
                </Text>
                {this.state.results.map((result, index) => {
                    return (
                        <Text
                            key={`result-${index}`}
                            style={styles.stat}>
                            {result}
                        </Text>
                    )
                })}
                <Text
                    style={styles.stat}>
                    Partial Results
                </Text>
                {this.state.partialResults.map((result, index) => {
                    return (
                        <Text
                            key={`partial-result-${index}`}
                            style={styles.stat}>
                            {result}
                        </Text>
                    )
                })}
                <Text
                    style={styles.stat}>
                    {`End: ${(this.state.end ? '√' : '')}`}
                </Text>
                <TouchableHighlight onPress={this._startRecognizing.bind(this)}>
                    <Image
                        style={styles.button}
                        source={require('./button.png')}
                    />
                </TouchableHighlight>
                <TouchableHighlight onPress={this._stopRecognizing.bind(this)}>
                    <Text
                        style={styles.action}>
                        Stop Recognizing
                    </Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={this._cancelRecognizing.bind(this)}>
                    <Text
                        style={styles.action}>
                        Cancel
                    </Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={this._destroyRecognizer.bind(this)}>
                    <Text
                        style={styles.action}>
                        Destroy
                    </Text>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        width: 50,
        height: 50,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    action: {
        textAlign: 'center',
        color: '#0000FF',
        marginVertical: 5,
        fontWeight: 'bold',
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    stat: {
        textAlign: 'center',
        color: '#B0171F',
        marginBottom: 1,
    },
});

export default VoiceNative;

AppRegistry.registerComponent('VoiceNative', () => VoiceNative);
