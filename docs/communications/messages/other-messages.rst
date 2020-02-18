==============
Other messages
==============

These types can be sent by any vehicle as well as the GCS.

----------------------------------------------------------------------------------------------------

Acknowledgement message
=======================

Sent back to the other vehicle to show that this vehicle has received this message. Maintains connection to both vehicles.

It is important to know that when this vehicle acknowledges a message, it does not mean that the other vehicle has received it. When implementing the acknowledgement system, it is important to always acknowledge the message.

A way to think about this is to remember that it is recommended to increment the message ``id`` field. Every vehicle can keep track of the ``id`` of the latest message it has received from the other vehicle, and continue to acknowledge to messages with an ``id`` equal to that value or higher, but ignore messages with a lower ``id``.

.. note:: If a vehicle A has last received a message of ``id = 12`` from vehicle B, vehicle A will acknowledge any more messages of ``id = 12``. Once vehicle B sends a message of ``id = 13``, vehicle A will not acknowledge any more messages of ``id = 12``, only 13.

.. code-block:: js

  {
    "type": "ack",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,
    "ackid": <unsigned 32-bit integer>
  }

.. note:: Should **not** be acknowledged.

.. confval:: ackid

  :type: unsigned 32-bit integer

  The ID of the message the vehicle is acknowledging. When the other vehicle receives the acknowledgement, it knows which message to stop sending to this vehicle.

----------------------------------------------------------------------------------------------------

Bad message
===========

Sent back to the other vehicle to show that a received message is invalid. This either means that the message was not a JSON in the first place, message had incorrect format (usually a missing field), or some unexpected communication error happened.

.. code-block:: js

  {
    "type": "badMessage",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,
    "error": <string>
  }

.. note:: Should **not** be acknowledged.

.. confval:: error : Optional

  :type: string

  Highly recommended to include into the message, so that the sending vehicle can log the error.
