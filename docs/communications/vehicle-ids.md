# Vehicle IDs

Every message should have an `sid` and `tid` field, whose values are the ID of the source and target
vehicle, respectively.

The vehicle IDs are assigned using the platform the vehicle is from as well as the vehicle itself.

!!! important "Tendency to change"
    The vehicles and platforms for each year's project are bound to change so keep this up-to-date.

The platforms are listed as follows:

| Platform ID | Platform Name                       |
| ----------- | ----------------------------------- |
| 0           | Ground Control Station (GCS)        |
| 1           | Unmanned Air Vehicle (UAV)          |
| 2           | Unmanned Ground Vehicle (UGV)       |
| 3           | Unmanned Underwater Vehicle (UUV)   |
| 4           | Vertical Takeoff and Landing (VTOL) |
| 5           | Remotely Operated Vehicle (ROV)     |
| 6           | Blimp                               |

The vehicle IDs are listed as following:

| Vehicle ID | Vehicle Description | XBee MAC Address |
| ---------- | ------------------- | ---------------- |
| 000        | GCS                 | 0013A2004194754E |
| 100        | Skywalker ISR UAV   | 0013A2004194783A |
| 101        | Piper Cub IPD UAV   | 0013A200419477B6 |
| 200        | UGV                 |                  |
| 300        | UUV                 |                  |
| 400        | VTOL 1              |                  |
| 401        | VTOL 2              |                  |
| 500        | ROV                 |                  |
| 600        | Blimp               |                  |
