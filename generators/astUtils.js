const _ = require('lodash');
const generator = require('babel-generator');
const babylon = require('babylon');
const types = require('babel-types');

function shorthandProperty(name) {
  return types.objectProperty(
    types.identifier(name),
    types.identifier(name),
    false,
    true
  );
}

function singleSpecifierImportDeclaration(identifier, path, isDefault = false) {
  let localIdentifier = types.identifier(
    typeof identifier === 'string' ? identifier : identifier[0]
  );
  return types.importDeclaration(
    [
      isDefault
        ? types.importDefaultSpecifier(localIdentifier)
        : types.importSpecifier(
            localIdentifier,
            typeof identifier === 'string'
              ? localIdentifier
              : types.identifier(identifier[1])
          )
    ],
    types.stringLiteral(path)
  );
}

function newImport(ast, importDeclaration) {
  let index = _.findLastIndex(ast.body, types.isImportDeclaration) + 1;
  ast.program.body.splice(index, 0, importDeclaration);
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
  return generator.default(ast, { quotes: 'single' }).code;
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
}

module.exports = {
  parse,
  generate,
  singleSpecifierImportDeclaration,
  findSingleVariableDeclaration,
  findClassDeclaration,
  findDefaultExportDeclaration,
  newImport,
  shorthandProperty,
  importBootstrap,
  importSemantic
};
