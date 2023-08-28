#!/usr/bin/env node

const { program } = require('commander');

const calculate = require('./lib/calculate.js');
const rollback = require('./lib/rollback.js');

program
    .name(require('./package.json').name)
    .description('Useless OI Tools')
    .version(require('./package.json').version, '-v, --version');

program.command('calculate').alias('+')
    .description('Calculate a new contest.')
    .arguments('<contest>')
    .action(calculate);

program.command('rollback').alias('-')
    .description('Roll back to remove the latest contest.')
    .action(rollback);

program.parse(process.argv);