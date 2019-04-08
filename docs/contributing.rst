============
Contributing
============

.. TODO: Write documentation of how to comment.
.. TODO: Write documentation of how to import packages.

For all forms of contribution, please read the information below.

.. contents:: Contents
  :local:

Installation
------------

Install Node.js_. This is mandatory to compile and run the code you are writing.

Install `Atom Text Editor`_. Edit files using this editor.

Packages for writing code
^^^^^^^^^^^^^^^^^^^^^^^^^

Please install the following packages into Atom to ensure you follow similar coding guidelines.

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

- language env
- language-gitattributes
- language-ignore
- highlight-selected
- minimap
- teletype

Packages for writing documentation
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

We use Sphinx_ to create our beautiful documentation. This is an plugin outside of Atom that is **required**.

To install Sphinx, ensure Python_ is installed on your computer. You can install Sphinx by running the following on your command line.

.. code-block:: bash

  pip install -U sphinx

After installing Sphinx, install the following package into Atom.

- language-restructuredtext

The following package is optional, but it will make your quality of life better when building documentation with others in real time.

- teletype

.. _Node.js: https://nodejs.org/en/
.. _Atom Text Editor: https://atom.io/
.. _Python: https://www.python.org/downloads/
.. _Sphinx: http://www.sphinx-doc.org/en/master/
