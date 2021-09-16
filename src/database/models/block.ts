import Realm from 'realm'

export type IBlock = {
  _id: string,
  userId: string,
  blockedUserId: string,
}

class Block extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'Block',
    primaryKey: '_id',
    properties: {
      _id: 'objectId?',
      userId: 'string?',
      blockedUserId: 'string?',
    },
  }
}

export default Block
