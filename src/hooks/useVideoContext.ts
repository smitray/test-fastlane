import { VideoContext } from '@providers/twilio-video-provider'
import { useContext } from 'react'

export const useVideoContext = () => {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoProvider')
  }
  return context
}
