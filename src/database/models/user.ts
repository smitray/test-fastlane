import Realm from 'realm'

export type IUser = {
  _id: string,
  email: string,
  type: string,
  avatar: string,
  name: string,
  isTermAccepted: boolean,
  isVerified: boolean,
  stripeCustomerId: string,
  profile: {
    bio: string,
    callDuration: number,
    callPrice: number,
    charityDonationPercentage: number,
    charityName: string,
    league: string,
    payoutAccountNumber: string,
    payoutRoutingNumber: string,
    socialHandle: string,
    zipCode: string
  },
}

export class Profile extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'User_profile',
    embedded: true,
    properties: {
      bio: 'string?',
      callDuration: 'int?',
      callPrice: 'int?',
      charityDonationPercentage: 'int?',
      charityName: 'string?',
      league: 'string?',
      payoutAccountNumber: 'string?',
      payoutRoutingNumber: 'string?',
      socialHandle: 'string?',
      zipCode: 'string?',
      leagueId: 'objectId?',
      sportId: 'objectId?',
    }
  }
}

class User extends Realm.Object {
  _id: string
  status: string
  name: string

  static schema: Realm.ObjectSchema = {
    name: 'User',
    primaryKey: '_id',
    properties: {
      _id: 'string?',
      email: 'string?',
      type: 'string?',
      avatar: 'string?',
      name: 'string?',
      isTermAccepted: 'bool?',
      isVerified: 'bool?',
      stripeCustomerId: 'string?',
      profile: 'User_profile', // Embed an of objects
    },
  }

  get fullname() {
    return this.name
  }
}

export default User
