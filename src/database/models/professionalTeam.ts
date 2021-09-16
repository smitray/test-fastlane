import Realm from 'realm'

export type IProfessionalTeam = {
  _id: string,
  name: string,
}

class ProfessionalTeam extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'ProfessionalTeam',
    primaryKey: '_id',
    properties: {
      _id: 'objectId?',
      name: 'string?',
    },
  }
}

export default ProfessionalTeam
