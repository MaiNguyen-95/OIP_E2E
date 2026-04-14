module.exports = {
    default: [
        'src/features/**/*.feature',
        '--require-module ts-node/register/transpile-only',
        '--require src/steps/**/*.ts',
        '--require src/api/steps/**/*.ts',
        '--require src/support/**/*.ts',
        '--format json:report/cucumber-report.json',
        '--format @cucumber/pretty-formatter'
    ].join(' ')
};