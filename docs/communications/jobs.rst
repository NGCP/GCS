============
Type of Jobs
============

A job describes the tasks a vehicle is capable of performing.

For example, an important part of the project is the ISR Search mission. To perform this mission, the GCS look for vehicles that have an ``isrSearch`` job. By having the ``isrSearch`` job, the vehicle is stating that it is capable of performing all of the following tasks that are related to the job:

- ``takeoff`` task
- ``loiter`` task
- ``isrSearch`` task
- ``land`` task

.. note:: More information of which tasks are related to which job are explained further below.

.. TODO: add link to message

The GCS will assign the vehicles the ``isrSearch`` job by sending them a start message. By doing this, the vehicles know that they will be performing tasks very soon. The start message has a ``jobType`` field, which will be set to ``isrSearch``, so that the vehicles know which tasks to expect next from the GCS.

To accomplish the ISR Search mission, GCS will assign a task for the vehicle to perform (usually ``takeoff`` task), and assigns the next after the vehicle completes the first. This goes on until the ISR Search mission is completed.

------------

List of jobs
============

.. TODO: add link to message

.. note:: The vehicle must specify its jobs on the connect message, and the GCS must specify the job it is assigning to the vehicle on the start message.

ISR Search
----------

.. confval:: Details

  :jobType: ``isrSearch``
  :tasks: Takeoff, Loiter, ISR Search, Land
  :start message:
    .. code-block:: json

      {
        "type": "start",
        "jobType": "isrSearch"
      }

------------

Payload Drop
----------

.. confval:: Details

  :job type: ``payloadDrop``
  :tasks: Takeoff, Loiter, Payload Drop, Land
  :start message:
    .. code-block:: json

      {
        "type": "start",
        "jobType": "payloadDrop"
      }

------------

UGV Retrieve
------------

.. confval:: Details

  :job type: ``ugvRetrieve``
  :tasks: UGV Retrieve Target, Deliver Target
  :start message:
    .. code-block:: json

      {
        "type": "start",
        "jobType": "ugvRetrieve"
      }

------------

UUV Retrieve
------------

.. confval:: Details

  :job type: ``uuvRetrieve``
  :tasks: UUV Retrieve Target
  :start message:
    .. code-block:: json

      {
        "type": "start",
        "jobType": "uuvRetrieve"
      }

----------

Quick Scan
----------

.. confval:: Details

  :job type: ``quickScan``
  :tasks: Quick Scan
  :start message:
    .. code-block:: json

      {
        "type": "start",
        "jobType": "quickScan"
      }

---------------

Detailed Search
---------------

.. confval:: Details

  :job type: ``detailedSearch``
  :tasks: Detailed Search
  :start message:
    .. code-block:: json

      {
        "type": "start",
        "jobType": "detailedSearch"
      }

-------------

List of tasks
=============

.. note:: The GCS must specify the type of task the vehicle is performing, as well as provide valid fields for the task.

Takeoff
-------

**Task type:** ``takeoff``

**Add mission message:**

.. code-block:: js

  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "takeoff",

      "lat": <float hex>,           // Takeoff waypoint latitude
      "lng": <float hex>,           // takeoff waypoint longitude
      "alt": <float hex>,           // Takeoff waypoint altitude
      "loiter":                 // Loiter waypoint information, used for UAV's idle state
      {
        "lat": <float hex>,
        "lng": <float hex>,
        "alt": <float hex>,
        "radius": <float hex>,      // Radius around loiter waypoint to fly around
        "direction": <float hex>    // Direction to loiter
      }
    }
  }

----------

ISR Search
----------

**Task type:** ``isrSearch``

**Add mission message:**

.. code-block:: js

  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "isrSearch",

      "alt": <float hex>,       // Altitude
      "waypoints":              // Array of three waypoints
      [
        {
          "lat": <float hex>,
          "lng": <float hex>
        },
        {
          "lat": <float hex>,
          "lng": <float hex>
        },
        {
          "lat": <float hex>,
          "lng": <float hex>
        }
      ]
    }
  }

------------

Payload Drop
------------

**Task type:** ``payloadDrop``

**Add mission message:**

.. code-block:: js

  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "payloadDrop",

      "waypoints":              // Array of two waypoints
      [
        {
          "lat": <float hex>,
          "lng": <float hex>,
          "alt": <float hex>
        },
        {
          "lat": <float hex>,
          "lng": <float hex>,
          "alt": <float hex>
        }
      ]
    }
  }

----

Land
----

**Task type:** ``land``

**Add mission message:**

.. code-block:: js

  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "land",

      "waypoints":              // Array of two waypoints
      [
        {
          "lat": <float hex>,
          "lng": <float hex>,
          "alt": <float hex>
        },
        {
          "lat": <float hex>,
          "lng": <float hex>,
          "alt": <float hex>
        }
      ]
    }
  }

-------------------

UGV Retrieve Target
-------------------

**Task type:** ``retrieveTarget``

**Add mission message:**

.. code-block:: js

  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "retrieveTarget",

      "lat": <float hex>,
      "lng": <float hex>
    }
  }

--------------

Deliver Target
--------------

**Task type:** ``deliverTarget``

**Add mission message:**

.. code-block:: js

  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "deliverTarget",

      "lat": <float hex>,
      "lng": <float hex>
    }
  }

-------------------

UUV Retrieve Target
-------------------

**Task type:** ``retrieveTarget``

**Add mission message:**

.. code-block:: js

  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "retrieveTarget"
    }
  }

----------

Quick Scan
----------

**Task type:** ``quickScan``

**Add mission message:**

.. code-block:: js

  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "quickScan",

      "searchArea":
      {
        "center": [<float hex>, <float hex>]  // [Latitude, Longitude] of area to search
        "rad1": <float hex>,
        "rad2": <float hex>
      }
    }
  }

---------------

Detailed Search
---------------

**Task type:** ``detailedSearch``

**Add mission message:**

.. code-block:: js

  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "detailedSearch",

      "lat": <float hex>,
      "lng": <float hex>
    }
  }
