var debug = require("debug")("release-notes:git");
var parser = require("debug")("release-notes:parser");

exports.log = function (options) {
	return new Promise(function (resolve, reject) {
		var spawn = require("child_process").spawn;
		var gitArgs = ["log", "--no-color"];
		if (options.additionalOptions && options.additionalOptions.length > 0) {
			options.additionalOptions.forEach(function(o) {
				gitArgs.push("--" + o);
			});
		} else {
			gitArgs.push(options.mergeCommits ? "--merges" : "--no-merges");
		}
		gitArgs.push(
			"--branches=" + options.branch,
			"--format=" + formatOptions,
			"--decorate=full",
			options.range
		);
		debug("Spawning git with args %o", gitArgs);
		var gitLog = spawn("git", gitArgs, {
			cwd: options.cwd,
			stdio: ["ignore", "pipe", process.stderr]
		});

		var allCommits = "";
		gitLog.stdout.on("data", function (data) {
			allCommits += data;
		});

		gitLog.on("exit", function (code) {
			debug("Git command exited with code '%d'", code);
			if (code === 0) {
				allCommits = normalizeNewlines(allCommits).trim();

				if (allCommits) {
					// Build the list of commits from git log
					var commits = processCommits(allCommits, options);
					resolve(commits);
				} else {
					resolve([]);
				}
			} else {
				// propagate error code
				reject(new Error("Git log exited with error code " + code));
			}
		});
	});
};

var newCommit = "___";
var formatOptions = [
	newCommit, "sha1:%H", "authorName:%an", "authorEmail:%ae", "authorDate:%aD",
	"committerName:%cn", "committerEmail:%ce", "committerDate:%cD",
	"title:%s", "%D", "%w(80,1,1)%b"
].join("%n");

function processCommits (commitMessages, options) {
	// This return an object with the same properties described above
	var stream = commitMessages.split("\n");
	var commits = [];
	var workingCommit;
	parser("Iterating on %d lines", stream.length);
	stream.forEach(function (rawLine) {
		parser("Raw line\n\t%s", rawLine);
		var line = parseLine(rawLine);
		parser("Parsed line %o", line);
		if (line.type === "new") {
			workingCommit = {
				messageLines : []
			};
			commits.push(workingCommit);
		} else if (line.type === "message") {
			workingCommit.messageLines.push(line.message);
		} else if (line.type === "title") {
			var title = parseTitle(line.message, options);
			parser("Parsed title %o", title);
			for (var prop in title) {
				workingCommit[prop] = title[prop];
			}
			if (!workingCommit.title) {
				// The parser doesn't return a title
				workingCommit.title = line.message;
			}
		} else if (line.type === "tag") {
			parser("Trying to parse tag %o", line.message);
			var tag = parseTag(line.message);
			parser("Parse tag %o", tag);
			workingCommit[line.type] = tag;
		} else {
			workingCommit[line.type] = line.message;
		}
	});
	return commits;
}

function parseLine (line) {
	if (line === newCommit) {
		return {
			type : "new"
		};
	}

	var match = line.match(/^([a-zA-Z]+1?)\s?:\s?(.*)$/i);

	if (match) {
		return {
			type : match[1],
			message : match[2].trim()
		};
	} else {
		return {
			type : "message",
			message : line.substring(1) // padding
		};
	}
}

function parseTitle (title, options) {
	var expression = options.title;
	var names = options.meaning || [];
	parser("Parsing title '%s' with regular expression '%s' and meanings %o", title, expression, names);

	var match = title.match(expression);
	if (!match) {
		return {
			title : title
		};
	} else {
		var builtObject = {};
		for (var i = 0; i < names.length; i += 1) {
			var name = names[i];
			var index = i + 1;
			builtObject[name] = match[index];
		}
		return builtObject;
	}
}

function parseTag (line) {
	var refs = line.split(/(refs)\/(tags|remotes|heads)\//);
	var tagIndex = refs.findIndex((token, index, all) => all[index - 2] === 'refs' && all[index - 1] === 'tags');
	if (tagIndex === refs.length - 1) {
		return refs[tagIndex];
	}
	return refs[tagIndex].replace(/, $/, '');
}

function normalizeNewlines(message) {
	return message.replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, '');
}
