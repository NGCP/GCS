===============
Getting Started
===============

.. TODO: Write documentation of how to comment.
.. TODO: Write documentation of how to import packages.

For all forms of contribution, please read the information below.

--------------------------

Required framework/plugins
==========================

Install Node.js_. This is required to compile and run the code you are writing.

Install Python_. This is required to build documentation such as this.

Install `Atom`_. Edit files using this text editor.

Install `Git`_. This is for version control for GCS.

--------------------------------------

Required Git line-ending configuration
======================================

GCS uses LF line-endings for all its files. All Unix-based systems already use the correct Git line-ending configuration, so feel free to skip this section if you use a Unix system (Linux/macOS).

Run the following commands in your console to set the proper line-ending configuration in your system:

.. code-block:: sh

  git config --global core.autocrlf false
  git config --global core.eol lf

-----------------------------

Requirements for writing code
=============================

We use a few Node.js modules that need to be installed in your system. `npm-check-updates`_ lets us keep our project dependencies up to date.

Run the following script to install the modules.

.. code-block:: sh

  npm install -g npm-check-updates

Aftwards, install the following packages into Atom. These packages will ensure that your code is consistent with other developers.

- atom-typescript
- busy-signal
- hyperclick
- intentions
- linter
- linter-eslint
- linter-js-yaml
- linter-jsonlint
- linter-stylelint
- linter-ui-default
- react
- todo

You can install the following packages too. These packages are completely optional, but they improve the quality of life while coding greatly.

- language-env
- language-gitattributes
- language-ignore
- highlight-selected
- minimap
- teletype

------------------------------

Requirements for building docs
==============================

We use a few Python packages to build our documentation. Sphinx_ allows us to create our documentation, and `Sphinx Autobuild`_ allows us to see our documentation as we build it.

Our documentation uses the `Read the Docs Sphinx Theme`_ so this must be installed too.

To install the packages, run the following script on your command line:

.. code-block:: sh

  pip install sphinx sphinx-autobuild sphinx_rtd_theme

These Python packages are all you need to build the documentation. The following packages are what you need to install on Atom.

- language-restructuredtext

The following package is optional, but it will make your quality of life better when building documentation with others in real time.

- highlight-selected
- minimap
- teletype

.. _Node.js: https://nodejs.org/en/
.. _Atom: https://atom.io/
.. _Python: https://www.python.org/downloads/
.. _Git: https://git-scm.com/
.. _npm-check-updates: https://github.com/tjunnone/npm-check-updates
.. _Sphinx: http://www.sphinx-doc.org/en/master/
.. _Sphinx Autobuild: https://github.com/GaretJax/sphinx-autobuild
.. _Read the Docs Sphinx Theme: https://sphinx-rtd-theme.readthedocs.io/en/latest/index.html
