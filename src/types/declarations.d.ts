/* eslint-disable @typescript-eslint/no-unused-vars */
declare module '*.svg' {
  import { FC } from 'react'
  import { SvgProps } from 'react-native-svg'
  const content: FC<SvgProps>
  export default content
}

declare module '@unsw-gsbme/react-native-keep-awake' {
  const useKeepAwake: () => void
  export { useKeepAwake }
}
