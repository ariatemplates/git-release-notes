/**
 * Jira used the syntax `<project>-<issue_id>` to link PRs to the original task e.g. VP-986
 * Based upon ../samples/post-processing.js
 */

const TITLE_REGEX = /^([A-Z]+-\d+) (.*)$/;
const ISSUE_TRACKER_HOST = "https://virdocs.atlassian.net/browse/";

module.exports = function (data, callback) {
  const rewritten = data.commits.map((commit) => {
    const matches = commit.title.match(TITLE_REGEX);
    if (matches && matches.length > 2) {
      // extra metadata to remember the linked tasks
			commit.issue = matches[1];
      commit.issueLink = ISSUE_TRACKER_HOST + commit.issue;

      // remove issue from the title
      commit.title = matches[2];
    }

    return commit;
  });

  callback({
    commits: rewritten.filter(Boolean),
    // rewrite the range because the template only cares about the newest tag
    range: data.range.split('..')[1],
  });
};
