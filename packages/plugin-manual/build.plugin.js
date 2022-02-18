module.exports = ({ onGetWebpackConfig }) => {
  // see: https://github.com/ice-lab/build-scripts#%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91
  onGetWebpackConfig((config) => {
    config.module // fixes https://github.com/graphql/graphql-js/issues/1272
      .rule('mjs$')
      .test(/\.mjs$/)
      .include
        .add(/node_modules/)
        .end()
      .type('javascript/auto');
    return config;
  });
};
