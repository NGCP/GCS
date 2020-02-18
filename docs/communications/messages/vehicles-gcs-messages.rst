=============================
Messages from Vehicles to GCS
=============================

Connect message
===============

Sent to the GCS to request connection to it. The vehicle will not have information of what GCS's time is yet, so any number is sufficient. The GCS will disregard this time.

See the implementation for the ``time`` field for messages, which directly relates to this message `here <implementation.html#setting-time>`__.

.. code-block:: js

  {
    "type": "connect",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,

    "jobsAvailable":
    [
      <string>,
      ...
    ]
  }

.. note::
  Requires a `connection acknowledgment message`_ from the GCS.

.. confval:: jobsAvailable

  :type: string[]

  List of jobs that the vehicle is. These jobs describe the tasks the vehicle is capable of performing. See the `list of jobs and tasks`_ to see which jobs are valid.

----------------------------------------------------------------------------------------------------

Update message
==============

Sent to the GCS to let it know of the vehicle's status. This should always be sending to the GCS to maintain connection to it.

.. code-block:: js

  {
    "type": "update",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,
    "lat": <float>,
    "lng": <float>,
    "alt": <float>,
    "heading": <float>,
    "battery": <float>,
    "status": <string>,
    "errorMessage": <string>
  }

.. note::
  Requires an `acknowledgement message`_ from the GCS.

.. confval:: lat

  :type: float

  Latitude of vehicle.

.. confval:: lng

  :type: float

  Longitude of vehicle.

.. confval:: alt

  :type: float
  :optional: true

  Altitude of vehicle.

.. confval:: heading : Optional

  :type: float

  Heading of vehicle, in radians.

.. confval:: battery : Optional

  :type: float

  Battery percentage of vehicle, expressed as a decimal. Range is 0 < x <= 1.

.. confval:: status

  :type: string

  Current status of vehicle. This allows GCS to keep track of the vehicle and its state.

  The following are the valid values, the GCS:

  - **ready**: No job or mission was assigned to the vehicle.
  - **waiting**: Job was assigned, but vehicle is waiting to be assigned a task.
  - **running**: Job was assigned, and vehicle is currently performing a task.
  - **paused**: Job was assigned, and vehicle is paused from performing the task, waiting to resume task.
  - **error**: Vehicle is in an error state.

.. confval:: errorMessage : Optional

  :type: string

  Description of why the vehicle is in error state. Should only be sent when the vehicle is in error state.

----------------------------------------------------------------------------------------------------

Point of Interest message
===============================

Sent to the GCS to let it know of a point of interest found in a mission. Not all vehicles will need to use this.

.. code-block:: js

  {
    "type": "poi",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,
    "lat": <float>,
    "lng": <float>
  }

.. note::
  Requires an `acknowledgement message`_ from the GCS.

.. confval:: lat

  :type: float

  Latitude of point of interest.

.. confval:: lng

  :type: float

  Longitude of point of interest.

----------------------------------------------------------------------------------------------------

Complete message
================

Sent to the GCS to let it know that it has completed the assigned task.

.. code-block:: js

  {
    "type": "poi",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>
  }

.. note::
  Requires an `acknowledgement message`_ from the GCS.

.. _acknowledgement message: other-messages.html#acknowledgement-message
.. _connection acknowledgment message: gcs-vehicles-messages.html#connection-acknowledgement-message
.. _list of jobs and tasks: jobs.html
