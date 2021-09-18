// @ts-check

/** @type {import("@commitlint/types").UserConfig} */
module.exports = {
  // Ideally, this should be true for commits and false for pushu
  defaultIgnores: !!process.env.X_COMMITLINT_DEFAULT_IGNORES,
  extends: ['@commitlint/config-conventional'],
  // https://commitlint.js.org/#/reference-rules
  rules: {
    'scope-enum': [2, 'always', [
      'deps',
      'extension',
      'webserver',
      'display',
      'displayworker',
      'worker',
      'audio',
      'mmidi',
      'controls',
      'com',
      'demo',
    ]],
  },
};
