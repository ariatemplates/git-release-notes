## Release Notes

Generate release note pages from git commit history.

### Installation

It's preferable to install it globally through `npm`

    npm install -g git-release-notes

### Usage

The basic usage is

    cd <your_git_project>
    git-release-notes <since>..<until> <template>

Where

* `<since>..<until>` specifies the range of commits as in `git log`, see [gitrevisions(7)](http://www.kernel.org/pub/software/scm/git/docs/gitrevisions.html)
* `<template>` is an [ejs](https://github.com/visionmedia/ejs) template file used to generate the release notes

Two templates are included as reference, `markdown` and `html`.

This are for instance the release notes generated from `joyent/node` running

    git-release-notes v0.9.8..v0.9.9 html > changelog.html

<a href="https://github.com/ariatemplates/git-release-notes/raw/master/templates/node.png" target="_blank"><img src="https://github.com/ariatemplates/git-release-notes/raw/master/templates/node_thumb.png" alt="Node's release notes"></a>

#### Custom template

The second parameter of `git-release-notes` can be any path to a valid ejs template files.

The only available template local variable is `commits` that is an array of commits, each containing

* `sha1` commit hash (%H)
* `authorName` author name (%an)
* `authorEmail` author email (%ae)
* `authorDate` author date (%aD)
* `committerName` committer name (%cn)
* `committerEmail` committer email (%ce)
* `committerDate` committer date (%cD)
* `title` subject (%s)
* `messageLines` array of body lines (%b)


### Options

More advanced options are

* `p` or `path` Git project path, defaults to the current working path
* `b` or `branch` Git branch, defaults to `master`
* `t` or `title` Regular expression to parse the commit title (see next chapter)
* `m` or `meaning` Meaning of capturing block in title's regular expression
* `f` or `file` JSON Configuration file, better option when you don't want to pass all parameters to the command line, for an example see [options.json](https://github.com/ariatemplates/git-release-notes/blob/master/options.json)
* `n` or `new` If there are no changes since the last generation, do not return old ones. Output tempalte will show "No Changes"

#### Title Parsing

Some projects might have special naming conventions for the commit title.

The options `t` and `m` allow to specify this logic and extract additional information from the title.

For instance, [Aria Templates](https://github.com/ariatemplates/ariatemplates) has the following convention

    fix #123 Title of a bug fix commit
    feat #234 Title of a cool new feature

In this case using

    git-release-notes -t "^([a-z]+) #(\d+) (.*)$" -m type -m issue -m title v1.3.6..HEAD html

generates the additional fields on the commit object

* `type` first capturing block
* `issue` second capturing block
* `title` third capturing block (redefines the title)


Another project using similar conventions is [AngularJs](https://github.com/angular/angular.js), [commit message conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#).

    git-release-notes -t "^(\w*)(?:\(([\w\$\.]*)\))?\: (.*)$" -m type -m scope -m title v1.1.2..v1.1.3 markdown
