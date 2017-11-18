const _ = require('lodash');

const prompts = [
  {
    name: 'style',
    message: 'Which stylesheet provider do you want to use?',
    type: 'list',
    choices: ['Bootstrap', 'Semantic UI'],
    store: true,
    when: props => !_.isString(props.style)
  },
  {
    name: 'semantic-ui',
    message: 'Use semantic-ui-react?',
    type: 'confirm',
    default: false,
    store: true,
    when: props => !_.isBoolean(props.semanticui)
  },
  {
    name: 'thunk',
    message: 'Use redux-thunk?',
    type: 'confirm',
    default: true,
    store: true,
    when: props => !_.isBoolean(props.thunk)
  },
  {
    name: 'path',
    message:
      'Where do you want to place the new entry? Insert a path relative to the src directory',
    when: props => !_.isString(props.path)
  },
  {
    name: 'form',
    message: 'Use redux-form?',
    type: 'confirm',
    default: true,
    store: true,
    when: props => !_.isBoolean(props.form)
  },
  {
    name: 'normalizr',
    message: 'Use normalizr?',
    type: 'confirm',
    default: false,
    store: true,
    when: props => !_.isBoolean(props.normalizr)
  }
];

prompts.bindToProps = (toBind, props) => {
  if (!toBind) {
    return;
  }
  if (_.isArray(toBind)) {
    return toBind.map(prompt =>
      Object.assign({}, prompt, {
        when: prompt.when && prompt.when(props)
      })
    );
  }
  return Object.assign({}, toBind, {
    when: toBind.when && toBind.when(props)
  });
};

prompts.get = function(props, param) {
  var result;

  if (_.isString(param)) {
    result = prompts.find(prompt => param === prompt.name);
  } else if (_.isArray(param)) {
    result = prompts.filter(prompt => param.includes(prompt.name));
  } else {
    throw new TypeError(
      `prompts.get must receive a prompt name or an array of prompt names as its seconds parameter, instead it received a ${typeof param}`
    );
  }

  return prompts.bindToProps(result, props);
};

module.exports = prompts;
