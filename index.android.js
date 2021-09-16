import 'react-native-get-random-values'
import { AppRegistry } from 'react-native'
import App from './src/app.tsx'
import { name as appName } from './app.json'

AppRegistry.registerComponent(appName, () => App)

AppRegistry.registerHeadlessTask('RNCallKeepBackgroundMessage', () => ({ name, callUUID, handle }) => {
  // Make your call here

  return Promise.resolve()
})
