module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
    test: {
      presets: ['module:metro-react-native-babel-preset'],
      plugins: ['react-native-reanimated/plugin'],
    },
  },
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
      },
    ],
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    ['@babel/plugin-proposal-optional-catch-binding'],
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@libs': './libs',
          '@assets': './src/assets',
          '@components': './src/components',
          '@constants': './src/constants',
          '@i18n': './src/i18n',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@services': './src/services',
          '@styles': './src/styles',
          '@utils': './src/utils',
          '@state': './src/state',
          '@contexts': './src/contexts',
          '@hooks': './src/hooks',
          '@hoc': './src/hoc',
          '@config': './src/config',
          '@controllers': './src/controllers',
          '@providers': './src/providers',
          '@database': './src/database',
          '@src': './src',
        },
      },
    ],
    ['react-native-reanimated/plugin'],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
}
