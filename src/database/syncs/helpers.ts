import fs from 'react-native-fs'

function logWithDate(message: string): void {
  const date = new Date()
  console.log(`[${date.toISOString()}] - ${message}\n`)
}

export function errorSync(realm, session, error) {
  if (realm !== undefined) {
    if (error.name === 'ClientReset') {
      const realmPath = realm.path

      realm.close()

      logWithDate(`Error ${error.message}, need to reset ${realmPath}…`)
      Realm.App.Sync.initiateClientReset(app, realmPath)
      logWithDate(`Creating backup from ${error.config.path}…`)

      // Move backup file to a known location for a restore
      // (it's async, but we don't care much to wait at this point)
      fs.moveFile(error.config.path, realmPath + '~')

      // Realm isn't valid anymore, notify user to exit
      realm = null
    } else {
      logWithDate(`Received error ${error.message}`)
    }
  }
}

export async function restoreRealm(realm, schemaNames) {
  if (!realm) { return }

  const backupPath = realm.path + '~'

  const backupExists = await fs.exists(backupPath)

  if (backupExists) {
    const backupRealm = await Realm.open({ path: backupPath, readOnly: true })
    for (let i = 0; i < schemaNames.length; i += 1) {
      const schemaName = schemaNames[i]
      // This is highly dependent on the structure of the data to recover
      const backupObjects = backupRealm.objects(schemaName)

      logWithDate(`Found ${backupObjects.length} ${schemaName} objects in ${backupPath}, proceeding to merge…`)

      realm.beginTransaction()
      backupObjects.forEach((element) => {
        realm.create(schemaName, element, 'modified')
      })
      realm.commitTransaction()
    }

    logWithDate(`Merge completed, deleting ${backupPath}…`)

    await fs.unlink(backupPath)
  }
}
