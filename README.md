# babel-plugin-transform-react-remove-display-name
Make React component `displayName` property available only in none production environment during the build :sparkles:

![CI](https://github.com/felixmosh/babel-plugin-transform-react-remove-display-name/workflows/CI/badge.svg)
[![npm](https://img.shields.io/npm/v/babel-plugin-transform-react-remove-display-name.svg)](https://www.npmjs.com/package/babel-plugin-transform-react-remove-display-name)


## Installation

```sh
$ npm install --save-dev babel-plugin-transform-react-remove-display-name
// or
$ yarn add --dev babel-plugin-transform-react-remove-display-name
```
*This plugin is for Babel 7*

## Story

This plugin was originally created for [Semantic UI React](https://github.com/Semantic-Org/Semantic-UI-React) package.
It wraps each React component `displayName` property with an if statement which makes sure it will be available only in none production environment.

## Example transform

**In**

```js
const Baz = (props) => (
  <div {...props} />
)

Baz.displayName = "Baz"
```

**Out**

```js
const Baz = (props) => (
  <div {...props} />
)

if(process.env.NODE_ENV !== 'production') {
  Baz.displayName = "Baz"
}
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-react-remove-display-name"]
}
```

### Via CLI

```sh
$ babel --plugins transform-react-remove-display-name script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-react-remove-display-name"]
});
```

### Inspiration
This plugin is inspired by:

1. [babel-plugin-transform-react-remove-prop-types](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types)
2. [babel-plugin-transform-react-handled-props](https://github.com/layershifter/babel-plugin-transform-react-handled-props)

## License

**MIT**
