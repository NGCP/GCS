# Jobs vs tasks

A vehicle's *job* (or profession) describes the type of *tasks* it can perform.

For example, an important part of the project is the ISR Search mission. To perform this mission,
the GCS look for vehicles that have an `isrSearch` job. By having the `isrSearch` job, the vehicle
is stating that it is capable of performing all of the following tasks that are related to the job:

  - `takeoff` task
  - `loiter` task
  - `isrSearch` task
  - `land` task

The GCS will assign the vehicles the `isrSearch` job by sending them a [start message][]. By doing
this, the vehicles know that they will be performing tasks very soon. The start message has a
`jobType` field, which will be set to `isrSearch`, so that the vehicles know which tasks to expect
next from the GCS.

To accomplish the ISR Search mission, GCS will assign a task for the vehicle to perform (for
example, `takeoff` task), and assigns the next after the vehicle completes the first. This goes on
until the ISR Search mission is completed.

[start message]: ../../messages/gcs-vehicles-messages/#start-message
