/* eslint-disable @typescript-eslint/no-explicit-any */

type Handler<T> = (value: T, events?: { [key: string]: any }) => boolean;

/**
 * Options for the timeout for a listener.
 */
interface ListenerTimeoutOptions {
  /**
   * Function that will execute once the function times out.
   */
  callback(): void;

  /**
   * Amount of time (in milliseconds) for the function to time out.
   */
  time: number;
}

interface Listener<T> {
  /**
   * Function that checks whether or not a given event value passes this listener's standards.
   */
  handler: Handler<T>;

  /**
   * Reference to the setTimeout that is created. This allows us to call clearTimeout when
   * deleting the handler while the timeout has not executed.
   */
  expiry?: NodeJS.Timeout;
}

/**
 * Handler that can create listeners for certain events which will perform callbacks
 * when the listener receives such event. Basically it is something that can handle processing
 * different types of events with different values.
 *
 * For example, a handler can have a listener for an event which will close once it receives
 * an event with a certain response (in our case it can be an event with a "complete" message).
 */
export default class UpdateHandler {
  private eventDictionary: { [key: string]: Listener<any>[] | undefined } = {};

  /**
   * Adds a new listener to the handlers.
   *
   * @param name The name of the event.
   * @param handler The function to handle the event.
   * @param timeout The timeout function and time for the event to expire.
   */
  public addHandler<T>(
    name: string,
    handler: Handler<T>,
    timeout?: ListenerTimeoutOptions,
  ): Listener<T> {
    // Create an event with the handler function.
    const listener: Listener<T> = { handler };

    /*
     * If a timeout is provided, the event will remove itself and run its callback function
     * when the timeout runs out. If we need to remove the event manually and it has a timeout,
     * we will need to call the clearTimeout function on the event's expiry.
     */
    if (timeout) {
      listener.expiry = setTimeout((): void => {
        // Deletes the listener.
        if (this.eventDictionary[name]) {
          this.eventDictionary[name] = (this.eventDictionary[name] as Listener<T>[])
            .filter((lis): boolean => lis !== listener);
        }

        timeout.callback();
      }, timeout.time);
    }

    // Adds the event to the list with the proper event identifier.
    if (!this.eventDictionary[name]) {
      this.eventDictionary[name] = [];
    }
    (this.eventDictionary[name] as Listener<T>[]).push(listener);

    return listener;
  }

  /**
   * Processes the event based on the handlers stored.
   *
   * @param name The name of the event that occured.
   * @param value The value being passed to the listeners of that event.
   * @param events All other events that happened at that time.
   */
  public event<T>(name: string, value: T, events?: { [key: string]: any }): void {
    if (!this.eventDictionary[name]) return;

    this.eventDictionary[name] = (this.eventDictionary[name] as Listener<T>[])
      .filter((lis): boolean => {
        const handled = lis.handler(value, events);
        /*
         * Removes listener if it has not been triggered yet. Will also clearTimeout
         * the expiry if the listener has one so that the timeout will not trigger afterwards.
         */
        if (handled) {
          if (lis.expiry) clearTimeout(lis.expiry);
        }
        return !handled;
      });
  }

  /**
   * Process all the given events.
   *
   * @param events Key/value pair of the events that happened and their corresponding values.
   */
  public events(events: { [key: string]: any }): void {
    Object.keys(events).forEach((key): void => {
      this.event(key, events[key], events);
    });
  }

  /**
   * Remove the listener from the handler. The provided name and listener must be the same
   * as the ones used when creating the handler.
   *
   * @param name The name of the event handler string.
   * @param listener The listener itself.
   */
  public removeHandler<T>(name: string, listener: Listener<T>): void {
    // Will clearTimeout the listener if it has an expiry.
    if (listener.expiry) clearTimeout(listener.expiry);

    // Removes the listener from the handler.
    if (!this.eventDictionary[name]) return;
    this.eventDictionary[name] = (this.eventDictionary[name] as Listener<T>[])
      .filter((lis): boolean => lis !== listener);
  }
}
