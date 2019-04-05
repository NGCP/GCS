/* eslint-disable @typescript-eslint/no-explicit-any */

type HandlerCheck<T> = (value: T, events?: { [key: string]: any }) => boolean;

/**
 * Options for the timeout for a handler.
 */
interface HandlerTimeoutOptions {
  /**
   * Function that will execute once the function times out.
   */
  callback(): void;

  /**
   * Amount of time (in milliseconds) for the function to time out.
   */
  time: number;
}

interface Handler<T> {
  /**
   * Function that checks whether or not a given event value passes this handler's standards.
   */
  handlerCheck: HandlerCheck<T>;

  /**
   * Reference to the setTimeout that is created. This allows us to call clearTimeout when
   * deleting the handler while the timeout has not executed.
   */
  expiry?: NodeJS.Timeout;
}

/**
 * Class that can create handlers for certain events which will perform callbacks
 * when the handler receives such event. Basically it is something that can handle processing
 * different types of events with different values.
 *
 * For example, a handler can be created for an event which will close once it receives
 * an event with a certain response.
 */
export default class UpdateHandler {
  private eventDictionary: { [key: string]: Handler<any>[] | undefined } = {};

  /**
   * Adds a new handler.
   *
   * @param name The name of the event.
   * @param handlerCheck The function to check whether or not the handler has been handled.
   * @param timeout The timeout function and time for the event to expire.
   */
  public addHandler<T>(
    name: string,
    handlerCheck: HandlerCheck<T>,
    timeout?: HandlerTimeoutOptions,
  ): Handler<T> {
    const handler: Handler<T> = { handlerCheck };

    /*
     * If a timeout is provided, the handler will remove itself and run its callback function
     * when the timeout runs out. If we need to remove the handler manually and it has a timeout,
     * we will need to call the clearTimeout function on the handler's expiry.
     */
    if (timeout) {
      handler.expiry = setTimeout((): void => {
        // Deletes the handler.
        if (this.eventDictionary[name]) {
          this.eventDictionary[name] = (this.eventDictionary[name] as Handler<T>[])
            .filter((lis): boolean => lis !== handler);
        }

        timeout.callback();
      }, timeout.time);
    }

    // Adds the handler to the list with the proper event name.
    if (!this.eventDictionary[name]) {
      this.eventDictionary[name] = [];
    }
    (this.eventDictionary[name] as Handler<T>[]).push(handler);

    return handler;
  }

  /**
   * Processes the event based on the handlers stored.
   *
   * @param name The name of the event that occured.
   * @param value The value being passed to the handlers of that event.
   * @param events All other events that happened at that time.
   */
  public event<T>(name: string, value: T, events?: { [key: string]: any }): void {
    if (!this.eventDictionary[name]) return;

    this.eventDictionary[name] = (this.eventDictionary[name] as Handler<T>[])
      .filter((lis): boolean => {
        const handled = lis.handlerCheck(value, events);

        /*
         * Removes handler if it has not been triggered yet. Will also clearTimeout
         * the expiry if the handler has one so that the timeout will not trigger afterwards.
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
   * Remove the handler. The provided name and handler must be the same
   * as the ones used when creating the handler.
   *
   * @param name The name of the event the handler is in.
   * @param handler The handler itself.
   */
  public removeHandler<T>(name: string, handler: Handler<T>): void {
    // Will clearTimeout the handler if it has an expiry.
    if (handler.expiry) clearTimeout(handler.expiry);

    // Removes the handler from the event's list of handlers.
    if (!this.eventDictionary[name]) return;
    this.eventDictionary[name] = (this.eventDictionary[name] as Handler<T>[])
      .filter((lis): boolean => lis !== handler);
  }
}
