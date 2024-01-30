import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import Reactotron from 'reactotron-react-native';

let scriptHostName;

if (__DEV__) {
  const scriptURL = NativeModules.SourceCode.scriptURL;
  scriptHostName = scriptURL.split('://')[1].split(':')[0];
}

Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({host: scriptHostName})
  .useReactNative()
  .connect();
