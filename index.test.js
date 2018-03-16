const path = require('path');
const index = require('./index');

describe('index module', () => {
  it('rejects if the template cannot be found', () => {
    const OPTIONS = {};
    const RANGE = 'since..to';
    return expect(index(OPTIONS, RANGE, 'missing-template')).rejects.toThrow(/template file/);
  });

  it('rejects if the configuation in invalid', () => {
    const OPTIONS = { f: 'missing-configuration' };
    const RANGE = 'since..to';
    return expect(index(OPTIONS, RANGE, 'markdown')).rejects.toThrow(/configuration file/);
  });

  it('rejects if git log range is invalid', () => {
    const OPTIONS = {};
    const RANGE = 'since..to';
    return expect(index(OPTIONS, RANGE, 'markdown')).rejects.toThrow(/git log exited/i);
  });

  it('rejects if the external script fails', () => {
    const OPTIONS = {
      script: 'lib/__tests__/scripts/throws.js',
      branch: 'testing-branch',
    };
    const RANGE = '7d27899..28b863e';
    return expect(index(OPTIONS, RANGE, 'markdown')).rejects.toThrow(/processing external script/i);
  });

  it('rejects if the rendering template causes errors', () => {
    const OPTIONS = {
      script: 'lib/__tests__/scripts/rename.js',
      branch: 'testing-branch',
    };
    const RANGE = '7d27899..28b863e';
    return expect(index(OPTIONS, RANGE, 'lib/__tests__/templates/invalid.ejs')).rejects.toThrow(/broken is not defined/i);
  });

  it('resolves with the rendered template', () => {
    const OPTIONS = {
      branch: 'testing-branch',
    };
    const RANGE = '7d27899..28b863e';
    return expect(index(OPTIONS, RANGE, 'markdown')).resolves.toMatch(/__2.1.0__/i);
  });
});
