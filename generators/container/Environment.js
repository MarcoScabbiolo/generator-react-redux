const path = require('path');

class DummyBaseClass {}

module.exports = (BaseClass = DummyBaseClass) =>
  class extends BaseClass {
    get _containerToCreatePath() {
      return this._containersPath();
    }
    get _containerToCreateFilePath() {
      return path.join('src', this._containerToCreatePath) + '.js';
    }
  };
