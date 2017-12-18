var debug = require("debug")("release-notes:git");
var parser = require("debug")("release-notes:parser");

exports.log = function (options, callback) {
	var spawn = require("child_process").spawn;
	var commits = options.mergeCommits ? "--merges" : "--no-merges";
	var gitArgs = ["log", "--no-color", commits, "--branches=" + options.branch, "--format=" + formatOptions, options.range];
	debug("Spawning git with args %o", gitArgs);
	var gitLog = spawn("git", gitArgs, {
		cwd : options.cwd,
		stdio : ["ignore", "pipe", process.stderr]
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
				commits = filterCommits(commits, options);
				callback(commits);
			} else {
				callback([]);
			}
		} else {
			// propagate error code
			process.exit(code);
		}
	});
};

var newCommit = "___";
var formatOptions = [
	newCommit, "sha1:%H", "authorName:%an", "authorEmail:%ae", "authorDate:%aD",
	"committerName:%cn", "committerEmail:%ce", "committerDate:%cD",
	"title:%s", "%w(80,1,1)%b"
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
	var names = options.meaning;
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

function normalizeNewlines(message) {
	return message.replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, '');
}

function filterCommits(commits, options) {
	var expression = new RegExp(options.regex);
	parser("options.regex");
	parser(options.regex);
	if(!expression) {
		return commits;
	}
	var filteredCommits = [];
	for (var i = 0, len = commits.length; i < len; i++) {
		var commit = commits[i];
		parser("title");
		parser(commit.title);
		var match = commit.title.match(expression);
		if(match){
			parser("including commit");
			filteredCommits.push(commit);
		}
	}
	return filteredCommits;
}
