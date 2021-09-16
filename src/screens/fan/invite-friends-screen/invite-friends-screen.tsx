import { Box, Button, Text, Screen, TextGradient } from '@components/index'
import Routes from '@navigation/routes'
import { palette } from '@styles/palette'
import { typography } from '@styles/typography'
import { useCallback, useState, useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import { FlatList, Platform } from 'react-native'
import { IconSvg } from '@components/icon-svg'
import Contacts from 'react-native-contacts'
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions'
import { Avatar } from 'react-native-elements'
import SendSMS, { AndroidSuccessTypes } from 'react-native-sms'
import { translate } from '@i18n/translate'
import { show } from '@utils/toast'

const InviteFriendsScreen = ({ navigation }) => {
  const [isSubmitting, setSubmitting] = useState(false)
  const [isLoadingContacts, setLoadingContacts] = useState(true)
  const [contacts, setContacts] = useState([])

  const onLogin = useCallback(() => {
    navigation.replace(Routes.Fan.SignIn)
  }, [navigation])

  const onBack = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: Routes.Welcome }],
    })
  }, [navigation])

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

  const _onInvitePress = useCallback(async (contact) => {
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

    try {
      setSubmitting(true)
      await SendSMS.send(smsObject, (completed, cancelled, error) => {
        // console.log('SMS Callback: cancelled: ' + cancelled)
        setSubmitting(false)
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
      setSubmitting(false)
    } catch (err) {
      show({
        type: 'error',
        messageTx: 'cannot_send_invitation',
      })
      setSubmitting(false)
    }
  }, [])

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
              <Text text={`${item.givenName || ''} ${item.familyName || ''}`} />
            </Box>
          </Box>
          <Button
            rounded
            ViewComponent={LinearGradient}
            linearGradientProps={{
              colors: palette.gradient.background,
              start: { x: 0, y: 0 },
              end: { x: 1, y: 1 },
            }}
            labelTx="invite"
            labelVariant="button"
            icon={<IconSvg name="sms" style={styles.btnIconContainer as any} />}
            onPress={() => _onInvitePress(item)}
            disabled={isSubmitting}
          />
        </Box>
      )
    },
    [_onInvitePress, isSubmitting],
  )

  return (
    <Screen header={{ headerTx: 'invite_friends' }} backgroundColor="white">
      <Box alignItems="center" mt="vs-5" flex={1} paddingHorizontal="vs-6">
        <TextGradient
          tx="contacts"
          variant="bold"
          gradient={{
            colors: palette.gradient.text,
          }}
        />
        <LinearGradient
          colors={palette.gradient.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: s(104), height: vs(2), marginTop: vs(17) }}
        />
        <Box flex={1} width="100%" mt="vs-5">
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
        </Box>
      </Box>
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingHorizontal="vs-6">
        <Button
          variant="clear"
          width={s(100)}
          height={vs(48)}
          labelTx="logIn"
          labelVariant="bold"
          onPress={onLogin}
          labelProps={{ color: 'emperor' }}
          disabled={isSubmitting}
          disabledStyle={{ backgroundColor: 'transparent' } as any}
        />
        <Button
          height={vs(48)}
          width={s(120)}
          borderRadius="s-12"
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.background,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelVariant="bold"
          labelProps={{ color: 'white', fontSize: typography.fontSize.medium }}
          marginVertical="vs-5"
          labelTx="done"
          onPress={onBack}
          disabled={isSubmitting}
        />
      </Box>
    </Screen>
  )
}

const styles = ScaledSheet.create({
  avatar: {
    borderRadius: '20@s',
    height: '40@s',
    width: '40@s',
  },
  btnIconContainer: {
    marginRight: '7@s',
  },
  container: {
    paddingHorizontal: '20@s',
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: '90@vs',
  },
})

export default InviteFriendsScreen
