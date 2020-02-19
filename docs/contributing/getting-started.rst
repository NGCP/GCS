===============
Getting Started
===============

For all forms of contribution, please read the information below.

----------------------------------------------------------------------------------------------------

Required framework/plugins
==========================

Install the LTS version of Node.js_. This is required to compile and run the code you are writing. Python2_ is also required to compile and run the code (a plugin we use uses it).

Install the latest version of Python_. This is required to build documentation such as this.

Install `Atom`_. Edit files using this text editor.

Install `Git`_. This is for version control for GCS.

----------------------------------------------------------------------------------------------------

Required Git line-ending configuration
======================================

GCS uses LF line-endings for all its files. All Unix-based systems already use the correct Git line-ending configuration, so feel free to skip this section if you use a Unix system (Linux/macOS).

Run the following commands in your console to set the proper line-ending configuration in your system:

.. code-block:: sh

  git config --global core.autocrlf false
  git config --global core.eol lf

----------------------------------------------------------------------------------------------------

Requirements for writing code and documentation
===============================================

Atom packages
-------------

Install the following packages into your Atom text editor. These packages will ensure that your code is consistent with other developers.

- atom-typescript
- busy-signal
- highlight-selected
- hyperclick
- intentions
- linter
- language-env
- language-gitattributes
- language-ignore
- language-sphinx
- linter-eslint
- linter-js-yaml
- linter-jsonlint
- linter-stylelint
- linter-ui-default
- minimap
- react
- todo

You can install the following package too. These packages are completely optional.

- teletype

Sphinx documentation packages
-----------------------------

We use a few Python packages to build our documentation. Sphinx_ allows us to create our documentation, and `Sphinx Autobuild`_ allows us to see our documentation as we build it. Our documentation uses the `Read the Docs Sphinx Theme`_ so this must be installed too.

To install the packages, run the following script on your command line:

.. code-block:: sh

  pip install sphinx sphinx-autobuild sphinx_rtd_theme

----------------------------------------------------------------------------------------------------

Helpful links
=============

Sphinx documentation: https://www.sphinx-doc.org/en/latest/contents.html

React.js tutorial (we use React to write the GCS UI): https://reactjs.org/tutorial/tutorial.html

Documenting your TypeScript code: https://typedoc.org/guides/doccomments/

.. _Node.js: https://nodejs.org/en/
.. _Atom: https://atom.io/
.. _Python: https://www.python.org/downloads/
.. _Python2: https://www.python.org/downloads/release/python-278/
.. _Git: https://git-scm.com/
.. _Sphinx: http://www.sphinx-doc.org/en/master/
.. _Sphinx Autobuild: https://github.com/GaretJax/sphinx-autobuild
.. _Read the Docs Sphinx Theme: https://sphinx-rtd-theme.readthedocs.io/en/latest/index.html
