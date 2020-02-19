=================
Coding Guidelines
=================

The core coding standards for the NGCP project is `here <https://ngcp-calpoly.quip.com/0aJOAkm70ZzI/NGCP-Coding-Standards-and-Practices>`__. **It is required to read this if you are to contribute to GCS.**

Everything else discussed in this page talks about standards specific to GCS.

----------------------------------------------------------------------------------------------------

Managing GCS's version
======================

The root of GCS's repository contains a file called ``package.json``. That file has a ``version`` field, which indicates GCS's version.

.. literalinclude:: ../../package.json
  :language: json
  :linenos:
  :lines: 1-7
  :emphasize-lines: 3

The ``version`` field is a string with the format "X.Y.Z". Here are the guidelines on how to update them:

- Update X if a major update happens. This happens when a big update in GCS happens.
- Update Y if a minor update happens. This happens when a small update in GCS happens.
- Update Z if a patch update happens. This includes bug patches and dependency version bumps (usually from `Dependabot`_)

.. note:: **Always** update the package version for every pull request that is made. If package version is not updated, either update it or ask the person creating the pull request to update it.

.. _Dependabot: https://dependabot.com/
