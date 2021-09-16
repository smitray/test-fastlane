/* eslint-disable react-native/split-platform-components */
import { StyleSheet, FlatList, Platform } from 'react-native'
import { Screen } from '@components/screen'
import { Text } from '@components/text'
import { useCallback, useEffect, useState } from 'react'
import { s, vs } from 'react-native-size-matters/extend'
import { Box } from '@components/common/viewbox'
import { IconSvg } from '@components/icon-svg'
import Contacts from 'react-native-contacts'
import LinearGradient from 'react-native-linear-gradient'
import { Button } from '@components/button'
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions'
import { Avatar } from 'react-native-elements'
import SendSMS, { AndroidSuccessTypes } from 'react-native-sms'
import { translate } from '@i18n/translate'
import { show } from '@utils/toast'

const InviteScreen = () => {
  const [isLoadingContacts, setLoadingContacts] = useState(true)
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    const loadContacts = () => {
      Contacts.getAll()
        .then((foundContacts) => {
          setLoadingContacts(false)
          setContacts(foundContacts)
        })
        .catch((e) => {
          setLoadingContacts(false)
        })
    }

    check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.READ_CONTACTS : PERMISSIONS.IOS.CONTACTS)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log('This feature is not available (on this device / in this context)')
            break
          case RESULTS.LIMITED:
            console.log('The permission is limited: some actions are possible')
            break
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore')
            break
          case RESULTS.DENIED:
            console.log('The permission has not been requested / is denied but requestable')

            if (Platform.OS === 'android') {
              request(PERMISSIONS.ANDROID.READ_CONTACTS, {
                title: translate('contact_permission_title'),
                message: translate('contacts_permission_message'),
                buttonNegative: translate('deny'),
                buttonPositive: translate('ok'),
              }).then(loadContacts)
            } else {
              Contacts.requestPermission().then((status) => {
                if (status === 'authorized') {
                  loadContacts()
                }
              })
            }
            break
          case RESULTS.GRANTED:
            console.log('The permission is granted')
            loadContacts()
            break
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])

  const _onInvitePress = useCallback(
    (contact) => () => {
      const name =
        contact.givenName || contact.familyName
          ? `${contact.givenName || ''}${contact.familyName ? ' ' + contact.familyName : ''}`
          : ''
      const smsObject: any = {
        body: `Hi ${name}, check out this awesome app called Meetlete! You can meet your favorite athletes for a 4-minute video call while helping charities. https://meetlete.co/app`,
        recipients: [contact.phoneNumbers?.[0].number],
      }

      if (Platform.OS === 'android') {
        smsObject.successTypes = [AndroidSuccessTypes.sent, AndroidSuccessTypes.queued]
        smsObject.allowAndroidSendWithoutReadPermission = true
      }
      SendSMS.send(smsObject, (completed, cancelled, error) => {
        // console.log('SMS Callback: cancelled: ' + cancelled)
        if (error) {
          show({
            type: 'error',
            messageTx: 'cannot_send_invitation',
          })
          return
        }
        if (completed) {
          show({
            type: 'success',
            messageTx: 'invitation_sent',
          })
        }
      })
    },
    [],
  )

  const _renderItem = useCallback(
    ({ item }) => {
      return (
        <Box
          flex={1}
          flexDirection="row"
          alignItems="center"
          paddingVertical="ml"
          borderBottomColor="alto"
          borderBottomWidth={1}
        >
          <Box flex={1} flexDirection="row" alignItems="center" marginLeft="s">
            {item.hasThumbnail ? (
              <Avatar
                containerStyle={styles.avatar}
                imageProps={{ style: styles.avatar }}
                source={item.hasThumbnail ? { uri: item.thumbnailPath } : undefined}
              />
            ) : (
              <IconSvg name="user" size={s(40)} />
            )}
            <Box flexShrink={1} marginLeft="m">
              <Text text={`${item.givenName} ${item.familyName}`} />
            </Box>
          </Box>
          <Button
            rounded
            ViewComponent={LinearGradient}
            linearGradientProps={{
              colors: ['#049C69', '#049C69', '#009EBE'],
              start: { x: 0, y: 0 },
              end: { x: 1, y: 1 },
            }}
            labelTx="invite"
            labelVariant="button"
            icon={<IconSvg name="sms" style={styles.btnIconContainer} />}
            onPress={_onInvitePress(item)}
          />
        </Box>
      )
    },
    [_onInvitePress],
  )

  return (
    <Screen header={{ headerTx: 'invite_athletes' }} style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={_renderItem}
        keyExtractor={(item) => String(item.recordID)}
        showsVerticalScrollIndicator={false}
        refreshing={isLoadingContacts}
        ListEmptyComponent={
          <Box flex={1} justifyContent="center" alignItems="center">
            <Text textAlign="center" tx="no_contacts" />
          </Box>
        }
        contentContainerStyle={styles.listContentContainer}
      />
    </Screen>
  )
}

export default InviteScreen

const styles = StyleSheet.create({
  avatar: {
    borderRadius: s(20),
    height: s(40),
    width: s(40),
  },
  btnIconContainer: {
    marginRight: s(7),
  },
  container: {
    paddingHorizontal: s(20),
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: vs(90),
  },
})
