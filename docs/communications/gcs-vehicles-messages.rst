=============================
Messages from GCS to Vehicles
=============================

These are the specific messages that are sent from GCS to vehicles. All rules to normal messages apply to these (also requires ``type``, ``id``, ``sid``, ``tid``, ``time`` fields).

----------------------------------

Connection acknowledgement message
==================================

Sent back to the vehicle that GCS has accepted its request to connect. GCS forwards its time in the ``time`` field for the vehicle to create an offset to and send all future messages to in GCS's time.

.. code-block:: js

  {
    "type": "connectionAck",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>
  }

.. note:: Requires an acknowledgement message from the vehicle.

-------------

Start message
=============

Sent to the vehicle to assign a job to complete a mission.

.. code-block:: js

  {
    "type": "start",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,

    "jobType": <string>,                  // Job to perform
    "options": {                          // Additional information vehicle needs
      ...
    }
  }

.. note:: Requires an acknowledgement message from the vehicle.

.. confval:: jobType

  :type: string

  The job being assigned to the vehicle to in order to complete the vehicle. This vehicle is capable of doing the job.

.. confval:: options : Optional

  :type: object

  Object of key/value pairs that the vehicle's job needs. Currently none of our platforms need this.

-------------------

Add mission message
===================

Sent to the vehicle to assign a task to perform. The task should be something under the vehicle's job.

.. code-block:: js

  {
    "type": "addMission",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,

    "missionInfo": {                          // Information related to specific job
      "taskType": <string>,
      ...
    }
  }

.. note:: Requires an acknowledgement message from the vehicle.

.. TODO: add link to job and task types

.. confval:: missionInfo

  :type: object

  The task being assigned to the vehicle. This includes the task type as well as information related to that task. See the list of jobs and tasks to see the list of valid tasks and their provided information.

-------------

Pause message
=============

Sent to the vehicle to pause it from its current task.

.. code-block:: js

  {
    "type": "pause",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,
  }

.. note:: Requires an acknowledgement message from the vehicle.

--------------

Resume message
==============

Sent to the vehicle to resume it back to its current task.

.. code-block:: js

  {
    "type": "resume",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,
  }

.. note:: Requires an acknowledgement message from the vehicle.

------------

Stop message
============

Sent to the vehicle to stop its mission. This is either sent when the vehicle is in the middle of the mission or when the vehicle has performed all tasks for the mission.

.. TODO: add link to update messages

Vehicle should have a procedure to get to a stable state when this message is sent (e.g. a flying plane should either loiter or land to the ground). Vehicles should continue to send update messages to the GCS.

.. code-block:: js

  {
    "type": "resume",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,
  }

.. note:: Requires an acknowledgement message from the vehicle.
