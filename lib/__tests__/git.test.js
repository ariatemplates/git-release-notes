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

  it('list tags', () => {
    const OPTIONS = {
      branch: 'testing-branch',
      range: '575fef3..28b863e',
    };

    return expectTags(OPTIONS).toEqual([
      'v2.1.0',
      'no tag',
      'v2.0.0'
    ]);
  });
});

const expectCommits = (_) => expect(gitLog(_).then((commits) => commits.map((c) => c.title))).resolves;
const expectTags = (_) => expect(gitLog(_).then((commits) => commits.map((c) => c.tag || 'no tag'))).resolves;
