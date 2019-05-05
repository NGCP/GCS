========
Examples
========

The following are examples of how the flow of messages will be for each mission. All fields will be provided.

------------

.. toctree::
  :caption: Mission Examples
  :maxdepth: 1

  examples/isr-search

------------

.. note::
  All examples will be run independently. Pretend that each example is as if the mission was started first, and no vehicles were connected to the GCS.

  In real missions, the ``id`` from the GCS when the vehicle connects can be higher if the GCS has performed missions with previous vehicles.


.. note::
  All ``id`` fields will be filled in with an incrementing number. Every platform can implement this field differently; the only requirement is that the ``id`` field increases in value for every unique message sent. See `here <implementation.html#message-management>`_ for more information on how to generate these.

.. note::
  The ``time`` field will be set to zero for the examples. Please `see this information <implementation.html#setting-time>`_ to learn how to set the time field. It is very easy to set up for the vehicle.
