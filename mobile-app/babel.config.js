module.exports = function (api) {
  api.cache(true);

  const plugins = [];
  if (process.env.BABEL_ENV === 'production') {
    plugins.push('react-native-paper/babel');
  }
  plugins.push('react-native-reanimated/plugin');

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
