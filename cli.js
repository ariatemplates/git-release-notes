#!/usr/bin/env node
var argv = require('yargs')
	.usage('git-release-notes [<options>] <since>..<until> <template>')
	.demandCommand(2)
	.example(
		'git-release-notes -t "(feat|bug): (.*)" -m type -m title v1.0.0..v2.0.0 markdown',
		'Match all commits with starting with either `feat:` or `bug` between the tags `v1.0.0` and `v2.0.0`'
	)
	.wrap(null)
	.option('f', {
		alias: 'file',
		describe: 'Configuration file. Use it instead of passing command line options'
	})
	.option('p', {
		alias: 'path',
		describe: 'Git project path. Defaults to the current path',
		default: process.cwd(),
	})
	.option('t', {
		alias: 'title',
		describe: 'Commit title regular expression',
		default: '(.*)',
	})
	.option('i', {
		alias: 'ignore-case',
		describe: 'Ignore case of title\'s regular expression',
		type: 'boolean',
	})
	.option('m', {
		alias: 'meaning',
		describe: 'Meaning of capturing block in title\'s regular expression',
		default: ['type'],
	})
	.option('b', {
		alias: 'branch',
		describe: 'Git branch, defaults to master',
		default: 'master',
		type: 'string',
	})
	.option('s', {
		alias: 'script',
		describe: 'External script to rewrite the commit history',
	})
	.option('o', {
		alias: 'gitlog-option',
		describe: 'Additional git log options AND ignore \'c\' option',
		default: [],
	})
	.option('c', {
		alias: 'merge-commits',
		describe: 'Only use merge commits',
		type: 'boolean',
	})
	.argv;

const index = require('./index');
index(argv, argv._[0], argv._[1])
.then(function (output) {
  process.stdout.write(output + "\n");
})
.catch(function (error) {
  require('yargs').showHelp();
  console.error('\n', error.message);
  process.exit(1);
});
