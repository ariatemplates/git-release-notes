exports.log = function (options, callback) {
	var spawn = require("child_process").spawn;
	var gitArgs = ["log", "--no-color", "--no-merges", "--branches=" + options.branch, "--format=" + formatOptions, options.range];
	var gitLog = spawn("git", gitArgs, {
		cwd : options.cwd,
		stdio : ["ignore", "pipe", process.stderr]
	});

	var allCommits = "";
	gitLog.stdout.on("data", function (data) {
		allCommits += data;
	});

	gitLog.on("close", function (code) {
		if (code === 0) {
			// Build the list of commits from git log
			var commits = []
			if (allCommits) {
				commits = processCommits(allCommits.replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, ''), options);
			}
			callback(commits);
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
	stream.forEach(function (rawLine) {
		var line = parseLine(rawLine);
		if (line.type === "new") {
			workingCommit = {
				messageLines : []
			};
			commits.push(workingCommit);
		} else if (line.type === "message") {
			workingCommit.messageLines.push(line.message);
		} else if (line.type === "title") {
			var title = parseTitle(line.message, options);
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