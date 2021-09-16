import Realm from 'realm'

class Call extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'Call',
    primaryKey: '_id',
    properties: {
      _id: 'objectId?',
      partitionKey: 'string?',
      attemptedCount: 'int?',
      callEndedBy: 'string?',
      completedAt: 'double?',
      compositionVideoResult: 'string?',
      compositionVideoStatus: 'string?',
      createdAt: 'int?',
      createdBy: 'string?',
      endReason: 'string?',
      endedAt: 'int?',
      errorCount: 'int?',
      fanVideoIntroduceURL: 'string?',
      isAthleteInCall: 'bool?',
      isCallEnded: 'bool?',
      isFanInCall: 'bool?',
      isSendPushNotification: 'bool?',
      meetAthlete: 'string?',
      message: 'string?',
      price: 'int?',
      status: 'string?',
      twilioCallId: 'string?',
      videoURL: 'string?',
    },
  }
}

export default Call
