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

The GCS will assign the vehicles the ``isrSearch`` job by sending them a `start message <messages/gcs-vehicles-messages.html#start-message>`_. By doing this, the vehicles know that they will be performing tasks very soon. The start message has a ``jobType`` field, which will be set to ``isrSearch``, so that the vehicles know which tasks to expect next from the GCS.

To accomplish the ISR Search mission, GCS will assign a task for the vehicle to perform (for example, ``takeoff`` task), and assigns the next after the vehicle completes the first. This goes on until the ISR Search mission is completed.

------------

List of jobs
============

.. note::
  The vehicle must specify its jobs on the `connect message <messages/vehicles-gcs-messages.html#connect-message>`_, and the GCS must specify the job it is assigning to the vehicle on the `start message <messages/gcs-vehicles-messages.html#start-message>`_.

ISR Search
----------

.. confval:: Details

  :job type: ``isrSearch``
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

----------

UGV Rescue
----------

.. confval:: Details

  :job type: ``ugvRescue``
  :tasks: UGV Retrieve Target, Deliver Target
  :start message:
    .. code-block:: json

      {
        "type": "start",
        "jobType": "ugvRescue"
      }

----------

UUV Rescue
----------

.. confval:: Details

  :job type: ``uuvRescue``
  :tasks: UUV Retrieve Target
  :start message:
    .. code-block:: json

      {
        "type": "start",
        "jobType": "uuvRescue"
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

      "lat": <hex string>,           // Takeoff waypoint latitude
      "lng": <hex string>,           // takeoff waypoint longitude
      "alt": <hex string>,           // Takeoff waypoint altitude
      "loiter":                      // Loiter waypoint information, used for UAV's idle state
      {
        "lat": <hex string>,
        "lng": <hex string>,
        "alt": <hex string>,
        "radius": <hex string>,      // Radius around loiter waypoint to fly around
        "direction": <hex string>    // Direction to loiter
      }
    }
  }

.. note::
  Please click `here <implementation.html#hex-string>`_ to see what a hex string is and how to implement it.

------

Loiter
------

Used to update the loiter position of an airborne vehicle.

**Task type:** ``loiter``

**Add mission message:**

.. code-block:: js

  {
    "type": "addMission",
    "missionInfo":
    {
      "taskType": "loiter",

      "lat": <hex string>,
      "lng": <hex string>,
      "alt": <hex string>,
      "radius": <hex string>,      // Radius around loiter waypoint to fly around
      "direction": <hex string>    // Direction to loiter
    }
  }

.. note::
  Please click `here <implementation.html#hex-string>`_ to see what a hex string is and how to implement it.

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

      "alt": <hex string>,       // Altitude
      "waypoints":               // Array of three waypoints
      [
        {
          "lat": <hex string>,
          "lng": <hex string>
        },
        {
          "lat": <hex string>,
          "lng": <hex string>
        },
        {
          "lat": <hex string>,
          "lng": <hex string>
        }
      ]
    }
  }

.. note::
  Please click `here <implementation.html#hex-string>`_ to see what a hex string is and how to implement it.

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

      "waypoints":               // Array of two waypoints
      [
        {
          "lat": <hex string>,
          "lng": <hex string>,
          "alt": <hex string>
        },
        {
          "lat": <hex string>,
          "lng": <hex string>,
          "alt": <hex string>
        }
      ]
    }
  }

.. note::
  Please click `here <implementation.html#hex-string>`_ to see what a hex string is and how to implement it.

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
          "lat": <hex string>,
          "lng": <hex string>,
          "alt": <hex string>
        },
        {
          "lat": <hex string>,
          "lng": <hex string>,
          "alt": <hex string>
        }
      ]
    }
  }

.. note::
  Please click `here <implementation.html#hex-string>`_ to see what a hex string is and how to implement it.

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

      "lat": <hex string>,
      "lng": <hex string>
    }
  }

.. note::
  lease click `here <implementation.html#hex-string>`_ to see what a hex string is and how to implement it.

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

      "lat": <hex string>,
      "lng": <hex string>
    }
  }

.. note::
  Please click `here <implementation.html#hex-string>`_ to see what a hex string is and how to implement it.

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

      "waypoints":              // Array of four waypoints to determine search area
      [
        {
          "lat": <hex string>,   // Top left corner of search area
          "lng": <hex string>
        },
        {
          "lat": <hex string>,   // Top right corner of search area
          "lng": <hex string>
        },
        {
          "lat": <hex string>,   // Bottom left corner of search area
          "lng": <hex string>
        },
        {
          "lat": <hex string>,   // Bottom right corner of search area
          "lng": <hex string>
        }
      ]
    }
  }

.. note::
  Please click `here <implementation.html#hex-string>`_ to see what a hex string is and how to implement it.

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

      "lat": <hex string>,
      "lng": <hex string>
    }
  }

.. note::
  Please click `here <implementation.html#hex-string>`_ to see what a hex string is and how to implement it.
