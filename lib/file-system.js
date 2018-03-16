var debug = require("debug")("release-notes:fs");
var fs = require("fs");
var path = require("path");

/**
 * Name could be either
 * - a string for the known templates (with or without .ejs)
 * - a relative path
 * - an absolute path
 */
exports.resolveTemplate = function resolveTemplate(template) {
  debug("Trying to locate template '%s'", template);
  return new Promise(function (resolve, reject) {
    // TODO remove fs.R_OK when we stop supporting node 4 and only use fs.constants.R_OK
    fs.access(template, fs.constants ? fs.constants.R_OK : fs.R_OK, function (error) {
      if (error) {
        debug("Template file '%s' doesn't exist, maybe it's template name", template);

        if (template.match(/[a-z]+(\.ejs)?/)) {
          const localPath = path.resolve(__dirname, "../templates/" + path.basename(template, ".ejs") + ".ejs");
          debug("Checking local template file ", localPath);
          // TODO remove fs.R_OK when we stop supporting node 4 and only use fs.constants.R_OK
          fs.access(localPath, fs.constants ? fs.constants.R_OK : fs.R_OK, function (err) {
            if (err) reject(new Error(`Unable to locate template file ${template}`));
            else resolve(localPath);
          });
        } else {
          reject(new Error(`Unable to locate template file ${template}`));
        }
      } else {
        resolve(template);
      }
    });
  }).then(readTemplate);
};

/**
 * Options could come from file
 */
exports.resolveOptions = function resolveOptions(originalOptions) {
  const ALL_OPTIONS = [
    ['b', 'branch', 'master'],
    ['t', 'title', '(.*)'],
    ['i', 'ignoreCase'],
    ['m', 'meaning', 'type'],
    ['o', 'gitlogOption', []],
    ['p', 'path', process.cwd()],
    ['s', 'script'],
    ['c', 'mergeCommits']
  ];

  return new Promise(function (resolve, reject) {
    const optionsFile = originalOptions.f || originalOptions.file;
    var options = {};
		if (optionsFile) {
			debug("Trying to read configuration file '%s'", optionsFile);
      fs.readFile(optionsFile, function (err, data) {
				if (err) {
					reject(new Error("Unable to read configuration file\n" + err.message));
				} else {
					try {
            var stored = JSON.parse(data);
            ALL_OPTIONS.forEach(function (pairs) {
              var short = pairs[0], long = pairs[1], def = pairs[2];
              var value = [
                stored[short],
                stored[long],
                originalOptions[short],
                originalOptions[long],
                def
              ].filter((value) => value !== undefined)[0];
              if (value !== undefined) options[short] = value;
            });
            resolve(options);
					} catch (ex) {
						reject(new Error("Invalid JSON in configuration file"));
					}
				}
			});
		} else {
      ALL_OPTIONS.forEach(function (pairs) {
        var short = pairs[0], long = pairs[1], def = pairs[2];
        var value = [
          originalOptions[short],
          originalOptions[long],
          def
        ].filter((value) => value !== undefined)[0];
        if (value !== undefined) options[short] = value;
      });
			resolve(options);
		}
	});
}

function readTemplate(template) {
	debug("Trying to read template '%s'", template);
	return new Promise(function (resolve, reject) {
		fs.readFile(template, function (err, templateContent) {
			if (err) {
				reject(new Error(`Unable to locate template file ${template}`));
			} else {
				resolve(templateContent.toString());
			}
		});
	});
}
