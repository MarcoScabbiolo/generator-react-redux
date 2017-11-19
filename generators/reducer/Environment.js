const path = require('path');

class DummyBaseClass {}

module.exports = (BaseClass = DummyBaseClass) =>
  class extends BaseClass {
    get _secionsReducerToCombineWithFilePath() {
      return this.props.sectionReducerFilePath || this._sectionsReducerFilePath;
    }
    get _reducerToCreatePath() {
      if (this.props.type === 'section') {
        return this._sectionReducersPath(this.props.name);
      }
      return this._reducerPath();
    }
    get _reducerToCreateFilePath() {
      return path.join('src', this._reducerToCreatePath) + '.js';
    }
  };
