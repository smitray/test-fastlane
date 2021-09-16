import Realm from 'realm'
import { REALM_APP_ID } from '@env'

let app
export function getRealmApp() {
  if (app === undefined) {
    const appId = REALM_APP_ID
    const appConfig = {
      id: appId,
      timeout: 30000,
      app: {
        name: 'default',
        version: '1',
      },
    }
    app = new Realm.App(appConfig)
    Realm.App.Sync.setLogLevel(app, "debug")
  }
  return app
}

export function getRealmInstance() {
  return Realm.App.getApp(REALM_APP_ID)
}
