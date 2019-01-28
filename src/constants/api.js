import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

let apiBaseUrl;

// eslint-disable-next-line
if (__DEV__) {
  apiBaseUrl =
    Platform.OS === 'android' && DeviceInfo.isEmulator()
      ? 'http://10.0.2.2:5000'
      : 'http://localhost:5000';
} else {
  apiBaseUrl = 'http://foos.test.kounta.com';
}

// eslint-disable-next-line import/prefer-default-export
export const API_BASE_URL = apiBaseUrl;
