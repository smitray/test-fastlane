import { StyleSheet, TouchableOpacity } from 'react-native'
import { useCallback, useState, useEffect } from 'react'
import { Box } from '@components/common/viewbox'
import { Text } from '@components/text'
import { ProgressiveImage } from '@components/progressive-image'
import { s, vs } from 'react-native-size-matters/extend'
import { typography } from '@styles/typography'
import { usePublicSync } from '@hooks/usePublicSync'
import { IPublicAthleteProfile } from '@src/database/models/publicAthleteProfile'

type AthleteItemProps = {
  athlete: IPublicAthleteProfile,
  onSelect: (athlete: any) => void
}

const subTitle = (league: any, sport: any) => {
  if (league && sport) {
    return `${league}, ${sport}`
  }
  return league || sport || ''
}

export const AthleteItem = ({ athlete, onSelect }: AthleteItemProps) => {
  const { leagues, sports } = usePublicSync()
  const [league, setLeague] = useState('')
  const [sport, setSport] = useState('')

  const _onSelect = useCallback(() => {
    onSelect(athlete)
  }, [athlete, onSelect])

  useEffect(() => {
    if (athlete.leagueId) {
      const league = leagues.find((league) => league._id.toString() === athlete.leagueId.toString())
      setLeague(league?.name)
    } else {
      setLeague('')
    }
  }, [leagues, athlete.leagueId])

  useEffect(() => {
    if (athlete.sportId) {
      const sport = sports.find((sport) => sport._id.toString() === athlete.sportId.toString())
      setSport(sport?.name)
    } else {
      setSport('')
    }
  }, [sports, athlete.sportId])

  return (
    <TouchableOpacity onPress={_onSelect}>
      <Box justifyContent="flex-end" style={styles.container}>
        <ProgressiveImage
          source={{ uri: athlete.avatar }}
          containerStyle={styles.imageContainer}
          style={styles.image}
        />
        <Box>
          <Box position="absolute" right={s(6)} top={vs(4)} zIndex={{ phone: 10, tablet: 10 } as any}>
            <Text text={`$${athlete.callPrice || ''}`} variant="bold" color="white" />
          </Box>
          <Box backgroundColor="green" opacity={0.5} height={vs(25)} />
          <Box
            backgroundColor="black"
            paddingHorizontal="s"
            paddingVertical="sl"
            borderBottomLeftRadius="sl"
            borderBottomRightRadius="sl"
          >
            <Text text={athlete?.name} variant="medium" color="white" textTransform="capitalize" />
            <Text
              text={subTitle(league, sport)}
              variant="medium"
              fontSize={typography.fontSize.small}
              color="sirocco"
              textTransform="capitalize"
              lineHeight={vs(14)}
            />
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  )
}

export default AthleteItem

const styles = StyleSheet.create({
  container: {
    borderRadius: s(12),
    elevation: 10,
    height: vs(200),
    overflow: 'visible',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 6.27,
    width: s(135),
  },
  image: {
    borderRadius: s(12),
  },
  imageContainer: {
    borderRadius: s(12),
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
})
