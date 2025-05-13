module.exports = {
  "presets": [
    "react-app",
    '@babel/preset-env',
    "@babel/preset-react"
  ],
  "plugins": [
    "@babel/plugin-transform-nullish-coalescing-operator",
    "@babel/plugin-proposal-logical-assignment-operators",
    "@babel/plugin-proposal-private-methods",
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-arrow-functions",
    "@babel/plugin-transform-shorthand-properties",
    "@babel/plugin-transform-template-literals",
    "@babel/plugin-transform-classes"
  ]
};