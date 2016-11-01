module.exports = {
  'env': {
    'browser': true,
    'commonjs': true
  },
  'extends': 'eslint:recommended',
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'no-console': [
      'error',
      { allow: ['time', 'timeEnd', 'group', 'groupEnd', 'profile', 'profileEnd', 'info', 'warn', 'error'] }
    ]
  },
  'globals': {
    'VFDeps': false
  }
};