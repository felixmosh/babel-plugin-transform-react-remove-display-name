import type * as BabelCoreNamespace from '@babel/core';
import type { PluginObj } from '@babel/core';
import * as t from '@babel/types';
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
  if (
    t.isMemberExpression(node) &&
    t.isIdentifier(node.object) &&
    reactComponentsSet.has(node.object.name)
  ) {
    return true;
  }

  return false;
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
