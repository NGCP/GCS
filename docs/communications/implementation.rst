==============
Implementation
==============

This page is to show how many things in this protocol can be implemented.

------------

Setting time
============

All vehicles are required to include a ``time`` field on every message that they send. This time field should be configured to use GCS's time.

To set this up, the vehicle must connect to the GCS. The time field in the `connect message <messages/vehicles-gcs-messages.html#connect-message>`_ that the vehicle sends the GCS will not matter, but it is still required to be included. The GCS will send back a `connection acknowledgment message <messages/gcs-vehicles-messages.html#connection-acknowledgement-message>`_, which includes the proper GCS time. The vehicle should calculate the offset between its own local time and GCS's time (through a simple subtraction of ``offset = gcsTime - myTime``).

When sending messages after this, the vehicle should use the offset as well as its own local time to fill the ``time`` field in every message to GCS's time (``gcsTime = myTime + offset``).

Use the `current millis <https://currentmillis.com/>`_ website to find the function in your vehicle program's language to get vehicle's local time.

------------------

Message management
==================

The vehicle should be able to keep track of all the messages it is sending, as it should keep sending the messages until it receives an acknowledgement back.

Usually, the vehicle will only send only one message at a time, but it is possible that the vehicle might need to communicate with more than one platform.

Here is the way the vehicle can manage which messages to send and which ones to stop sending:

.. note:: Code will be in JavaScript, but should be simple to convert to your vehicle program's language.

Creating messages with proper ID field
--------------------------------------

Have a dictionary for all messages that have not been sent yet. Usually this dictionary will only have one message, since the vehicle will only communicate with one vehicle at a time.

.. code-block:: js

  const dict = {};
  const messageID = 0;

Whenever the vehicle makes a new message to send to another vehicle, the message ``id`` should be put into the message, and incremented right after. Store the message into the dictionary by its id.

.. code-block:: js

  function createMessage(information) {
    const message = information;
    message.id = messageID; // Sets the "id" field of message to messageID.

    dict[messageID] = message; // Maps the message to the dictionary.
    messageID += 1; // Increment the messageID right after.
  }

The message should then be sent repeatedly until it is acknowledged. There's a few options to implement the sending function:

First option to send messages
-----------------------------

Iterate through the dictionary and send all the messages inside of it.

.. code-block:: js

  // This will execute the code inside setInterval every 100ms. You can make your own set rate. The GCS's send rate will be 100ms though.
  setInterval(() => {
    for (const key in dict) {
      xbee.sendMessage(dict[key]); // Assume this is the function that sends the message through the xbee.
    }
  }, 100);

When the vehicle receives an acknowledgement, the acknowledgement will have a field ``ackid`` that specifies the message ``id`` that it is acknowledging.

Simply delete the message with the corresponding ``id`` from the dictionary.

.. code-block:: js

  function receiveMessage(message) {
    if (message.type === 'ack') {
      if (message.type.ackid in dict) { // This line is important! We do not want to delete a message if it is not there in the first place.
        delete dict[message.type.ackid];
      }
    }
    // More code to handle other types of messages you might receive.
  }

Second option to send messages
------------------------------

Send the message repeatedly and set a listener that will listen for the event that the message is acknowledged.

This is faster than the first option as there is no loop being iterated, and events are triggered at the same time.

.. code-block:: js

  const listener = new EventEmitter();
  listener.setMaxListeners(0); // This tells JavaScript that this listener will listen for infinite events.

With this option, a dictionary is not needed, as messages that are acknowledged are automatically removed by the listener. However, it is recommended to have one if an error occurs (and be able to see what messages were sent).

.. code-block:: js

  function createAndSendMessage(information) {
    const message = information;
    message.id = messageID;

    const interval = setInterval(() => {
      xbee.sendMessage(message);
    }, 100);

    listener.on('acknowledge', (ackid) => {
      if (messageID === ackid) {
        clearInterval(interval); // This stops the interval of sending the message.
      }
    });

    messageID += 1;
  }

  function receiveMessage(message) {
    if (message.type === 'ack') {
      listener.emit('acknowledge', message.ackid);
    }
  }
