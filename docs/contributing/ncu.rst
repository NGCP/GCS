=======================
Upgrading Package Files
=======================

.. TODO: Write documentation of what ncu does and how to use it

-----

Usage
=====
To make sure that all your dependencies are up to date, run the following command.

.. code-block:: sh

  ncu
  [====================] 49/49 100%

  @types/react         ^16.8.15  →  ^16.8.16
  electron               ^3.1.8  →    ^5.0.1
  eslint-plugin-react   ^7.12.4  →   ^7.13.0

To upgrade your dependencies to the latest version, run the following command.

.. code-block:: sh

  ncu -u

------------

Installation
============

Run npm install to install new versions.

.. code-block:: sh

  npm install
