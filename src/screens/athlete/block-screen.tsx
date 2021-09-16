import React from 'react'
import { StyleSheet, Text, View, Alert } from 'react-native'
import { useAuth } from '@hooks/useAuth'
import { blockUser } from '@src/database/functions/calls'

const BlockScreen = () => {
  const { user } = useAuth()

  const blockFanFunc = async ({ blockedUserId }) => {
    const { error } = await blockUser({ user, blockedUserId })
    if (error) {
      Alert.alert('An error occurred while block fan', error)
    }
  }

  return (
    <View>
      <Text></Text>
    </View>
  )
}

export default BlockScreen

const styles = StyleSheet.create({})
