import Realm from 'realm'

export type IPublicAthleteProfile = {
  _id: string,
  email: string,
  avatar: string,
  name: string,
  bio: string,
  callDuration: number,
  callPrice: number,
  priority: number,
  charityDonationPercentage: number,
  charityName: string,
  socialHandle: string,
  leagueId: string,
  sportId: string,
}

class PublicAthleteProfile extends Realm.Object {
  _id: string

  static schema: Realm.ObjectSchema = {
    name: 'PublicAthleteProfile',
    primaryKey: '_id',
    properties: {
      _id: 'string?',
      email: 'string?',
      avatar: 'string?',
      name: 'string?',
      bio: 'string?',
      callDuration: 'int?',
      priority: 'int?',
      callPrice: 'int?',
      charityDonationPercentage: 'int?',
      charityName: 'string?',
      socialHandle: 'string?',
      leagueId: 'objectId?',
      sportId: 'objectId?',
    },
  }
}

export default PublicAthleteProfile
