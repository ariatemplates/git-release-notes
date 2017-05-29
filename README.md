## Release Notes

Generate release note pages from git commit history.

### Installation

It's preferable to install it globally through [`npm`](https://www.npmjs.com/package/git-release-notes)

    npm install -g git-release-notes

### Usage

The basic usage is

    cd <your_git_project>
    git-release-notes <since>..<until> <template>

Where

* `<since>..<until>` specifies the range of commits as in `git log`, see [gitrevisions(7)](http://www.kernel.org/pub/software/scm/git/docs/gitrevisions.html)
* `<template>` is an [ejs](https://github.com/visionmedia/ejs) template file used to generate the release notes

Three sample templates are included as a reference in the `templates` folder

 * `markdown` [(sample)](https://github.com/ariatemplates/git-release-notes/blob/master/samples/output-markdown.md)
 * `html` [(sample)](http://htmlpreview.github.io/?https://github.com/ariatemplates/git-release-notes/blob/master/samples/output-html.html)
 * `html-bootstrap` [(sample)](http://htmlpreview.github.io/?https://github.com/ariatemplates/git-release-notes/blob/master/samples/output-html-bootstrap.html)

This for example is the release notes generated for `joyent/node` by running

    git-release-notes v0.9.8..v0.9.9 html > changelog.html

[<img src="https://github.com/ariatemplates/git-release-notes/raw/master/samples/node_thumb.png" alt="Node's release notes">](https://github.com/ariatemplates/git-release-notes/raw/master/samples/node.png)

#### Custom template

The second parameter of `git-release-notes` can be any path to a valid ejs template files.

##### Template Variables

Several template variables are made available to the script running inside the template.

`commits` is an array of commits, each containing

* `sha1` commit hash (%H)
* `authorName` author name (%an)
* `authorEmail` author email (%ae)
* `authorDate` author date (%aD)
* `committerName` committer name (%cn)
* `committerEmail` committer email (%ce)
* `committerDate` committer date (%cD)
* `title` subject (%s)
* `messageLines` array of body lines (%b)

`dateFnsFormat` is the date-fns [format](https://date-fns.org/docs/format) function. See the [html-bootstrap](https://github.com/ariatemplates/git-release-notes/blob/master/templates/html-bootstrap.ejs) for usage example.

`options` the object documented below. Useful for parsing the repository name. See the [html-bootstrap](https://github.com/ariatemplates/git-release-notes/blob/master/templates/html-bootstrap.ejs) for sample usage.

`request` is an instance of [sync-request](https://www.npmjs.com/package/sync-request). This can be useful for querying the Jira API for example to extract extra metadata about a ticket related to a commit.

`templateData` is an object parsed as JSON that is passed through to the template and can contain any arbitary data as required by the template. Useful for using the same template across different repositories.

### Command Line Options

More advanced command line options are

* `p` or `path` Git project path, defaults to the current working path
* `b` or `branch` Git branch, defaults to `master`
* `t` or `title` Regular expression to parse the commit title (see next chapter)
* `m` or `meaning` Meaning of capturing block in title's regular expression
* `f` or `file` JSON configuration file. This is a better option when you don't want to pass all parameters to the command line, for an example see [options.json](https://github.com/ariatemplates/git-release-notes/blob/master/options.json)
* `d` or `templateData` JSON data file that is passed straight through to the template.

#### Title Parsing

Some projects might have special naming conventions for the commit title.

The options `t` and `m` allow to specify this logic and extract additional information from the title.

For instance, [Aria Templates](https://github.com/ariatemplates/ariatemplates) has the following convention

    fix #123 Title of a bug fix commit
    feat #234 Title of a cool new feature

In this case using

```
git-release-notes -t "^([a-z]+) #(\d+) (.*)$" -m type -m issue -m title v1.3.6..HEAD html
```

generates the additional fields on the commit object

* `type` first capturing block
* `issue` second capturing block
* `title` third capturing block (redefines the title)


Another project using similar conventions is [AngularJs](https://github.com/angular/angular.js), [commit message conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#).

```
git-release-notes -t "^(\w*)(?:\(([\w\$\.]*)\))?\: (.*)$" -m type -m scope -m title v1.1.2..v1.1.3 markdown
```

### Development
To execute from this source against another repository, use a command like

    node index.js -p C:\Code\other-repo 0841c28..9a480d5 ./templates/html-bootstrap.ejs > other-repo-notes.html


### Debug

If the output is not what you expect, set the `DEBUG` environment variable:

#### Linux
    DEBUG=release-notes:* git-release-notes ...

#### Windows

    SET DEBUG=release-notes:*
    git-release-notes ...
