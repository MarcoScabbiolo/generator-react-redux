const _ = require('lodash');
const generator = require('babel-generator');
const prettier = require('prettier');
const babylon = require('babylon');
const types = require('babel-types');
const assert = require('chai').assert;
const pkg = require('../package.json');

function shorthandProperty(name) {
  return types.objectProperty(
    types.identifier(name),
    types.identifier(name),
    false,
    true
  );
}

function singleSpecifierImportDeclaration(
  identifier,
  path,
  { isDefault, isNamespace } = {}
) {
  let localIdentifier = types.identifier(
    typeof identifier === 'string' ? identifier : identifier[0]
  );
  let specifier;

  if (isDefault) {
    specifier = types.importDefaultSpecifier(localIdentifier);
  } else if (isNamespace) {
    specifier = types.importNamespaceSpecifier(localIdentifier);
  } else {
    specifier = types.importSpecifier(
      localIdentifier,
      typeof identifier === 'string' ? localIdentifier : types.identifier(identifier[1])
    );
  }
  return types.importDeclaration([specifier], types.stringLiteral(path));
}

function lastImportIndex(ast) {
  return _.findLastIndex(ast.body, types.isImportDeclaration) + 1;
}

function newImport(ast, importDeclaration) {
  ast.program.body.splice(lastImportIndex(ast), 0, importDeclaration);
  return ast;
}

function findSingleVariableDeclaration(ast, kind, name) {
  return ast.program.body.find(
    stmt =>
      types.isVariableDeclaration(stmt) &&
      stmt.kind === kind &&
      stmt.declarations.length === 1 &&
      types.isVariableDeclarator(stmt.declarations[0]) &&
      stmt.declarations[0].id.name === name
  );
}

function findClassDeclaration(ast, name) {
  return ast.program.body.find(
    stmt => types.isClassDeclaration(stmt) && stmt.id && stmt.id.name === name
  );
}

function findDefaultExportDeclaration(ast) {
  return ast.program.body.find(types.isExportDefaultDeclaration);
}

function generate(ast) {
  return prettier.format(
    generator.default(ast, { quotes: 'single' }).code,
    pkg.eslintConfig.rules['prettier/prettier'][1]
  );
}

function parse(code) {
  return babylon.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'objectRestSpread', 'classProperties']
  });
}

function importBootstrap(ast) {
  return newImport(
    ast,
    types.importDeclaration(
      [types.importNamespaceSpecifier(types.identifier('B'))],
      types.stringLiteral('react-bootstrap')
    )
  );
}


function importSemantic(ast) {
  return newImport(
    ast,
    types.importDeclaration(
      [types.importNamespaceSpecifier(types.identifier('S'))],
      types.stringLiteral('semantic-ui-react')
    )
  );
function importAll(ast, toImport, options = {}, callback) {
  assert.isObject(
    toImport,
    'second parameter (toImport) must be an object where the keys are the local identifiers and the values are the paths to import from'
  );
  _.forIn(toImport, (filePath, name) => {
    ast = newImport(ast, singleSpecifierImportDeclaration(name, filePath, options));
    if (callback) {
      callback(name, filePath);
    }
  });
  return ast;
}

module.exports = {
  parse,
  generate,
  singleSpecifierImportDeclaration,
  findSingleVariableDeclaration,
  findClassDeclaration,
  findDefaultExportDeclaration,
  lastImportIndex,
  newImport,
  shorthandProperty,
  importBootstrap,
  importSemantic,
  importAll
};
