// @flow
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// To get Reactotron working on Android device (not emulator) update `host` with
// host computer ip address, and run:
// adb reverse tcp:9090 tcp:9090
// https://github.com/infinitered/reactotron/issues/162

const config =
  // eslint-disable-next-line no-undef
  __DEV__ && Platform.OS === 'android' && DeviceInfo.isEmulator()
    ? {
        enabled: true,
        host: '192.168.1.40', // server ip, replace with host ip address
        port: 9090,
      }
    : {};

const reactotron = Reactotron.configure()
  .use(reactotronRedux())
  .useReactNative()
  .connect(config); // let's connect!

export default reactotron;
