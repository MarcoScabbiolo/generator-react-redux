'use strict';
const reducer = require('./reducer/test.js');
const fs = require('fs-extra');
const path = require('path');

reducer(
  {
    runGenerator: true,
    options: {
      actions: {
        app: 'actions/app',
        other: 'actions/other'
      },
      sectionReducerFilePath: 'sections_reducer.js'
    },
    prompts: {
      name: 'test',
      path: 'generator_tests',
      type: 'section'
    }
  },
  true,
  dir => {
    fs.writeFileSync(
      path.join(dir, 'sections_reducer.js'),
      `const reducer = combineReducers({ });`
    );
  }
);
