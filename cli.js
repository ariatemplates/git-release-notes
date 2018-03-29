#!/usr/bin/env node
var argv = require("optimist").usage("git-release-notes [<options>] <since>..<until> <template>")
.options("j", {
	"alias": "jiraHost",
})
.options("f", {
	"alias": "file",
	"default": "options.json"
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
	"o": "Additional git log options AND ignore 'c' option",
	"j": "URL for Jira Instance"

})
.boolean("version")
.check(function (argv) {

	// Added template default so only one argument is required
	if (argv._.length >= 1 && argv._.length <=2) {
		return true;
	}
	throw "Invalid parameters, please specify an interval and the template";
})
.argv;

const index = require('./index');

// default to using the jira template
let template;
if(!argv._[1]) {
	template = "issuelink-markdown"
}
else {
	template = argv._[1]
}

index(argv, argv._[0], template)
.then(function (output) {
  process.stdout.write(output + "\n");
})
.catch(function (error) {
  require("optimist").showHelp();
  console.error('\n', error.message);
  process.exit(1);
});
