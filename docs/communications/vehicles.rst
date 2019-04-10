===========
Vehicle IDs
===========

Every message should have an ``sid`` and ``tid`` field, whose values are the ID of the source and target vehicle, respectively.

The vehicle IDs are generated using the platform the vehicle is from as well as the vehicle itself.

The platforms are listed as follows:

.. list-table::
  :header-rows: 1
  :widths: 10 30

  * - Platform ID
    - Platform Name
  * - 0
    - Ground Control Station (GCS)
  * - 1
    - Unmanned Air Vehicle (UAV)
  * - 2
    - Unmanned Ground Vehicle (UGV)
  * - 3
    - Unmanned Underwater Vehicle (UUV)
  * - 4
    - Vertical Takeoff and Landing (VTOL)
  * - 5
    - Remotely Operated Vehicle (ROV)
  * - 6
    - Blimp

The vehicle IDs are listed as following:

.. list-table::
  :header-rows: 1
  :widths: 10 20 20

  * - Vehicle ID
    - Vehicle Description
    - Xbee MAC Address
  * - 000
    - GCS
    -
  * - 100
    - UAV
    -
  * - 200
    - UGV
    -
  * - 300
    - UUV
    - Not applicable
  * - 400
    - VTOL 1
    -
  * - 401
    - VTOL 2
    -
  * - 500
    - ROV
    -
  * - 600
    - Blimp
    -
