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
.boolean("c")
.alias("c", "merge-commits")
.describe({
	"f": "Configuration file",
	"p": "Git project path",
	"t": "Commit title regular expression",
	"m": "Meaning of capturing block in title's regular expression",
	"b": "Git branch, defaults to master",
	"s": "External script to rewrite the commit history",
	"c": "Only use merge commits"
})
.boolean("version")
.check(function (argv) {
	if (argv._.length == 2) {
		return true;
	}
	throw "Invalid parameters, please specify an interval and the template";
})
.argv;

var git = require("./lib/git");
var fs = require("fs");
var ejs = require("ejs");
var path = require("path");
var debug = require("debug")("release-notes:cli");
var debugData = require("debug")("release-notes:data");
var dateFnsFormat = require('date-fns/format')

var template = argv._[1];
debug("Trying to locate template '%s'", template);
if (!fs.existsSync(template)) {
	debug("Template file '%s' doesn't exist, maybe it's template name", template);
	// Template name?
	if (template.match(/[a-z]+(\.ejs)?/)) {
		template = path.resolve(__dirname, "./templates/" + path.basename(template, ".ejs") + ".ejs");
	} else {
		require("optimist").showHelp();
		console.error("\nUnable to locate template file " + template);
		process.exit(1);
	}
}

debug("Trying to locate script '%s'", argv.s);
if (argv.s && !fs.existsSync(argv.s)) {
	debug("Script file '%s' doesn't exist");
	require("optimist").showHelp();
	console.error("\nExternal script must be a valid path " + argv.s);
	process.exit(1);
}

debug("Trying to read template '%s'", template);
fs.readFile(template, function (err, templateContent) {
	if (err) {
		require("optimist").showHelp();
		console.error("\nUnable to locate template file " + argv._[1]);
		process.exit(5);
	} else {
		getOptions(function (options) {
			debug("Running git log in '%s' on branch '%s' with range '%s'", options.p, options.b, argv._[0]);
			git.log({
				branch: options.b,
				range: argv._[0],
				title: new RegExp(options.t),
				meaning: Array.isArray(options.m) ? options.m: [options.m],
				cwd: options.p,
				mergeCommits: options.c
			}, function (commits) {
				postProcess(templateContent, commits);
			});
		});
	}
});

function getOptions (callback) {
	if (argv.f) {
		debug("Trying to read configuration file '%s'", argv.f);
		fs.readFile(argv.f, function (err, data) {
			if (err) {
				console.error("Unable to read configuration file\n" + err.message);
			} else {
				var options;
				try {
					var stored = JSON.parse(data);
					options = {
						b: stored.b || stored.branch || argv.b,
						t: stored.t || stored.title || argv.t,
						m: stored.m || stored.meaning || argv.m,
						p: stored.p || stored.path || argv.p,
						c: stored.c || stored.mergeCommits || argv.c
					};
				} catch (ex) {
					console.error("Invalid JSON in configuration file");
				}
				if (options) {
					callback(options);
				}
			}
		});
	} else {
		callback(argv);
	}
}

function postProcess(templateContent, commits) {
	debug("Got %d commits", commits.length);
	if (commits.length) {
		if (argv.s) {
			var externalScriptPath = argv.s;
			try {
				var externalScript = require(externalScriptPath);
			} catch (ex) {
				debug("Exception while reading external script '%s': '%s'", externalScriptPath, ex.message);
				console.error('Unable to read external script');
				process.exit(7);
			}
			debug("Trying to run the external script");
			var inputData;
			var outputData;
			try {
				inputData = {
					commits: commits,
					range: argv._[0],
					dateFnsFormat: dateFnsFormat,
					debug: require("debug")("release-notes:externalscript")
				};
				externalScript(inputData, function (data) {
					outputData = data;
					render(templateContent, data);
				});
				debug("Waiting for external script to call the callback");
			} catch (ex) {
				debug("Exception while running external script '%s'", ex.message);
				debugData("Input data passed to the external script `%s`", JSON.stringify(inputData, null, '  '));
				debugData("Output data received from the external script `%s`", outputData ? JSON.stringify(outputData, null, '  ') : '');
				console.error('Error while processing external script', ex);
				process.exit(8);
			}
		} else {
			debug("Rendering template without post processing");
			render(templateContent, { commits: commits });
		}
	} else {
		console.error('No commits in the specified range');
		process.exit(6);
	}
}

function render(templateContent, data) {
	debug("Rendering template");
	var output = ejs.render(templateContent.toString(), Object.assign({
		range: argv._[0],
		dateFnsFormat: dateFnsFormat
	}, data));
	process.stdout.write(output + "\n");
}
