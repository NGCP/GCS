==============
Communications
==============

GCS is able to communicate with other vehicles using a JSON_ messaging protocol. All messages that comes to GCS and vehicles, as well from vehicles to other vehicles, are all in JSON format.

An example of JSON can be the following:

.. code-block:: json

  {
    "key": "value",
    "someNumber": 4,
    "aBoolean": false
  }

The JSON messaging protocol defines many different types of messages that can be sent and received. Each message will have required fields, which is a key/pair value in the JSON. The guide will go more in depth of what fields are required for which messages below.

.. contents:: Contents
  :local:

Requirements
------------

All messages sent should be in valid JSON_.

All messages should have the following fields:

**type**: String

  This field identifies the type of message being sent. Please see the list of messages to see all what values of `type` are valid.

**id**: unsigned 32-bit integer

  This field identifies a message coming from a vehicle from all the other messages that are coming from that vehicle. This field must always be different for each message a vehicle sends.

**sid**: unsigned 32-bit integer

  This field identifies the vehicle the message is coming from. The field's value is the id of the vehicle that is *sending* that message. Please see the table of vehicle ids for specific information for this field.

**tid**: unsigned 32-bit integer

  This field identifies the vehicle the message is coming to. The field's value is the id of the vehicle that is *receiving* the message. Similar to `sid`, please see the table above for information for this field.

**time**: unsigned 64-bit integer

  This field is the number of **milli** seconds since January 1, 1970 0:00:000 UTC (`Unix Time`_). Many languages have support to obtain this value.

  There is a small twist to this field though. All vehicles must send the time in GCS's time. Otherwise it is possible that each vehicle can be running off a slightly different clock. Vehicles can obtain GCS's time by seeing the difference between their time and GCS's time (when they connect to GCS) and using that to offset their own time.

.. _JSON: https://www.json.org/
.. _Unix Time: https://currentmillis.com/
