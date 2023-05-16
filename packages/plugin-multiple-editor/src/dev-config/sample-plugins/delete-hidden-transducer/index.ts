import { project } from '@alilc/lowcode-engine';
import { IPublicEnumTransformStage } from '@alilc/lowcode-types';

export const deleteHiddenTransducer = (ctx: any) => {
  return {
    name: 'deleteHiddenTransducer',
    async init() {
      project.addPropsTransducer((props: any): any => {
        delete props.hidden;
        return props;
      }, IPublicEnumTransformStage.Save);
    },
  };
}

deleteHiddenTransducer.pluginName = 'deleteHiddenTransducer';
