=============================
Messages from Vehicles to GCS
=============================

These are the specific messages that are sent from vehicles to GCS. All rules to normal messages apply to these (also requires ``type``, ``id``, ``sid``, ``tid``, ``time`` fields).

Connect message
===============

Sent to the GCS to request connection to it. The vehicle will not have information of what GCS's time is yet, so any number is sufficient. The GCS will disregard this time.

.. code-block:: js

  {
    "type": "connect",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,

    "jobsAvailable": <string>[]
  }

.. note:: Requires a **connection** acknowledgement message from the GCS.

.. TODO: Link to list of jobs

.. confval:: jobsAvailable

  :type: string[]

  List of jobs that the vehicle is. These jobs describe the tasks the vehicle is capable of performing. See the list of jobs and tasks to see which jobs are valid.

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

    "lat": <float hex>,
    "lng": <float hex>,
    "alt": <float hex>,                     // Optional
    "heading": <float hex>,                 // Optional
    "battery": <float hex>,                 // Optional, must be a value from 0 < x <= 1

    "status": <string>,                     // Vehicle status
    "errorMessage": <string>                // Optional, see notes below for more info
  }

.. note:: Requires an acknowledgement message from the GCS.

.. confval:: lat

  :type: float hex

  Latitude of vehicle.

.. confval:: lng

  :type: float hex

  Longitude of vehicle.

.. confval:: alt

  :type: float hex
  :optional: true

  Altitude of vehicle.

.. confval:: heading : Optional

  :type: float hex

  Heading of vehicle.

.. confval:: battery : Optional

  :type: float hex

  Battery percentage of vehicle, expressed as a decimal. Range is 0 < x <= 1.

.. confval:: status

  :type: string

  Current status of vehicle. This allows GCS to keep track of the vehicle and its state.

  The following are the valid values, the GCS:

  - **ready**: No job or mission was assigned to the vehicle.
  - **error**: Vehicle is in an error state.
  - **waiting**: Job was assigned, but vehicle is waiting to be assigned a task.
  - **running**: Job was assigned, and vehicle is currently performing a task.
  - **paused**: Job was assigned, and vehicle is paused from performing the task, waiting to resume task.

.. confval:: errorMessage : Optional

  :type: string

  Description of why the vehicle is in error state. Should only be sent when the vehicle is in error state.

Point of Interest (POI) message
===============================

Sent to the GCS to let it know of a point of interest found in a mission. Not all vehicles will need to use this.

.. code-block:: js

  {
    "type": "poi",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,

    "lat": <float hex>,                   // Latitude of point of interest
    "lng": <float hex>,                   // Longitude of point of interest
  }

.. note:: Requires an acknowledgement message from the GCS.

.. confval:: lat

  :type: float hex

  Latitude of point of interest.

.. confval:: lng

  :type: float hex

  Longitude of point of interest.

Complete message
================

Sent to the GCS to let it know that it has completed the assigned task.

.. code-block:: js

  {
    "type": "poi",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,
  }

.. note:: Requires an acknowledgement message from the GCS.
