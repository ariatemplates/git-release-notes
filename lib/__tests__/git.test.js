const gitLog = require('../git').log;

describe('log commits', () => {
  it('lists all commit excluding merges by default', () => {
    const OPTIONS = {
      additionalOptions: [],
      branch: 'testing-branch',
      range: '7d27899..28b863e',
      title: '',
      meaning: ''
    };

    return expectCommits(OPTIONS).toEqual([
      '2.1.0',
      // Skip the merge commit
      'Add option for using "--merges" with git log',
    ]);
  });

  it('lists only merge commits', () => {
    const OPTIONS = {
      additionalOptions: [],
      mergeCommits: true,
      branch: 'testing-branch',
      range: '7d27899..28b863e',
      title: '',
      meaning: ''
    };

    return expectCommits(OPTIONS).toEqual([
      'Merge branch \'dvoiss-master\'',
    ]);
  });

  it('additional git arguments', () => {
    const OPTIONS = {
      additionalOptions: ['author=david'],
      branch: 'testing-branch',
      range: '7d27899..28b863e',
      title: '',
      meaning: ''
    };

    return expectCommits(OPTIONS).toEqual([
      'Add option for using "--merges" with git log',
    ]);
  });
});

function expectCommits(options) {
  return expect(gitLog(options).then((commits) => commits.map((c) => c.title))).resolves;
}
