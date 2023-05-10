import type * as BabelCoreNamespace from '@babel/core';
import type { PluginObj } from '@babel/core';
import * as t from '@babel/types';
import { CallExpression } from '@babel/types';
import { isReactComponent } from './utils/isReactComponent';

export type Babel = typeof BabelCoreNamespace;
const stateProp = 'ReactComponentsSet';

function isValidLeftSide(node: t.LVal) {
  return (
    t.isMemberExpression(node) &&
    t.isIdentifier(node.property) &&
    node.property.name === 'displayName'
  );
}

function isValidRightSide(node: t.Expression) {
  return t.isStringLiteral(node);
}

function isExistsReactComponent(node: t.LVal, reactComponentsSet: Set<string>) {
  return (
    t.isMemberExpression(node) &&
    t.isIdentifier(node.object) &&
    reactComponentsSet.has(node.object.name)
  );
}

function isValidHoc(node: CallExpression, reactComponentsSet: Set<string>): boolean {
  return (
    t.isIdentifier(node.callee) &&
    node.callee.name.startsWith('with') &&
    node.arguments.some((arg) => {
      if (t.isIdentifier(arg) && reactComponentsSet.has(arg.name)) {
        return true;
      } else if (t.isCallExpression(arg)) {
        return isValidHoc(arg, reactComponentsSet);
      }

      return false;
    })
  );
}

export default function displayNameTransform({ template }: Babel): PluginObj {
  const wrapWithEnvCheck = template(
    `
              if (process.env.NODE_ENV !== "production") {
                NODE;
              }
            `,
    { placeholderPattern: /^NODE$/ }
  );

  return {
    visitor: {
      Program(path, state) {
        state.set(stateProp, new Set<string>());
      },
      Function(path, state) {
        if (!isReactComponent(path)) {
          return;
        }

        const { node } = path;
        let reactFunctionName;
        if (t.isFunctionDeclaration(node)) {
          reactFunctionName = node.id?.name;
        }

        if (t.isArrowFunctionExpression(path) || t.isFunctionExpression(path)) {
          const variableDeclaration = path.findParent((parentPath) =>
            t.isVariableDeclarator(parentPath)
          );

          if (
            variableDeclaration &&
            t.isVariableDeclarator(variableDeclaration?.node) &&
            t.isIdentifier(variableDeclaration?.node.id)
          ) {
            reactFunctionName = variableDeclaration.node.id?.name;
          }
        }

        if (reactFunctionName) {
          const ReactComponentsSet = state.get(stateProp);
          ReactComponentsSet.add(reactFunctionName);
        }
      },
      VariableDeclarator(path, state) {
        const reactComponentsSet = state.get(stateProp) as Set<string>;

        if (
          !t.isIdentifier(path.node.id) ||
          path.node.id.name.charAt(0) !== path.node.id.name.charAt(0).toUpperCase() ||
          !t.isCallExpression(path.node.init) ||
          !isValidHoc(path.node.init, reactComponentsSet)
        ) {
          return;
        }

        reactComponentsSet.add(path.node.id.name);
      },
      AssignmentExpression(path, state) {
        const { node } = path;

        const reactComponentsSet = state.get(stateProp) as Set<string>;

        if (
          node.operator !== '=' ||
          !isValidLeftSide(node.left) ||
          !isValidRightSide(node.right) ||
          !isExistsReactComponent(node.left, reactComponentsSet)
        ) {
          return;
        }

        path.parentPath.replaceWith(wrapWithEnvCheck({ NODE: path.node }) as any);
        path.parentPath.skip();
      },
    },
  };
}
