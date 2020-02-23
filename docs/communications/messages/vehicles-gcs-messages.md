# Messages from vehicles to GCS

## Connect message

Sent to the GCS to request connection to it. The vehicle will not have information of what GCS's
time is yet, so any number is sufficient. The GCS will disregard this time.

See the implementation for the `time` field for messages, which directly relates to this message
[here](../implementation/#setting-time).

```javascript
{
  "type": "connect",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>,
  "time": <unsigned 64-bit integer>,
  "jobsAvailable": <string[]>
}
```

  - **jobsAvailable : string[]**
      - List of jobs that the vehicle is. These jobs describe the tasks the vehicle is capable of
      performing. See the [list of jobs][] to see which jobs are valid.

!!! important "Requires a [connection acknowledgment message][] from the GCS."

----------------------------------------------------------------------------------------------------

## Update message

Sent to the GCS to let it know of the vehicle's status. This should always be sending to the GCS to
maintain connection to it.

```javascript
{
  "type": "update",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>,
  "time": <unsigned 64-bit integer>,
  "lat": <float>,
  "lng": <float>,
  "alt": <float>,
  "heading": <optional float>,
  "battery": <optional float>,
  "status": <string>,
  "errorMessage": <optional string>
}
```

  - **lat : float**
      - Latitude of vehicle.

  - **lng : float**
      - Longitude of vehicle.

  - **alt : optional float**
      - Altitude of vehicle.

  - **heading : optional float**
      - Heading of vehicle, in radians.

  - **battery : optional float**
      - Battery percentage of vehicle, expressed as a decimal. Range is `#!json 0 < x <= 1`.

  - **status : string**
      - Current status of vehicle. The following are the valid values:
          - *ready*: No job or mission was assigned to the vehicle.
          - *waiting*: Job was assigned, but vehicle is waiting to be assigned a task.
          - *running*: Job was assigned, and vehicle is currently performing a task.
          - *paused*: Job was assigned, and vehicle is paused from performing the task.
          - *error*: Vehicle is in an error state.

  - **errorMessage : optional string**
      - Only filled in when vehicle is in error status. Explains why the vehicle is in that status.

!!! info "Requires an [acknowledgement message][] from the GCS."

----------------------------------------------------------------------------------------------------

## Point of Interest message

Sent to the GCS to let it know of a point of interest found in a mission. Not all vehicles will need
to use this.

```javascript
{
  "type": "poi",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>,
  "time": <unsigned 64-bit integer>,
  "lat": <float>,
  "lng": <float>
}
```

  - **lat : float**
      - Latitude of point of interest.

  - **lng : float**
      - Longitude of point of interest.

!!! info "Requires an [acknowledgement message][] from the GCS."

----------------------------------------------------------------------------------------------------

## Complete message

Sent to the GCS to let it know that it has completed the assigned task.

```javascript
{
  "type": "poi",
  "id": <unsigned 32-bit integer>,
  "sid": <unsigned 32-bit integer>,
  "tid": <unsigned 32-bit integer>,
  "time": <unsigned 64-bit integer>
}
```

!!! info "Requires an [acknowledgement message][] from the GCS."

[acknowledgement message]: ../other-messages/#acknowledgement-message
[connection acknowledgment message]: ../gcs-vehicles-messages/#connection-acknowledgement-message
[list of jobs]: ../../jobs-tasks/jobs/
