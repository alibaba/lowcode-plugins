const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = ({ onGetWebpackConfig }) => {
  onGetWebpackConfig('component-demo-web', (config) => {
    config.plugin('HtmlWebpackPlugin').tap((options) => {
      const [config] = options;
      return [
        {
          ...config,
          template: require.resolve('./demo/demo.hbs'),
        },
      ];
    });
    config.externals({
      react: 'React',
      'react-dom': 'ReactDOM',
    });

    config.module.rule('svg').uses.clear().end().use('svg').loader('@svgr/webpack').end();
  });
};
