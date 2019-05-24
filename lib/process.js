var fs = require('fs');
var path = require('path');
var vm = require('vm');
var debug = require('debug')('release-notes:process');
var dateFnsFormat = require('date-fns/format');

exports.processCommits = function processCommits(options, commits, range) {
	debug("Got %d commits", commits.length);
	if (commits.length === 0) {
    return Promise.reject(new Error('No commits in the specified range'));
  }

	var funcOrPath = options.s || options.script;
	if (!funcOrPath) {
    debug("Rendering template without post processing");
    return Promise.resolve({ commits: commits });
	}

	var inputData = {
		commits,
		range,
		dateFnsFormat
	};

	if (typeof funcOrPath === 'function') {
		var externalFunction = funcOrPath;

		return new Promise((resolve, reject) => {
			try {
				externalFunction(Object.assign(inputData, {
					debug: require("debug")("release-notes:externalfunction")
				}), function(outputData) {
					resolve(outputData);
				})
			} catch(e) {
				debug("Exception while running external function '%s'", e.message);
				reject(new Error(`Error while processing external function`));
			}
		})
	}

	var externalScriptPath = funcOrPath;
  return new Promise(function (resolve, reject) {
    debug(`Trying to run the external script from ${externalScriptPath}`);
    fs.readFile(externalScriptPath, function (err, scriptBuffer) {
      if (err) {
        reject(new Error(`Unable to read script file ${externalScriptPath}: ${err.message}`));
      } else {
        var sandbox = {
					module: { exports: {} },
					require: (module) => {
						var resolved = (module.indexOf('./') === 0) ? path.resolve(path.dirname(externalScriptPath), module) : module;
						return require(resolved);
					},
					__dirname: path.dirname(externalScriptPath),
					__filename: externalScriptPath,
					process: process,
					console: console,
				};
        debug("Trying to run the external script in a new sandbox");
        try {
          vm.runInNewContext(scriptBuffer.toString(), sandbox, {
            filename: externalScriptPath,
            displayErrors: true,
          });

					debug(`Calling the external script function with ${JSON.stringify(inputData, null, '  ')}`);
					var debugScript = require("debug")("release-notes:externalscript");
          sandbox.module.exports(Object.assign(inputData, {
						debug: debugScript
					}), function (outputData) {
            try {
              debugScript("Output data received from the external script `%s`", JSON.stringify(outputData || {}, null, '  '));
            } catch (ex) { /* ignore just in case there are circular references */ }
            resolve(outputData);
          });
        } catch (ex) {
          debug("Exception while running external script '%s'", ex.message);
          reject(new Error(`Error while processing external script`));
        }
      }
    });
  });
}
