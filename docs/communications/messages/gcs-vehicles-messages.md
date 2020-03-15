# Messages from GCS to vehicles

## Connection acknowledgement message

Sent back to the vehicle that GCS has accepted its request to connect. GCS forwards its time in the
`time` field for the vehicle to create an offset to and send all future messages to in GCS's time.

See the connect message that initiates this acknowledgement request
[here](../vehicles-gcs-messages/#connect-message). Also see the implementation for the `time`
field for messages, which directly relates to this message [here](../implementation/#setting-time).

```javascript
{
  "type": "connectionAck",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>,
  "time": <unsigned 64-bit integer>
}
```

!!! info "Requires an [acknowledgement message][] from the vehicle."

----------------------------------------------------------------------------------------------------

## Start message

Sent to the vehicle to assign a job to complete a mission.

```javascript
{
  "type": "start",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>,
  "time": <unsigned 64-bit integer>,
  "jobType": <string>,
}
```

  - **jobType : string**
      - Job being assigned to the vehicle to in order to complete the mission. This vehicle is
      capable of doing the job.

!!! info "Requires an [acknowledgement message][] from the vehicle."

----------------------------------------------------------------------------------------------------

## Add mission message

Sent to the vehicle to assign a task to perform. The task should be something under the vehicle's
job.

```javascript
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
```

  - **missionInfo : object**
      - Task being assigned to the vehicle. This includes the task type as well as information
      related to that task. See the [list of tasks][] to see the list of valid tasks and their
      provided information.

!!! info "Requires an [acknowledgement message][] from the vehicle."

----------------------------------------------------------------------------------------------------

## Pause message

Sent to the vehicle to pause it from its current task.

```javascript
{
  "type": "pause",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>,
  "time": <unsigned 64-bit integer>,
}
```

!!! info "Requires an [acknowledgement message][] from the vehicle."

----------------------------------------------------------------------------------------------------

## Resume message

Sent to the vehicle to resume it back to its current task.

```javascript
{
  "type": "resume",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>,
  "time": <unsigned 64-bit integer>,
}
```

!!! info "Requires an [acknowledgement message][] from the vehicle."

----------------------------------------------------------------------------------------------------

## Stop message

Sent to the vehicle to stop its mission. This is either sent when the vehicle is in the middle of
the mission or when the vehicle has performed all tasks for the mission.

Vehicle should have a procedure to get to a stable state when this message is sent (e.g. a flying
plane should either loiter or land to the ground). Vehicles should continue to send
[update messages][] to the GCS.

```javascript
{
  "type": "stop",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>,
  "time": <unsigned 64-bit integer>,
}
```

----------------------------------------------------------------------------------------------------

## Geofence Message

Sent to the vehicle to send geofencing coordinates for the keep-in and keep-out zones of the
mission.

```javascript
{
  "type": "geofence",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>,
  "time": <unsigned 64-bit integer>,
  "geofence" {
    "keepOut": [<float>, <float>][],
    "keepIn": [<float>, <float>][]
  }
}
```

  - **geofence**
      - **keepOut : [float, float][]**
          - Array of structure `[latitude, longitude]` for all four corners of the box.

      - **keepIn : [float, float][]**
          - Array of structure `[latitude, longitude]` for all four corners of the box.

!!! info "Requires an [acknowledgement message][] from the vehicle."

----------------------------------------------------------------------------------------------------

## Control message

Sent to the vehicle to send manual control instructions. This message is sent to the vehicle
regardless of what it is currently doing, if the operator wants to send it.

```javascript
{
  "type": "control",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>
  "time": <unsigned 64-bit integer>
  "controlVehicle": <boolean>
  "straight": <signed 16-bit integer>
  "turn": <signed 16-bit integer>
  "operateTool": <boolean>
}
```

  - **controlVehicle : boolean**
      - `#!json true` if vehicle should be in manual mode. `#!json false` otherwise.

  - **straight : signed 16-bit integer**
      - Control vehicle forward/backward movement:
          - `#!json -1` to go backward
          - `#!json 0` to stay idle
          - `#!json 1` to go forward

  - **turn : signed 16-bit integer**
      - Control vehicle turn direction:
          - `#!json -1` to turn left
          - `#!json 0` to go straight
          - `#!json 1` to turn right'

  - **operateTool**
      - `#!json true` to turn on the fan/door. `#!json false` otherwise

!!! info "Requires an [acknowledgement message][] from the vehicle."

[acknowledgement message]: ../other-messages/#acknowledgement-message
[list of tasks]: ../../jobs-tasks/tasks/
[update messages]: ../vehicles-gcs-messages/#update-message
