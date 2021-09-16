import Realm from 'realm'

export type ISchoolTeam = {
  _id: string,
  name: string,
}

class SchoolTeam extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'SchoolTeam',
    primaryKey: '_id',
    properties: {
      _id: 'objectId?',
      name: 'string?',
    },
  }
}

export default SchoolTeam
