export const defaultCode = `
  export default class LowcodeComponent extends Component {
    // 可以在 state 中定义搭建所需要的 State
    state = {
      test: 1,
      aaa: 2
    }

    testFunc() {
      console.log('test func lowcode');
      return (
        <div className="aa">
          {this.state.test}
        </div>
      );
    }
  }
`;
