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


type Props = {};
export default class VoiceNative extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            recognized: false,
            pitch: '',
            error: '',
            end: false,
            started: false,
            results: [],
            partialResults: [],
        };
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

    onSpeechStart(e) {
        this.setState({
            started: true,
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

    async _startRecognizing(e) {
        this.setState({
            recognized: '',
            pitch: '',
            error: '',
            started: '',
            results: [],
            partialResults: [],
            end: ''
        });
        try {
            if (!this.state.started) {
                await Voice.start('en-AU');
            }
        } catch (e) {
            console.error(e);
        }
    }

    async _stopRecognizing(e) {
        try {
            await Voice.stop();
        } catch (e) {
            console.error(e);
        }
    }

    async _cancelRecognizing(e) {
        try {
            await Voice.cancel();
        } catch (e) {
            console.error(e);
        }
    }

    async _destroyRecognizer(e) {
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
            end: false
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

AppRegistry.registerComponent('VoiceNative', () => VoiceNative);
