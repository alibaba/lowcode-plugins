export const defaultBabelConfig = {
  presets: [
    [
      "env",
      {
        "targets": {
          "chrome": "80"
        },
        "exclude": [
          "babel-plugin-transform-async-to-generator",
          "babel-plugin-transform-regenerator",
        ]
      }
    ],
    'react',
  ],
  sourceType: 'script',
};
