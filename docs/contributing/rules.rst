=====
Rules
=====



----------

Commenting
==========

Single-line Comments
--------------------

Typically, the single-line comment is used to document the code by making a quick comment about a single line of code. These comments are ignored by the compiler and are for the programmer's use only.

.. code-block:: ts

  // Single-line Comments
  const test = 1;


Multi-line Comments
-------------------

The ``/*`` and ``*/`` pair of symbols denote the multi-line comment, which is used by programmers for large text descriptions of code or to comment out chunks of code while debugging applications.

.. code-block:: js

  /*
   * Multi-line
   * Comments
   */
  const test = 1;

Everything in between the symbols is ignored. Just like single line comments, multi-line comments are ignored by the compiler and are for the programmer's use only.

.. note:: Multi-line style comments cannot be nested.

Using a syntax highlighter is recommended, as the different coloring for comments should make clear what’s considered part of the comment versus what is not.


Using Comments to Prevent Execution
-----------------------------------

Comments can be used to prevent the execution of a line of code, which is useful for code testing.
Adding // in front of a line of code changes the code lines from an executable line to a comment that is ignored by the compiler.

.. code-block:: ts

  //document.getElementById("myH").innerHTML = "My First Page";
  document.getElementById("myP").innerHTML = "My first paragraph.";

Similarly, multiple lines of code can be prevented from execution by utilizing multi-line commenting.

.. code-block:: js

  /*
   * document.getElementById("myH").innerHTML = "My First Page";
   * document.getElementById("myP").innerHTML = "My first paragraph.";
   */

Defining a Function
-------------------

Descriptive comments can be the tethered to functions by including ``/**`` and ``*/`` around the comment. Take notice of the additional asterisk after the first ``/``, as this is what distinguishes this type of comment from a normal multi-line comment.

.. code-block:: typescript

  /**
   * Defining a Function
   * @param parameterName Description of parameter.
   */
  function test(parameterName: int): void{}

.. note:: By tethering a comment to a function, the descriptive comment will appear whenever the cursor hovers above the function. This is useful as less comments are required to document code and can be accessed throughout the program.

Description of Interface or Variable
-----------------------------------

Descriptive comments can be the tethered to interface as well by including ``/**`` and ``*/`` around the comment.

.. code-block:: typescript

  /**
   * Description of an Interface
   */
  interface Test {
    x: string;
  }

.. note:: By tethering a comment to an interface, the descriptive comment will appear whenever the cursor hovers above the interface. This is useful as less comments are required to document code and can be accessed throughout the program.


---------

Importing
=========
