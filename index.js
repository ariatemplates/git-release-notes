var git = require('./lib/git');
var ejs = require('ejs');
var debug = require('debug')('release-notes:cli');
var fileSystem = require('./lib/file-system');
var processCommits = require('./lib/process').processCommits;
var dateFnsFormat = require('date-fns/format');

module.exports = function module(cliOptions, positionalRange, positionalTemplate) {
	return fileSystem.resolveTemplate(positionalTemplate).then(function (template) {
		return fileSystem.resolveOptions(cliOptions).then(function (options) {
			debug("Running git log in '%s' on branch '%s' with range '%s'", options.p, options.b, positionalRange);
			return git.log({
				branch: options.b,
				range: positionalRange,
				title: options.i ? new RegExp(options.t, 'i') : new RegExp(options.t),
				meaning: Array.isArray(options.m) ? options.m: [options.m],
				cwd: options.p,
				mergeCommits: options.c,
				additionalOptions: Array.isArray(options.o) ? options.o : [options.o]
			}).then(function (commits) {
				return processCommits(options, commits, positionalRange);
			}).then(function (data) {
				return render(positionalRange, template, data);
			});
		});
	});
};

function render(range, templateContent, data) {
	debug("Rendering template");
	return ejs.render(templateContent, Object.assign({
		range: range,
		dateFnsFormat: dateFnsFormat
	}, data));
}
