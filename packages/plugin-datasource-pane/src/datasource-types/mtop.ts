export const DataSourceTypeMtop = {
  type: 'mtop',
  schema: {
    type: 'object',
    properties: {
      options: {
        type: 'object',
        properties: {
          uri: {
            title: 'api',
          },
          v: {
            title: 'v',
            type: 'string',
          },
          appKey: {
            title: 'appKey',
            type: 'string',
          },
          dataType: {
            title: 'dataType',
            type: 'string',
            enum: [
              'jsonp',
              'originaljsonp',
              'json',
            ],
          },
        },
      },
    },
  },
};