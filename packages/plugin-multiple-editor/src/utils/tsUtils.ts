export const getDefaultDeclaration = (declaration?: string) => ({
  content: `
  declare class Component {
    state?: Record<string, any>;
    setState(input: Record<string, any>, fn?: (...args: any[]) => any): void;
    componentDidMount(): void;
    constructor(props: Record<string, any>, context: any);
    render(): void;
    componentDidUpdate(prevProps: Record<string, any>, prevState: Record<string, any>, snapshot: Record<string, any>): void;
    componentWillUnmount(): void;
    componentDidCatch(error: Error, info: any): void;
    ${declaration || ''}
  }
  `,
  path: 'ts:component.d.ts',
});
