=========
Float Hex
=========

Many fields in the messages sent through the JSON protocol require floats. However, the problem with floats is that they can take a maximum of 32 characters when sent through a JSON.

Messages are sent through an Xbee radio. These radios are only capable of sending messages of up to 256 characters long. To send longer messages, we will have to manually split the message up before sending, and put it back together, which is complicated.

To resolve this issue, we decided to send all floats as hexadecimal strings. For this documentation, we will refer these hexadecimal string representation of a float as a **float hex**.

We will be using the IEEE 754 standard. Use `this website <https://gregstoll.com/~gregstoll/floattohex/>`_ to see float to hex conversions.
