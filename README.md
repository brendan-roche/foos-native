# foos-native


## Requirements
 - node >= 8.3
 - Foos REST API

## Setup

The first step would be to clone this project
Clone this project, and install npm dependencies with yarn
```
git clone git@github.com:brendan-roche/foos-native.git
cd foos-native
yarn
```

### Foos REST Api
During development you would need to have setup the Foos API on your local dev env:

https://github.com/brendan-roche/foos

You can change the base url the REST API points to in
```
src/constants/api.js
```

By default it points to `http://localhost:5000`

The Live REST API is `http://foos.test.kounta.com`

### React Native
Then get react-native setup within your local environment.
Follow instructions for "Building Projects with Native Code", not using Expo:

https://facebook.github.io/react-native/docs/getting-started.html

Install `watchman`, and optionally install / upgrade `node` so it is > 8.3 via brew:
```
brew install node
brew install watchman
```

Install react-native CLI
```
npm install -g react-native-cli
```


### IOS

Install Xcode and Command Line Tools

Run the IOS simulator
```
react-native run-ios
``` 

### Android

Install Java Development Kit

http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html

Install Android Studio with custom setup
 - Android SDK
 - Android SDK Platform
 - Performance (Intel ® HAXM)
 - Android Virtual Device

Install the Android SDK with Android 8.1 (Oreo) SDK
 - Android SDK Platform 27
 - Intel x86 Atom_64 System Image or Google APIs Intel x86 Atom System Image


Configure the ANDROID_HOME environment variable

Add the following lines to your `$HOME/.bash_profile` config file:
```
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Create a new Android Virtual Device using Android Studio:
https://developer.android.com/studio/run/managing-avds.html

If you don't have HAXM installed, follow [these instructions](https://github.com/intel/haxm/wiki/Installation-Instructions-on-macOS)  to set it up, then go back to the AVD Manager.

Run the Android simulator
```
react-native run-android
```