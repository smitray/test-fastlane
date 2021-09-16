import dayjs from 'dayjs'

export const formatDate = (date: string | Date | number, format: string) => {
  return dayjs(date).format(format)
}

export const formatUnixTimestamp = (date: number, format: string) => {
  return dayjs(date * 1000).format(format)
}
