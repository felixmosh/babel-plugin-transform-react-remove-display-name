import { transformFileSync } from '@babel/core';
import path from 'path';
import displayNameTransform from '../src/index';

const fixturesDir = path.join(__dirname, 'fixtures');

function fixtureAssert(testFilename: string, options = {}) {
  it(`should pass ${testFilename.split('-').join(' ').toLowerCase()}`, () => {
    const actualPath = path.join(fixturesDir, `${testFilename}.tsx`);

    const actual = transformFileSync(actualPath, {
      babelrc: false,
      plugins: [[displayNameTransform, options]],
      presets: ['@babel/preset-react'],
    })?.code;

    expect(actual).toMatchSnapshot();
  });
}

describe('remove displayName', () => {
  // fixtureAssert('function-component');
  // fixtureAssert('functional-component');
  // fixtureAssert('exotic-component');
  //
  // fixtureAssert('not-react-function-component');
  // fixtureAssert('object-literal');
  // fixtureAssert('other-property-name');
  // fixtureAssert('other-property-type');
  fixtureAssert('with-usage-of-hoc');
});
