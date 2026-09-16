module.exports = ({ config }) => {
  const isDev =
    process.env.APP_VARIANT === 'development' ||
    process.env.EAS_BUILD_PROFILE === 'development';

  const name = isDev ? 'Curexa (Dev)' : 'Curexa';
  const packageName = 'com.devlomatixsolutions.curexa';
  const scheme = isDev ? 'curexa-dev' : 'curexa';

  return {
    ...config,
    name,
    scheme,
    ios: {
      ...config.ios,
      bundleIdentifier: packageName,
    },
    android: {
      ...config.android,
      package: packageName,
    },
  };
};
