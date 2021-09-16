import {
  SetupProfileParams,
  UserUpdateProfileParams,
} from '@src/database/types'
import { isNil, pickBy, isNaN, merge } from '@src/utils/lodash'
import User, { Profile, IUser } from '@src/database/models/user'
import Block from '@src/database/models/block'

import { errorSync, restoreRealm } from '../syncs/helpers'

let realm = null
const OpenRealmBehaviorConfiguration = {
  type: 'openImmediately',
}
export const setupSyncProfile = async ({ user, listener }: SetupProfileParams): Promise<Realm> => {
  const { profileChanged, blockChanged } = listener
  console.log('key: ', `userId=${user.id}`)
  const config = {
    schema: [User.schema, Profile.schema, Block.schema],
    sync: {
      user,
      partitionValue: `userId=${user.id}`,
      newRealmFileBehavior: OpenRealmBehaviorConfiguration,
      existingRealmFileBehavior: OpenRealmBehaviorConfiguration,
    },
    error: (_session, error) => {
      console.log(error.name, error.message)
      errorSync(realm, _session, error)
    },
  }
  realm = await Realm.open(config)
  realm.objects('User').addListener(profileChanged)
  realm.objects('Block').addListener(blockChanged)

  await restoreRealm(realm, ['User', 'User_profile', 'Block'])
  return realm
}

const updateUser = ({ user, profile }: { user: IUser, profile: Record<string, any> }) => {
  const {
    avatar = null,
    name = null,
    email = null,
    bio = null,
    callDuration = null,
    callPrice = null,
    charityName = null,
    charityDonationPercentage = null,
    payoutRoutingNumber = null,
    payoutAccountNumber = null,
    zipCode = null,
    socialHandle = null,
  } = profile

  const profileObject = user.type === 'athlete' ? {
    bio,
    // callDuration,
    callPrice,
    // charityName,
    // charityDonationPercentage,
    // payoutRoutingNumber,
    // payoutAccountNumber,
  } : {
    zipCode,
    socialHandle // twitter handle
  }

  // const newProfileInfo = pickBy(profileObject, (value) => !isNaN(value) && !isNil(value))
  const updateObject = {
    avatar,
    name,
    profile: profileObject
  }

  user = merge(user, updateObject)
  // user.profile = {
  //   ...merge(user, profileObject),
  // }

  // if (avatar) {
  //   user.avatar = avatar
  // }

  // if (name) {
  //   user.name = name
  // }

  if (user.type === 'fan' && email) {
    user.email = email
  }
}

export const userUpdateProfile = async ({ user, profile }: UserUpdateProfileParams): Promise<boolean> => {
  if (!realm) {
    throw new Error('Server is not ready')
  }
  if (!user.customData?.type) {
    await user.refreshCustomData()
  }
  return new Promise((resolve) => {
    realm.write(() => {
      // Get a dog to update.
      const user = realm.objects('User')[0] // only has 1 user
      updateUser({ user, profile })
      resolve(true)
    })
  })
}
