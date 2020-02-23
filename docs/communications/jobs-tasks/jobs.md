# List of jobs

!!! important "The vehicle must specify its jobs on the [connect message][]."

!!! important "The GCS must specify the job it is assigning the vehicle on the [start message][]."

## ISR Search

**Related tasks:**  [Takeoff][], [Loiter][], [ISR Search][], [Land][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## Payload Drop

**Related tasks:** [Takeoff][], [Loiter][], [Payload Drop][], [Land][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## UGV Rescue

**Related tasks:** [UGV Retrieve Target][], [Deliver Target][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## UUV Rescue

**Related tasks:** [UUV Retrieve Target][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## Quick Scan

**Related tasks:** [Quick Scan][]

```javascript
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
```

----------------------------------------------------------------------------------------------------

## Detailed Search

**Related tasks:** [Detailed Search][]

```javascript
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
```

[connect message]: ../../messages/vehicles-gcs-messages/#connect-message
[start message]: ../../messages/gcs-vehicles-messages/#start-message

[Takeoff]: ../tasks/#takeoff
[Loiter]: ../tasks/#loiter
[ISR Search]: ../tasks/#isr-search
[Payload Drop]: ../tasks/#payload-drop
[Land]: ../tasks/#land
[UGV Retrieve Target]: ../tasks/#ugv-retrieve-target
[Deliver Target]: ../tasks/#deliver-target
[UUV Retrieve Target]: ../tasks/#uuv-retrieve-target
[Quick Scan]: ../tasks/#quick-scan
[Detailed Search]: ../tasks/#detailed-search
