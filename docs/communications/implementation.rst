==============
Implementation
==============

This page is to show how many things in this protocol can be implemented.

---------

Float hex
=========

Many fields in the messages sent through the JSON protocol require floats. However, the problem with floats is that they can take a maximum of 32 characters when sent through a JSON.

Messages are sent through an Xbee radio. These radios are only capable of sending messages of up to 256 characters long. To send longer messages, we will have to manually split the message up before sending, and put it back together, which is complicated.

To resolve this issue, we decided to send all floats as hexadecimal strings. For this documentation, we will refer these hexadecimal string representation of a float as a **float hex**.

We will be using the IEEE 754 standard. Use `this website <https://gregstoll.com/~gregstoll/floattohex/>`_ to see float to hex conversions.

Your vehicle should be able to convert a float to a hex, and vice versa.

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
