import Realm from 'realm'

export type ISport = {
  _id: string,
  name: string,
}

class Sport extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'Sport',
    primaryKey: '_id',
    properties: {
      _id: 'objectId?',
      name: 'string?',
    },
  }
}

export default Sport
