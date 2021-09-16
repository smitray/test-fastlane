export const icons = {
  facebook: require('@assets/icons/facebook.svg').default,
  google: require('@assets/icons/google.svg').default,
  apple: require('@assets/icons/apple.svg').default,
  sms: require('@assets/icons/sms.svg').default,
  user: require('@assets/icons/user.svg').default,
  flag: require('@assets/icons/flag.svg').default,
  share: require('@assets/icons/share.svg').default,
  logo: require('@assets/icons/logo.svg').default,
  timer: require('@assets/icons/timer.svg').default,
  congrats: require('@assets/icons/congrats.svg').default,
  camera: require('@assets/icons/camera.svg').default,
  document: require('@assets/icons/document.svg').default
}

export type IconName = keyof typeof icons
