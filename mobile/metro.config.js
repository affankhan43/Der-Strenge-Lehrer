const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: ['bin','txt','db','mp4','ttf','otf','png','jpg','jpeg','bmp','gif'],
    sourceExts: ['js','json','ts','tsx','jsx','svg'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
