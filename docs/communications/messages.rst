========
Messages
========

Base message requirements
=========================

**All messages** sent should be in valid JSON and should include all of the following fields:

.. code-block:: js

  {
    "type": <string>,                  // Identifies the type of message being sent
    "id": <unsigned 32-bit integer>    // Uniquely identifies the message from all other messages received from a vehicle
    "sid": <unsigned 32-bit integer>   // Identifies the vehicle the message comes from (source vehicle)
    "tid": <unsigned 32-bit integer>   // Identifies the vehicle the message is going to (target vehicle)
    "time": <unsigned 64-bit integer>  // The number of seconds since January 1, 1970 0:00:00 UTC
  }

Implementing these fields
-------------------------

.. warning:: This section will be deleted once implementation of JSON communication is finished.

**type : string**
  This field is predefined depending on the type of message.

**id : unsigned 32-bit integer**
  See `this <implementation.html#creating-messages-with-proper-id-field>`__ for information.

**sid/tid : unsigned 32-bit integer**
  These fields are predefined for every platform. See the `list of vehicle IDs`_ for the values used for these fields.

**time : unsigned 64-bit integer**
  See `this <implementation.html#setting-time>`__ for more information on implementing this field.

----------------------------------------------------------------------------------------------------

Types of messages
=================

.. toctree::
  :maxdepth: 2

  messages/vehicles-gcs-messages
  messages/gcs-vehicles-messages
  messages/other-messages

.. _list of vehicle IDs: vehicles.html
