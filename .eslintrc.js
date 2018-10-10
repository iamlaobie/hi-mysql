module.exports = {
  "parserOptions": {
    "ecmaVersion": 6,
  },
  "plugins": ["jest"],
  "parser": "babel-eslint",
  "extends": ["eslint:recommended", "airbnb-base"],
  "env": {
    "es6": true,
    "node": true,
    "jest/globals": true,
  },
  "rules": {
  }
}
