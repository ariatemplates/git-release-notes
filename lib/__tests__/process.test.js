const processCommits = require('../process').processCommits;
const path = require('path');

describe('processCommits', () => {
  it('rejects if there are no commits', () => {
    const OPTIONS = {};
    const COMMITS = [];
    const RANGE = 'here..there';
    return expect(processCommits(OPTIONS, COMMITS, RANGE)).rejects.toThrow(/no commits/i);
  });

  it('returns the list of commits unchanged if there is no script file', () => {
    const OPTIONS = {};
    const COMMITS = [{ title: 'first commit' }];
    const RANGE = 'here..there';
    return expect(processCommits(OPTIONS, COMMITS, RANGE)).resolves.toEqual({ commits: COMMITS });
  });

  it('rejects if the script cannot be found', () => {
    const OPTIONS = { s: 'missing-script-file' };
    const COMMITS = [{ title: 'first commit' }];
    const RANGE = 'here..there';
    return expect(processCommits(OPTIONS, COMMITS, RANGE)).rejects.toThrow(/Unable to read script file/i);
  });

  it('propagates errors when the script fails (absolute path)', () => {
    const OPTIONS = { s: path.join(__dirname, 'scripts/throws.js') };
    const COMMITS = [{ title: 'first commit' }];
    const RANGE = 'here..there';
    return expect(processCommits(OPTIONS, COMMITS, RANGE)).rejects.toThrow(/processing external script/i);
  });

  it('propagates errors if the external script has syntax errors (relative path)', () => {
    const OPTIONS = { script: 'lib/__tests__/scripts/syntax.js' };
    const COMMITS = [{ title: 'first commit' }];
    const RANGE = 'here..there';
    return expect(processCommits(OPTIONS, COMMITS, RANGE)).rejects.toThrow(/processing external script/i);
  });

  it('resolves with the processed data', () => {
    const OPTIONS = { script: 'lib/__tests__/scripts/rename.js' };
    const COMMITS = [{ title: 'first commit' }, { title: 'second commit' }];
    const RANGE = 'here..there';
    return expect(processCommits(OPTIONS, COMMITS, RANGE)).resolves.toEqual({
      commits: ['renamed from first commit', 'renamed from second commit'],
    });
  });

  it('resolves with the processed data with scripts using require', () => {
    const OPTIONS = { script: 'lib/__tests__/scripts/nested.js' };
    const COMMITS = [{ title: 'first commit' }, { title: 'second commit' }];
    const RANGE = 'here..there';
    return expect(processCommits(OPTIONS, COMMITS, RANGE)).resolves.toEqual({
      commits: ['renamed from first commit', 'renamed from second commit'],
    });
  });
});
