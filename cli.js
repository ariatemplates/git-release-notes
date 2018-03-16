#!/usr/bin/env node
var argv = require("optimist").usage("git-release-notes [<options>] <since>..<until> <template>")
.options("f", {
	"alias": "file"
})
.options("p", {
	"alias": "path",
	"default": process.cwd()
})
.options("t", {
	"alias": "title",
	"default": "(.*)"
})
.boolean("i")
.alias("i", "ignore-case")
.options("m", {
	"alias": "meaning",
	"default": ['type']
})
.options("b", {
	"alias": "branch",
	"default": "master"
})
.options("s", {
	"alias": "script"
})
.options("o", {
	"alias": "gitlog-option",
	"default" : []
})
.boolean("c")
.alias("c", "merge-commits")
.describe({
	"f": "Configuration file",
	"p": "Git project path",
	"t": "Commit title regular expression",
	"i": "Ignore case of title's regular expression",
	"m": "Meaning of capturing block in title's regular expression",
	"b": "Git branch, defaults to master",
	"s": "External script to rewrite the commit history",
	"c": "Only use merge commits",
	"o": "Additional git log options AND ignore 'c' option"
})
.boolean("version")
.check(function (argv) {
	if (argv._.length == 2) {
		return true;
	}
	throw "Invalid parameters, please specify an interval and the template";
})
.argv;

const index = require('./index');
index(argv, argv._[0], argv._[1])
.then(function (output) {
  process.stdout.write(output + "\n");
})
.catch(function (error) {
  require("optimist").showHelp();
  console.error('\n', error.message);
  process.exit(1);
});
