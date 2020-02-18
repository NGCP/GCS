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
    "jobsAvailable": <string[]>
  }

**jobsAvailable : string[]**
  List of jobs that the vehicle is. These jobs describe the tasks the vehicle is capable of performing. See the `list of jobs and tasks`_ to see which jobs are valid.

.. note:: Requires a `connection acknowledgment message`_ from the GCS.

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
    "heading": <optional float>,
    "battery": <optional float>,
    "status": <string>,
    "errorMessage": <optional string>
  }

**lat : float**
  Latitude of vehicle.

**lng : float**
  Longitude of vehicle.

**alt : optional float**
  Altitude of vehicle.

**heading : optional float**
  Heading of vehicle, in radians.

**battery : optional float**
  Battery percentage of vehicle, expressed as a decimal. Range is 0 < x <= 1.

**status : string**
  Current status of vehicle. The following are the valid values:

  - *ready*: No job or mission was assigned to the vehicle.
  - *waiting*: Job was assigned, but vehicle is waiting to be assigned a task.
  - *running*: Job was assigned, and vehicle is currently performing a task.
  - *paused*: Job was assigned, and vehicle is paused from performing the task.
  - *error*: Vehicle is in an error state.

**errorMessage : optional string**
  Only filled in when vehicle is in error status. Explains why the vehicle is in that status.

.. note:: Requires an `acknowledgement message`_ from the GCS.

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

**lat : float**
  Latitude of point of interest.

**lng : float**
  Longitude of point of interest.

.. note:: Requires an `acknowledgement message`_ from the GCS.

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

.. note:: Requires an `acknowledgement message`_ from the GCS.

.. _acknowledgement message: other-messages.html#acknowledgement-message
.. _connection acknowledgment message: gcs-vehicles-messages.html#connection-acknowledgement-message
.. _list of jobs and tasks: jobs-tasks.html
