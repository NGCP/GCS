===========================
NGCP Ground Control Station
===========================

.. image:: https://travis-ci.com/NGCP/GCS.svg?branch=master
  :target: https://travis-ci.com/NGCP/GCS
  :alt: Build Status

.. image:: https://readthedocs.org/projects/ground-control-station/badge/?version=latest
  :target: https://ground-control-station.readthedocs.io/en/latest/?badge=latest
  :alt: Documentation Statussafasfasfsa

.. image:: https://david-dm.org/NGCP/GCS/status.svg
  :target: https://david-dm.org/NGCP/GCS
  :alt: dependencies Status

.. image:: https://david-dm.org/NGCP/GCS/dev-status.svg
  :target: https://david-dm.org/NGCP/GCS?type=dev
  :alt: devDependencies Status

Introduction
============

The `Northrop Grumman Collaboration Project`_ presents the Ground Control Station (GCS). This project's objective is to view and set missions for all autonomous vehicle platforms in the project.

Documentation for the GCS can be found `here <https://ground-control-station.readthedocs.io/>`_.

Requirements
============

You will need the latest LTS version of `Node.js`_. You will also need the latest version of `Python 2`_.

Getting Started
===============

**Setting Things Up**

Open up your command line application and clone this repository

.. code-block:: bash

  git clone https://github.com/NGCP/GCS.git

**Running the Program**

Create a `Mapbox account`_ and obtain a public API access token. Create a ``.env`` file, copy the content of the ``.env.example`` to it, and replace ``your-access-token`` with your own access token.

.. code-block:: bash

  MAPBOX_TOKEN=your-access-token

Install all required third-party libraries and run the program:

.. code-block:: bash

  cd path/to/GCS
  npm install
  npm start

License
=======

`MIT <https://github.com/NGCP/GCS/blob/master/LICENSE>`_

.. _Northrop Grumman Collaboration Project: http://www.ngcpcalpoly.com/about.html
.. _Node.js: https://nodejs.org/
.. _Python 2: https://www.python.org/downloads/release/python-2716/
.. _Mapbox account: https://www.mapbox.com/account/
