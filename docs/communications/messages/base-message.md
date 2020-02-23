# Base message

## Requirements

**All messages** sent should be in valid JSON and should include all of the following fields:

```javascript
{
  "type": <string>,                  // Type of message being sent
  "id": <unsigned 32-bit integer>    // Unique ID for this message
  "sid": <unsigned 32-bit integer>   // Source vehicle's ID
  "tid": <unsigned 32-bit integer>   // Target vehicle's ID
  "time": <unsigned 64-bit integer>  // Number of seconds since January 1, 1970 0:00:00 UTC (epoch time)
}
```

## Implementing these fields

!!! warning "Deprecation notice"
    This section will be deleted once implementation of JSON communication is finished.

  - **type : string**
      - This field is predefined depending on the type of message.

  - **id : unsigned 32-bit integer**
      - See [this](../implementation/#creating-messages-with-proper-id-field) for
      information.

  - **sid/tid : unsigned 32-bit integer**
      - These fields are predefined for every platform. See the [list of vehicle IDs][] for the
      values used for these fields.

  - **time : unsigned 64-bit integer**
      - See [this](../implementation/#setting-time) for more information on implementing
      this field.

[list of vehicle IDs]: ../../vehicle-ids
