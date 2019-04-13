============
Introduction
============

GCS is able to communicate with other vehicles using a `JSON <https://www.json.org/>`_ messaging protocol. All messages that comes to GCS and vehicles, as well from vehicles to other vehicles, are all in JSON format.

-------------

What is JSON?
=============

JSON can be thought of as a structure. Consider the following C++ structure.

.. code-block:: cpp

  struct Person {
    string name;
    int age;
    bool married;
  }

Imagine that a Person object has the name Bob, age 20, and not married. The respective JSON is the following:

.. code-block:: json

  {
    "name": "Bob",
    "age": 20,
    "married": false
  }

JSON is simply a string. The following is how JSON actually looks like, when it has no whitespaces:

.. code-block:: json

  {"name":"Bob","age":20,"married":false}

Many languages have libraries that support conversion of JSON to a class/structure that can be used by the respective program and vice versa.

With that, the JSON messaging protocol defines many different types of messages that can be sent and received. Each message will have required **fields**, which is a **key/pair value** in the JSON. The guide will go more in depth of what fields are required for which messages below.

--------

Features
========

The strength of this protocol is its design and simplicity.

Acknowledging
-------------

The protocol ensures that all messages are acknowledged (except `acknowledgement messages <messages/other-messages.html#acknowledgement-message>`_ and `bad messages <messages/other-messages.html#bad-message>`_). To let this happen, the vehicle must acknowledge each message that it receives by sending an acknowledgement message back. With this, both vehicles receive a message and know that the other is connected.

If the vehicle does not acknowledge, or the other vehicle doesn't receive the acknowledgement message, the other vehicle that sent the message will not know whether or not the vehicle received the message. In this case, the other vehicle should continue to send the message to the vehicle and await the acknowledgement message. The protocol defines that the vehicle should only send messages once every **10 seconds** to not clog up the other vehicle's system. If connection continues to fail for **20 seconds**, then the vehicles will disconnect from each other.

For the vehicle that is receiving, it should acknowledge every message (except the messages listed above). There can be a possiblity that the other vehicle did not receive the acknowledgement (hence it will continue to send messages), so the vehicle should always acknowledge incoming messages, even if they are repeated messages.

Understand that this does not only apply for vehicles to vehicles, but also vehicles to GCS.

Disconnection
-------------

Vehicles need to be in constant communication with the GCS. Failure to communicate within **twenty seconds** will cause the GCS to disconnect from the vehicle.

If a vehicle disconnects from the GCS, the vehicle must try to connect to the GCS. While this happens, the vehicle is expected to have a failsafe procedure to execute so that it will be in a stable state (e.g. a flying plane should either loiter or land to the ground).

Maintaining Connection
----------------------

Vehicles must maintain their communication with the GCS (as well as other vehicles) by sending `update messages <messages/vehicles-gcs-messages.html#update-message>`_ and letting them know of their status.

------------

Requirements
============

All messages sent should be in valid JSON and should include all of the following fields:

.. note:: JSON does not support comments. These code blocks are written with JavaScript coloring to make reading easier. Understand that the label ``<string>`` stands for an actual string (e.g. "Hello world!").

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

.. confval:: type

  :type: string

  This is predefined for every message that is defined in the JSON protocol. This field defines what kind of message is being sent or received. For example, a start message's ``type`` field would be "start".

.. confval:: id

  :type: unsigned 32-bit integer

  This should be changed every time a different message is sent. A way to implement this is to start sending messages with ``id`` equal to 0, and incrementing it by 1 for every different message sent.

  Here's the catch: the same message (with the same ``id`` and fields) should be sent until it is acknowledged. This message's ``id`` field should not be changing every time it is sent.

  See `this <implementation.html#creating-messages-with-proper-id-field>`_ for more information on how to implement this field.

.. confval:: sid/tid

  :type: unsigned 32-bit integer

  These fields are predefined for every platform. See the `list of vehicle IDs <vehicles.html>`_ for the values used for these fields.

.. confval:: time

  :type: unsigned 64-bit integer

  Used for security. This field allows vehicles to discard old messages. For this to work, all vehicles must run on the same time, in the case of this protocol, in GCS's time.

  For all vehicles to properly set the ``time`` field to GCS's time, they must first connect to GCS. GCS will give the vehicle its local time, and the vehicle will create an offset between its own time and GCS's time. The ``time`` field will be the vehicle's time plus the offset, which is the same as GCS's time. In reality, the offset should be very small, if GCS and the vehicle get their time from the same source.

  See `this <implementation.html#setting-time>`_ for more information on implementing this field.
