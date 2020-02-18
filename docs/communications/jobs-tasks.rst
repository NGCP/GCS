==============
Jobs and Tasks
==============

A vehicle's *job* (or profession) describes the type of *tasks* it can perform.

For example, an important part of the project is the ISR Search mission. To perform this mission, the GCS look for vehicles that have an ``isrSearch`` job. By having the ``isrSearch`` job, the vehicle is stating that it is capable of performing all of the following tasks that are related to the job:

- ``takeoff`` task
- ``loiter`` task
- ``isrSearch`` task
- ``land`` task

The GCS will assign the vehicles the ``isrSearch`` job by sending them a `start message`_. By doing this, the vehicles know that they will be performing tasks very soon. The start message has a ``jobType`` field, which will be set to ``isrSearch``, so that the vehicles know which tasks to expect next from the GCS.

To accomplish the ISR Search mission, GCS will assign a task for the vehicle to perform (for example, ``takeoff`` task), and assigns the next after the vehicle completes the first. This goes on until the ISR Search mission is completed.

----------------------------------------------------------------------------------------------------

List of jobs
============

.. note:: The vehicle must specify its jobs on the `connect message`_.

.. note:: The GCS must specify the job it is assigning the vehicle on the `start message`_. Examples of start messages are shown below for each job.

ISR Search (job)
----------------

**Related tasks:**  Takeoff_, Loiter_, `ISR Search (task)`_, Land_

.. code-block:: js

  // Connect message (id, tid, sid, time fields omitted)
  {
    "type": "connect",
    "jobsAvailable": ["isrSearch"]
  }

  // Start message (id, tid, sid, time fields omitted)
  {
    "type": "start",
    "jobType": "isrSearch"
  }

----------------------------------------------------------------------------------------------------

Payload Drop (job)
------------------

**Related tasks:** Takeoff_, Loiter_, `Payload Drop (task)`_, Land_

.. code-block:: js

  // Connect message (id, tid, sid, time fields omitted)
  {
    "type": "connect",
    "jobsAvailable": ["payloadDrop"]
  }

  // Start message (id, tid, sid, time fields omitted)
  {
    "type": "start",
    "jobType": "payloadDrop"
  }

----------------------------------------------------------------------------------------------------

UGV Rescue
----------

**Related tasks:** `UGV Retrieve Target`_, `Deliver Target`_

.. code-block:: js

  // Connect message (id, tid, sid, time fields omitted)
  {
    "type": "connect",
    "jobsAvailable": ["ugvRescue"]
  }

  // Start message (id, tid, sid, time fields omitted)
  {
    "type": "start",
    "jobType": "ugvRescue"
  }

----------------------------------------------------------------------------------------------------

UUV Rescue
----------

**Related tasks:** `UUV Retrieve Target`_

.. code-block:: js

  // Connect message (id, tid, sid, time fields omitted)
  {
    "type": "connect",
    "jobsAvailable": ["uuvRescue"]
  }

  // Start message (id, tid, sid, time fields omitted)
  {
    "type": "start",
    "jobType": "uuvRescue"
  }

----------------------------------------------------------------------------------------------------

Quick Scan (job)
----------------

**Related tasks:** `Quick Scan (task)`_

.. code-block:: js

  // Connect message (id, tid, sid, time fields omitted)
  {
    "type": "connect",
    "jobsAvailable": ["quickScan"]
  }

  // Start message (id, tid, sid, time fields omitted)
  {
    "type": "start",
    "jobType": "quickScan"
  }

----------------------------------------------------------------------------------------------------

Detailed Search (job)
---------------------

**Related tasks:** `Detailed Search (task)`_

.. code-block:: js

  // Connect message (id, tid, sid, time fields omitted)
  {
    "type": "connect",
    "jobsAvailable": ["detailedSearch"]
  }

  // Start message (id, tid, sid, time fields omitted)
  {
    "type": "start",
    "jobType": "detailedSearch"
  }

----------------------------------------------------------------------------------------------------

List of tasks
=============

.. note:: The GCS must specify the type of task the vehicle is performing, as well as provide valid fields for the task on the `add mission message`_.

Takeoff
-------

**Related jobs**: `ISR Search (job)`_, `Payload Drop (job)`_

.. code-block:: js

  // Add mission message (id, tid, sid, time fields omitted)
  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "takeoff",
      "lat": <float>,           // Takeoff waypoint latitude
      "lng": <float>,           // Takeoff waypoint longitude
      "alt": <float>,           // Takeoff waypoint altitude
      "loiter":
      {
        "lat": <float>,         // Loiter waypoint latitude
        "lng": <float>,         // Loiter waypoint longitude
        "alt": <float>,         // Loiter waypoint altitude
        "radius": <float>,      // Radius around loiter waypoint to fly around
        "direction": <float>    // Direction to loiter
      }
    }
  }

----------------------------------------------------------------------------------------------------

Loiter
------

**Related jobs**: `ISR Search (job)`_, `Payload Drop (job)`_

.. code-block:: js

  // Add mission message (id, tid, sid, time fields omitted)
  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "loiter",
      "lat": <float>,
      "lng": <float>,
      "alt": <float>,
      "radius": <float>,        // Radius around loiter waypoint to fly around
      "direction": <float>      // Direction to loiter
    }
  }

----------------------------------------------------------------------------------------------------

ISR Search (task)
-----------------

**Related jobs**: `ISR Search (job)`_

.. code-block:: js

  // Add mission message (id, tid, sid, time fields omitted)
  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "isrSearch",
      "alt": <float>,
      "waypoints":
      [
        {
          "lat": <float>,
          "lng": <float>
        },
        {
          "lat": <float>,
          "lng": <float>
        },
        {
          "lat": <float>,
          "lng": <float>
        }
      ]
    }
  }

----------------------------------------------------------------------------------------------------

Payload Drop (task)
-------------------

**Related jobs**: `Payload Drop (job)`_

.. code-block:: js

  // Add mission message (id, tid, sid, time fields omitted)
  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "payloadDrop",
      "waypoints":
      [
        {
          "lat": <float>,
          "lng": <float>,
          "alt": <float>
        },
        {
          "lat": <float>,
          "lng": <float>,
          "alt": <float>
        }
      ]
    }
  }

----------------------------------------------------------------------------------------------------

Land
----

**Related jobs**: `ISR Search (job)`_, `Payload Drop (job)`_

.. code-block:: js

  // Add mission message (id, tid, sid, time fields omitted)
  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "land",
      "waypoints":
      [
        {
          "lat": <float>,
          "lng": <float>,
          "alt": <float>
        },
        {
          "lat": <float>,
          "lng": <float>,
          "alt": <float>
        }
      ]
    }
  }

----------------------------------------------------------------------------------------------------

UGV Retrieve Target
-------------------

**Related jobs**: `UGV Rescue`_

.. code-block:: js

  // Add mission message (id, tid, sid, time fields omitted)
  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "retrieveTarget",

      "lat": <float>,
      "lng": <float>
    }
  }

----------------------------------------------------------------------------------------------------

Deliver Target
--------------

**Related jobs**: `UGV Rescue`_

.. code-block:: js

  // Add mission message (id, tid, sid, time fields omitted)
  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "deliverTarget",

      "lat": <float>,
      "lng": <float>
    }
  }

----------------------------------------------------------------------------------------------------

UUV Retrieve Target
-------------------

**Related jobs**: `UUV Rescue`_

.. code-block:: js

  // Add mission message (id, tid, sid, time fields omitted)
  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "retrieveTarget"
    }
  }

----------------------------------------------------------------------------------------------------

Quick Scan (task)
-----------------

**Related jobs**: `Quick Scan (job)`_

.. code-block:: js

  // Add mission message (id, tid, sid, time fields omitted)
  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "quickScan",
      "waypoints":
      [
        {
          "lat": <float>,       // Top left latitude of search area
          "lng": <float>        // Top left longitude of search area
        },
        {
          "lat": <float>,       // Top right latitude of search area
          "lng": <float>        // Top right longitude of search area
        },
        {
          "lat": <float>,       // Bottom left latitude of search area
          "lng": <float>        // Bottom left longitude of search area
        },
        {
          "lat": <float>,       // Bottom right latitude of search area
          "lng": <float>        // Bottom right longitude of search area
        }
      ]
    }
  }

----------------------------------------------------------------------------------------------------

Detailed Search (task)
----------------------

**Related jobs**: `Detailed Search (job)`_

.. code-block:: js

  // Add mission message (id, tid, sid, time fields omitted)
  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "detailedSearch",
      "lat": <float>,                 // Latitude of point of interest
      "lng": <float>                  // Longitude of point of interest
    }
  }

.. _add mission message: messages/gcs-vehicles-messages.html#add-mission-message
.. _connect message: messages/vehicles-gcs-messages.html#connect-message
.. _start message: messages/gcs-vehicles-messages.html#start-message

.. _ISR Search (job): #isr-search-job
.. _Payload Drop (job): #payload-drop-job
.. _UGV Rescue: #ugv-rescue
.. _UUV Rescue: #uuv-rescue
.. _Quick Scan (job): #quick-scan-job
.. _Detailed Search (job): #detailed-search-job

.. _Takeoff: #takeoff
.. _Loiter: #loiter
.. _ISR Search (task): #isr-search-task
.. _Payload Drop (task): #payload-drop-task
.. _Land: #land
.. _UGV Retrieve Target: #ugv-retrieve-target
.. _Deliver Target: #deliver-target
.. _UUV Retrieve Target: #uuv-retrieve-target
.. _Quick Scan (task): #quick-scan-task
.. _Detailed Search (task): #detailed-search-task
