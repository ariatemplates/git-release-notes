const path = require('path');
const resolveOptions = require('../file-system').resolveOptions;
const resolveTemplate = require('../file-system').resolveTemplate;

describe('resolveTemplate', () => {
  it('finds a local template by name', () => {
    return resolveTemplate('markdown').then((file) => {
      expect(file).toMatch(/commits\.forEach/);
    });
  });

  it('finds a local template by name and extension', () => {
    return resolveTemplate('markdown.ejs').then((file) => {
      expect(file).toMatch(/commits\.forEach/);
    });
  });

  it('finds a template with a relative path', () => {
    return resolveTemplate('templates/html.ejs').then((file) => {
      expect(file).toMatch(/commits\.forEach/);
    });
  });

  it('finds a template with an absolute path', () => {
    return resolveTemplate(path.join(__dirname, '../../templates/html.ejs')).then((file) => {
      expect(file).toMatch(/commits\.forEach/);
    });
  });

  it('rejects if the template cannot be found', () => {
    return expect(resolveTemplate('missing-template')).rejects.toThrow(/Unable to locate template file/);
  })
});

describe('resolveOptions', () => {
  it('returns the original options if no file is specified', () => {
    const OPTIONS = {
      b: 'test',
      invalid: 'yolo',
      c: false
    };
    return expect(resolveOptions(OPTIONS)).resolves.toEqual({
      b: 'test',
      c: false,
      m: 'type',
      o: [],
      p: process.cwd(),
      t: '(.*)'
    });
  });

  it('returns the options of a json file relative to the current path', () => {
    const OPTIONS = {
      file: 'lib/__tests__/config.options.json'
    };
    return expect(resolveOptions(OPTIONS)).resolves.toEqual({
      b: 'master',
      m: 'type',
      o: [],
      p: process.cwd(),
      t: '(.*)'
    });
  });

  it('returns the options of a json file with absolute path', () => {
    const OPTIONS = {
      file: path.join(__dirname, 'config.options.json')
    };
    return expect(resolveOptions(OPTIONS)).resolves.toEqual({
      b: 'master',
      m: 'type',
      o: [],
      p: process.cwd(),
      t: '(.*)'
    });
  });

  it('rejects if the file cannot be found', () => {
    const OPTIONS = { f: 'missing-options-file' };
    return expect(resolveOptions(OPTIONS)).rejects.toThrow(/unable to read/i);
  });

  it('rejects if the file is not json', () => {
    const OPTIONS = { f: 'README.md' };
    return expect(resolveOptions(OPTIONS)).rejects.toThrow(/invalid json/i);
  });
});
