export const getInitials = (textString) => {
  if (!textString) return ''

  const text = textString.trim()
  const textSplit = text.split(' ')

  if (textSplit.length <= 1) return text.charAt(0)

  const initials = textSplit[0].charAt(0) + textSplit[textSplit.length - 1].charAt(0)

  return initials
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function rgbColor(hex, a: number) {
  return `rgba(${hexToRgb(hex).r},${hexToRgb(hex).g},${hexToRgb(hex).b},${a})`
}

export const checkIsAPIUser = (user: Realm.User): boolean => {
  const providerType = user?.providerType
  return providerType === 'api-key'
}
