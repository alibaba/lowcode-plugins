module.exports = ({ onGetWebpackConfig }) => {
  // see: https://github.com/ice-lab/build-scripts#%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91
  onGetWebpackConfig((config) => {
    console.log(config);
    config.merge({
      node: {
        fs: 'empty',
      },
    });
    return config;
  });
};
