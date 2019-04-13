========
Examples
========

The following are examples of how the flow of messages will be for each mission. All fields will be provided.

Here are some notes:

.. note::
  All fields requiring a hex field will be filled in with "0x41200000", which is the hex for the float 10. See `here <implementation.html#hex-string>`_ for more information on hex strings.

.. note::
  All ``id`` fields will be filled in with an incrementing number. Every platform can implement this field differently; the only requirement is that the ``id`` field increases in value for every unique message sent. See `here <implementation.html#message-management>`_ for more information on how to generate these.

.. note::
  The ``time`` field will be set to zero for the examples. Please `see this information <implementation.html#setting-time>`_ to learn how to set the time field. It is very easy to set up for the vehicle.

.. toctree::
  :caption: Mission Examples
  :maxdepth: 1

  examples/isr-search
