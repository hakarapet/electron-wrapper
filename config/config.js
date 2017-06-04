'use strict';

const nconf = require('nconf');

/**
 * Load config files.
 * REMEMBER:
 * Order matters.
 * First come - first served
 */
nconf.env()
    .argv()
    .file('node_env', {file: `${process.env.NODE_ENV}.json`, dir: __dirname, search: true})
    .file('default', {file: 'production.json', dir: __dirname, search: true});

/**
 * Will check the required key(-s)
 */
nconf.required([
    'NODE_ENV'
]);

module.exports = nconf;