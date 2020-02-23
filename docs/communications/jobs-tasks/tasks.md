# List of tasks

!!! important Generating and assigning tasks
    The GCS must specify the type of task the vehicle is performing, as well as provide valid fields
    for the task on the [add mission message][].

## Takeoff

**Related jobs**: [ISR Search][], [Payload Drop][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## Loiter

**Related jobs**: [ISR Search][], [Payload Drop][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## ISR Search

**Related jobs**: [ISR Search][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## Payload Drop

**Related jobs**: [Payload Drop][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## Land

**Related jobs**: [ISR Search][], [Payload Drop][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## UGV Retrieve Target

**Related jobs**: [UGV Rescue][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## Deliver Target

**Related jobs**: [UGV Rescue][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## UUV Retrieve Target

**Related jobs**: [UUV Rescue][]

```javascript
// Add mission message (id, tid, sid, time fields omitted)
{
  "type": "addMission",
  "missionInfo":
  {
    "taskType": "retrieveTarget"
  }
}
```

----------------------------------------------------------------------------------------------------

## Quick Scan

**Related jobs**: [Quick Scan][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## Detailed Search

**Related jobs**: [Detailed Search][]

```javascript
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
```

[add mission message]: ../../messages/gcs-vehicles-messages/#add-mission-message

[ISR Search]: ../jobs/#isr-search
[Payload Drop]: ../jobs/#payload-drop
[UGV Rescue]: ../jobs/#ugv-rescue
[UUV Rescue]: ../jobs/#uuv-rescue
[Quick Scan]: ../jobs/#quick-scan
[Detailed Search]: ../jobs/#detailed-search
