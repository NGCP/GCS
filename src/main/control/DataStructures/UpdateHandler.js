/**
 * This class to contain the logic required to queue up event handlers for a
 * given field & value.
 * The idea is that this gives a Data Structure in which for each update event
 * (identified by a string) there can be an associated function to handle the event.
 * Furthermore, you can also create events that will automatically expire and run
 * an expiry function if the event is not satisfied in time.
 */

export default class UpdateHandlers {
  constructor() {
    this.event_dict = {};
  }

  /**
   * Add a new event to the handlers. The event string and the handler are required.
   * An additional timeout function and timeout time (in milliseconds) can also be
   * specified.
   *
   * @param {string} event_str the string identifier of the event to monitor
   * @param {Function} handler_f the function to handle the event
   * @param {Function} timeout_f the timeout function to run if the event expires
   * @param {integer} timeout_time the time in milliseconds before running the timeout function
   * @returns {Object} the event object; can be ignored if the event will not be removed manually.
   */
  addHandler(event_str, handler_f, timeout_f, timeout_time) {
    if (event_str === undefined || handler_f === undefined) {
      throw new Error('event string and the handler function must both be specified');
    }

    if (!(event_str in this.event_dict)) {
      this.event_dict[event_str] = [];
    }

    const event_obj = { handler: handler_f, expiry: null };

    if (timeout_f !== undefined && timeout_time !== undefined) {
      event_obj.expiry = setTimeout(() => {
        this.event_dict[event_str] = this.event_dict[event_str].filter(v => v !== event_obj);
        timeout_f();
      }, timeout_time);
    } else if (timeout_f !== undefined || timeout_time !== undefined) {
      throw new Error('Both the timeout function and the timeout time must be specified, if at all');
    }

    this.event_dict[event_str].push(event_obj);

    return event_obj;
  }

  /**
   * Process the event based on the handlers stored.
   *
   * @param {string} event_str the name of the event
   * @param {any} value the value being updated
   * @param {Object} full the entire update message, used when an event may need
   * information beside just the current key/value pair. Optional.
   */
  event(event_str, value, full) {
    if (!(event_str in this.event_dict)) {
      return;
    }

    this.event_dict[event_str] = this.event_dict[event_str].filter(v => {
      const r = v.handler(value, full);
      if (r === true) {
        // Remove handler
        if (v.expiry !== null) {
          clearTimeout(v.expiry);
        }
        return false;
      }
      // Keep handler
      return true;
    });
  }

  /**
   * Process all the given events. The value must be a key/value pair. All items
   * will attempt to be processed.
   *
   * @param {Object} events_kv_pair a key value pair of all the events/values to process
   */
  events(events_kv_pair) {
    for (const key in events_kv_pair) {
      this.event(key, events_kv_pair[key], events_kv_pair);
    }
  }

  /**
   * Remove the given handler, the name of the event must be the same as the one
   * used when creating the handler, and the object must be thesame as the one
   * returned by addHandler().
   *
   * @param {string} event_str the name of the event handler string
   * @param {Object} event_obj the event object
   */
  removeHandler(event_str, event_obj) {
    if (this.event_dict[event_str].exipry !== null) {
      clearTimeout(this.event_dict[event_str].expiry);
    }
    this.event_dict[event_str] = this.event_dict[event_str].filter(v => v !== event_obj);
  }
}
