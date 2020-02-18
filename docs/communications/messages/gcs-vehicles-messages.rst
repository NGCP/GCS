=============================
Messages from GCS to Vehicles
=============================

These are the specific messages that are sent from GCS to vehicles. All rules to normal messages apply to these (also requires ``type``, ``id``, ``sid``, ``tid``, ``time`` fields). See `here <../introduction.html#requirements>`__ for more information of the general message requirements.

----------------------------------------------------------------------------------------------------

Connection acknowledgement message
==================================

Sent back to the vehicle that GCS has accepted its request to connect. GCS forwards its time in the ``time`` field for the vehicle to create an offset to and send all future messages to in GCS's time.

See the connect message that initiates this acknowledgement request `here <vehicles-gcs-messages.html#connect-message>`__. Also see the implementation for the ``time`` field for messages, which directly relates to this message `here <../implementation.html#setting-time>`__.

.. code-block:: js

  {
    "type": "connectionAck",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>
  }

.. note:: Should **not** be acknowledged.

----------------------------------------------------------------------------------------------------

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
    "jobType": <string>,
  }

.. note:: Requires an `acknowledgement message`_ from the vehicle.

.. confval:: jobType

  :type: string

  The job being assigned to the vehicle to in order to complete the vehicle. This vehicle is capable of doing the job.

----------------------------------------------------------------------------------------------------

Add mission message
===================

Sent to the vehicle to assign a task to perform. The task should be something under the vehicle's job.

.. code-block:: js

  {
    "type": "addMission",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "missionInfo":
    {
      "taskType": <string>,
      ...
    }
  }

.. note:: Requires an `acknowledgement message`_ from the vehicle.

.. confval:: missionInfo

  :type: object

  The task being assigned to the vehicle. This includes the task type as well as information related to that task. See the `list of jobs and tasks`_ to see the list of valid tasks and their provided information.

----------------------------------------------------------------------------------------------------

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

.. note:: Requires an `acknowledgement message`_ from the vehicle.

----------------------------------------------------------------------------------------------------

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

.. note:: Requires an `acknowledgement message`_ from the vehicle.

----------------------------------------------------------------------------------------------------

Stop message
============

Sent to the vehicle to stop its mission. This is either sent when the vehicle is in the middle of the mission or when the vehicle has performed all tasks for the mission.

Vehicle should have a procedure to get to a stable state when this message is sent (e.g. a flying plane should either loiter or land to the ground). Vehicles should continue to send `update messages`_ to the GCS.

.. code-block:: js

  {
    "type": "resume",
    "id": <unsigned 32-bit integer>,
    "sid": <unsigned 32-bit integer>,
    "tid": <unsigned 32-bit integer>,
    "time": <unsigned 64-bit integer>,
  }

.. note:: Requires an `acknowledgement message`_ from the vehicle.

.. _acknowledgement message: other-messages.html#acknowledgement-message
.. _list of jobs and tasks: jobs.html
.. _update messages: vehicles-gcs-messages.html#update-message
