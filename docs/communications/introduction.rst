============
Introduction
============

GCS is able to communicate with other vehicles using JSON messages. All messages that comes to GCS and vehicles, as well from vehicles to other vehicles, are all in JSON format.

----------------------------------------------------------------------------------------------------

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

----------------------------------------------------------------------------------------------------

Features
========

The strength of this protocol is its design and simplicity.

Acknowledging
-------------

The protocol ensures that all messages are acknowledged (except `acknowledgement messages`_ and `bad messages`_). To let this happen, the vehicle must acknowledge each message that it receives by sending an acknowledgement message back. With this, both vehicles receive a message and know that the other is connected.

If the vehicle does not acknowledge, or the other vehicle doesn't receive the acknowledgement message, the other vehicle that sent the message will not know whether or not the vehicle received the message. In this case, the other vehicle should continue to send the message to the vehicle and await the acknowledgement message. The protocol defines that the vehicle should only send messages once every **10 seconds** to not clog up the other vehicle's system. If connection continues to fail for **20 seconds**, then the vehicles will disconnect from each other.

For the vehicle that is receiving, it should acknowledge every message (except the messages listed above). There can be a possiblity that the other vehicle did not receive the acknowledgement (hence it will continue to send messages), so the vehicle should always acknowledge incoming messages, even if they are repeated messages.

Disconnection
-------------

Vehicles need to be in constant communication with the GCS. Failure to communicate within **twenty seconds** will cause the GCS to disconnect from the vehicle.

If a vehicle disconnects from the GCS, the vehicle must try to connect to the GCS. While this happens, the vehicle is expected to have a failsafe procedure to execute so that it will be in a stable state (e.g. a flying plane should either loiter or land to the ground).

Maintaining Connection
----------------------

Vehicles must maintain their communication with the GCS (as well as other vehicles) by sending `update messages`_ and letting them know of their status.

.. _acknowledgement messages: messages/other-messages.html#acknowledgement-message
.. _bad messages: messages/other-messages.html#bad-message
.. _update messages: messages/vehicles-gcs-messages.html#update-message
