/**
 * Waffle.io uses the syntax `[Connected to #123]` to link PRs to the original task
 */
const WAFFLE_INFO = /\[connected to #\d+\]\s?/gi;
const ISSUE_ID = /#(\d+)/;

module.exports = function (data, callback) {
  const rewritten = data.commits.map((commit) => {
    const matches = commit.title.match(WAFFLE_INFO);
    if (matches) {
      // extra metadata to remember the linked tasks
      commit.tasks = matches.map((m) => m.match(ISSUE_ID)[1]);
      // remove it from the title
      commit.title = commit.title.replace(WAFFLE_INFO, '');
    }

    if (commit.title.indexOf('[skip ci]') !== -1) {
      // Filter out commits we don't care about
      return null;
    }

    return commit;
  });

  callback({
    commits: rewritten.filter(Boolean),
    // rewrite the range because the template only cares about the starting point
    range: data.range.split('.')[0],
  });
}
