import { createContext, memo, useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useAuth } from '@hooks/useAuth'
import { getCalls as getCallsAPI, getTwilioToken } from '@src/database/functions'

import { useImmer } from 'use-immer'
import { TBackendCall } from '@src/database/types'
import { checkIsAPIUser } from '@utils/helpers'

type TCallContext = {
  upcomingCalls: TBackendCall[]
  completedCalls: TBackendCall[]
  getCalls: ({
    type,
    filter,
    orderBy,
  }: {
    type: 'upcoming' | 'completed'
    filter: Record<string, unknown>
    orderBy?: Record<string, number>
  }) => Promise<void>
  fetching: {
    upcomingCalls: boolean
    completedCalls: boolean
  }
  getCallToken: (callId: string) => Promise<string>
  callStatus: Record<string, unknown>
  setCallStatus: any
}

export const CallContext = createContext<TCallContext>({} as TCallContext)

// TODO: refresh when user reset (type, identify changed)
export const CallProvider = memo(({ children }) => {
  const { user } = useAuth()
  const [upcomingCalls, setUpcomingCalls] = useState([])
  const [completedCalls, setCompletedCalls] = useState([])
  const [fetching, setFetching] = useImmer({
    upcomingCalls: false,
    completedCalls: false,
  })
  const [callStatus, setCallStatus] = useImmer({})

  const getCalls = useCallback(
    async ({ type, filter, orderBy = { createdAt: -1 } }) => {
      if (!user || checkIsAPIUser(user)) return

      try {
        setFetching((draft) => {
          if (type === 'upcoming') draft.upcomingCalls = true
          if (type === 'completed') draft.completedCalls = true
        })
        const calls = await getCallsAPI({ user, filter, orderBy })
        switch (type) {
          case 'upcoming': {
            // TODO: Implement pagination
            setUpcomingCalls(calls)
            break
          }
          case 'completed': {
            setCompletedCalls(calls)
            break
          }
        }
      } catch (err) {
        Alert.alert('An error occurred while getting call', err.message)
      } finally {
        setFetching((draft) => {
          if (type === 'upcoming') draft.upcomingCalls = false
          if (type === 'completed') draft.completedCalls = false
        })
      }
    },
    [setFetching, user],
  )

  useEffect(() => {
    // reset calls to empty array when logout or switch user
    if (!user || checkIsAPIUser(user)) {
      setUpcomingCalls([])
      setCompletedCalls([])
    }
  }, [user])

  const getCallToken = useCallback(
    async (callId) => {
      if (callId) {
        return getTwilioToken({ user, callId })
      }
      return null
    },
    [user],
  )

  return (
    <CallContext.Provider
      value={{
        upcomingCalls,
        completedCalls,
        getCalls,
        fetching,
        getCallToken,
        callStatus,
        setCallStatus,
      }}
    >
      {children}
    </CallContext.Provider>
  )
})
