import Realm from 'realm'

export type ILeague = {
  _id: string,
  name: string,
}

class League extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'League',
    primaryKey: '_id',
    properties: {
      _id: 'objectId?',
      name: 'string?',
    },
  }
}

export default League
