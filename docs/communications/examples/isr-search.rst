==========
ISR Search
==========

.. note:: If you have not read the information provided for all of these examples, `please do so <../examples.html>`__ before proceeding on reading this example.

.. list-table::
  :header-rows: 1
  :widths: 50 50

  * - Messages from GCS
    - Messages from Vehicle

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "connect",
          "id": 0,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "jobsAvailable": [
            "isrSearch",
            "payloadDrop"
          ]
        }

      | UAV requests to connect to GCS.

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "connectionAck",
          "id": 0,
          "sid": 0,
          "tid": 100,
          "time": 0,
        }

      | UAV will send all future messages in GCS's
      | time by `getting the offset <../implementation.html#setting-time>`__ between
      | its own time and the provided time.
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "ack",
          "id": 1,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "ackid": 0
        }

      | UAV acknowledges GCS's connectionAck
      | message.

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "update",
          "id": 2,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "lat": "0x00000000",
          "lng": "0x00000000",
          "alt": "0x00000000",
          "heading": "0x00000000",
          "battery": "0x00000000",
          "status": "ready"
        }

      | UAV updates GCS. Its status is "ready".

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 1,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 2
        }

      | Loop from update message and ack
      | message happens until GCS assigns the
      | UAV a mission.
    -

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "start",
          "id": 2,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "jobType": "isrSearch"
        }

      | GCS assigns UAV the ``isrSearch`` job
      | for the ISRSearch mission.
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "ack",
          "id": 3,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "ackid": 2
        }

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "update",
          "id": 4,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "lat": "0x00000000",
          "lng": "0x00000000",
          "alt": "0x00000000",
          "heading": "0x00000000",
          "battery": "0x00000000",
          "status": "waiting"
        }

      | UAV updates GCS. Its status is "waiting".

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 3,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 4
        }

      | Loop from update message and ack
      | message happens until GCS assigns the
      | UAV a task. Depending on how fast
      | the GCS assigns a task, a message
      | in this loop might not even be sent.
    -

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "addMission",
          "id": 4,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "missionInfo":
          {
            "taskType": "takeoff",
            "lat": "0x00000000",
            "lng": "0x00000000",
            "alt": "0x00000000",
            "loiter":
            {
              "lat": "0x00000000",
              "lng": "0x00000000",
              "alt": "0x00000000",
              "radius": "0x00000000",
              "direction": "0x00000000"
            }
          }
        }

      | GCS assigns UAV the ``takeoff`` task.
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "ack",
          "id": 5,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "ackid": 4
        }

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "update",
          "id": 6,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "lat": "0x00000000",
          "lng": "0x00000000",
          "alt": "0x00000000",
          "heading": "0x00000000",
          "battery": "0x00000000",
          "status": "running"
        }

      | UAV updates GCS. Its status is "running".

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 5,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 6
        }

      | Loop from update message and ack
      | message happens until UAV finishes
      | the task.
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "complete",
          "id": 7,
          "sid": 100,
          "tid": 0,
          "time": 0
        }

      | UAV completes ``takeoff`` task.

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 6,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 7
        }
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "update",
          "id": 8,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "lat": "0x00000000",
          "lng": "0x00000000",
          "alt": "0x00000000",
          "heading": "0x00000000",
          "battery": "0x00000000",
          "status": "waiting"
        }

      | UAV updates GCS. Its status is "waiting".

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 7,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 8
        }

      | Loop from update message and ack
      | message happens until GCS assigns the
      | UAV a task. Depending on how fast
      | the GCS assigns the next task, a message
      | in this loop might not even be sent.
    -

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "addMission",
          "id": 8,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "missionInfo":
          {
            "taskType": "isrSearch",
            "alt": "0x00000000",
            "waypoints":
            [
              {
                "lat": "0x00000000",
                "lng": "0x00000000"
              },
              {
                "lat": "0x00000000",
                "lng": "0x00000000"
              },
              {
                "lat": "0x00000000",
                "lng": "0x00000000"
              }
            ]
          }
        }

      | GCS assigns UAV the ``isrSearch`` task.
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "ack",
          "id": 9,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "ackid": 8
        }

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "update",
          "id": 10,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "lat": "0x00000000",
          "lng": "0x00000000",
          "alt": "0x00000000",
          "heading": "0x00000000",
          "battery": "0x00000000",
          "status": "running"
        }

      | UAV updates GCS. Its status is "running".

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 9,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 10
        }

      | Loop from update message and ack
      | message happens until UAV finishes
      | the task.
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "poi",
          "id": 11,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "lat": "0x00000000",
          "lng": "0x00000000"
        }

      | UAV sends a point of interest
      | while performing ISR Search.
      | GCS will use this point
      | to generate tasks for the
      | VTOL Search mission.

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 10,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 11
        }
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "complete",
          "id": 12,
          "sid": 100,
          "tid": 0,
          "time": 0
        }

      | UAV completes ``isrSearch`` task.

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 11,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 12
        }
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "update",
          "id": 13,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "lat": "0x00000000",
          "lng": "0x00000000",
          "alt": "0x00000000",
          "heading": "0x00000000",
          "battery": "0x00000000",
          "status": "waiting"
        }

      | UAV updates GCS. Its status is "waiting".

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 12,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 13
        }

      | Loop from update message and ack
      | message happens until GCS assigns the
      | UAV a task. Depending on how fast
      | the GCS assigns the next task, a message
      | in this loop might not even be sent.
    -

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "addMission",
          "id": 13,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "missionInfo":
          {
            "taskType": "land",
            "waypoints":
            [
              {
                "lat": "0x00000000",
                "lng": "0x00000000",
                "alt": "0x00000000"
              },
              {
                "lat": "0x00000000",
                "lng": "0x00000000",
                "alt": "0x00000000"
              }
            ]
          }
        }

      | GCS assigns UAV the ``land`` task.
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "ack",
          "id": 14,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "ackid": 13
        }

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "update",
          "id": 15,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "lat": "0x00000000",
          "lng": "0x00000000",
          "alt": "0x00000000",
          "heading": "0x00000000",
          "battery": "0x00000000",
          "status": "running"
        }

      | UAV updates GCS. Its status is "running".

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 14,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 15
        }

      | Loop from update message and ack
      | message happens until UAV finishes
      | the task.
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "complete",
          "id": 16,
          "sid": 100,
          "tid": 0,
          "time": 0
        }

      | UAV completes ``land`` task.

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 15,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 16
        }
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "update",
          "id": 17,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "lat": "0x00000000",
          "lng": "0x00000000",
          "alt": "0x00000000",
          "heading": "0x00000000",
          "battery": "0x00000000",
          "status": "waiting"
        }

      | UAV updates GCS. Its status is "waiting".

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 16,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 17
        }

      | Loop from update message and ack
      | message happens until GCS assigns the
      | UAV a task. Depending on how fast
      | the GCS assigns the next task, a message
      | in this loop might not even be sent.
    -

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "stop",
          "id": 17,
          "sid": 0,
          "tid": 100,
          "time": 0,
        }

      | GCS sends a stop message instead of
      | assigning task since mission is
      | complete.
    -

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "ack",
          "id": 18,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "ackid": 17
        }

      .. FROM VEHICLE ------------------------------------------------------------------------------------------
  * -
    -
      .. code-block:: json

        {
          "type": "update",
          "id": 19,
          "sid": 100,
          "tid": 0,
          "time": 0,
          "lat": "0x00000000",
          "lng": "0x00000000",
          "alt": "0x00000000",
          "heading": "0x00000000",
          "battery": "0x00000000",
          "status": "ready"
        }

      | UAV updates GCS. Its status is "running".

      .. FROM GCS ----------------------------------------------------------------------------------------------
  * -
      .. code-block:: json

        {
          "type": "ack",
          "id": 18,
          "sid": 0,
          "tid": 100,
          "time": 0,
          "ackid": 19
        }

      | Loop from update message and ack
      | message happens until UAV is turned
      | off manually (or it can stay on
      | and this loop will run indefinitely).
    -
