# Getting started

For all forms of contribution, please read the information below.

----------------------------------------------------------------------------------------------------

## Required framework/plugins

Install the LTS version of [Node.js][]. This is required to compile and run the code you are
writing.

Install the latest version of [Python 3.7][]. This is required to build documentation such as this.

Install [Atom][]. Edit files using this text editor.

Install [Git][]. This is for version control for GCS.

----------------------------------------------------------------------------------------------------

## Required Git line-ending configuration

GCS uses LF line-endings for all its files. All Unix-based systems already use the correct Git
line-ending configuration, so feel free to skip this section if you use a Unix system (Linux/macOS).

Run the following commands in your console to set the proper line-ending configuration in your
system:

```bash
git config --global core.autocrlf false
git config --global core.eol lf
```

----------------------------------------------------------------------------------------------------

## Requirements for writing code and documentation

### Atom configuration

Install the following packages into your Atom text editor. These packages will ensure that your
code is consistent with other developers. Go to `Settings > Install` to install packages.

  - atom-typescript
  - autocomplete-modules
  - busy-signal
  - file-icons
  - highlight-selected
  - hyperclick
  - intentions
  - language-env
  - language-gitattributes
  - language-ignore
  - linter
  - linter-eslint
  - linter-js-yaml
  - linter-jsonlint
  - linter-markdown
  - linter-stylelint
  - linter-ui-default
  - markdown-table-editor
  - minimap
  - react
  - teletype

Set the following settings to configure your Atom text editor for this project. All files in this
project have 100 characters max.

  - Set `Settings > Editor > Preferred Line Length` to 100
  - Keep `Settings > Editor > Soft Wrap` unchecked

### MkDocs documentation packages

We use a few Python packages to build our documentation. [MkDocs][] allows us to build our
documentation. Our documentation uses [Material][] theme so this must be installed too. We also have
a few plugins to make things work for our docs.

To install the packages, run the following script on your command line:

```bash
pip install mkdocs mkdocs-material markdown-include mkdocs-git-revision-date-localized-plugin
```

[Node.js]: https://nodejs.org/en/
[Atom]: https://atom.io/
[Python 3.7]: https://www.python.org/downloads/
[Homebrew]: https://brew.sh/
[Git]: https://git-scm.com/
[MkDocs]: https://www.mkdocs.org/
[Material]: https://squidfunk.github.io/mkdocs-material/
