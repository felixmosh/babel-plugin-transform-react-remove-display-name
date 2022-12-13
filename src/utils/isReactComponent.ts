import * as t from '@babel/types';

// Taken from https://github.com/layershifter/babel-plugin-transform-react-handled-props/blob/2ec5afc98d5436d8cda78f10454879df64e0204c/src/util/isReactComponent.js#L4

function containsJSX(path: any) {
  if (t.isJSXElement(path)) return true;
  let containJSX;

  path.traverse({
    JSXElement(jsxPath: any) {
      containJSX = true;
      jsxPath.stop();
    },
  });

  return containJSX;
}

function isRenderMethod(member: any) {
  return t.isClassMethod(member) && t.isIdentifier(member.key, { name: 'render' });
}

function hasRenderMethod(path: any) {
  return path.node?.body?.body.some(isRenderMethod);
}

function hasSuperClass({ node: { superClass } }: any) {
  return !!superClass;
}

export function isClass(path: any) {
  return t.isClassDeclaration(path) || t.isClassExpression(path);
}

function isFunction(path: any) {
  if (t.isFunctionDeclaration(path)) {
    return true;
  }
  if (!t.isArrowFunctionExpression(path) && !t.isFunctionExpression(path)) {
    return false;
  }

  return t.isVariableDeclarator((path as any).parent);
}

function isReactClass(path: any) {
  return isClass(path) && hasSuperClass(path) && hasRenderMethod(path);
}

function isReactFunction(path: any) {
  return isFunction(path) && containsJSX(path.get('body'));
}

function isReactExotic(path: any) {
  if (!t.isFunction(path)) {
    return false;
  }

  const callee = (path as any).parent.callee;

  if (!t.isMemberExpression(callee)) {
    return false;
  }

  return (
    t.isIdentifier(callee.property, { name: 'memo' }) ||
    t.isIdentifier(callee.property, { name: 'forwardRef' })
  );
}

export function isReactComponent(path: any) {
  return isReactClass(path) || isReactFunction(path) || isReactExotic(path);
}
