import DictionaryList from './DictionaryList';

type Handler<T> = (value: T, allEvents?: { [key: string]: T }) => boolean;

/**
 * Interface to handle expiry for an event when it has a timeout.
 */
interface EventTimeout {
  /**
   * Callback that is executed when timeout occurs.
   */
  callback(): void;

  /**
   * Time is in milliseconds
   */
  time: number;
}

interface Event<T> {
  /**
   * Handler function for the event.
   */
  handler: Handler<T>;

  /**
   * Expiry for a timeout, allows us to call clearTimeout on it.
   */
  expiry?: NodeJS.Timeout;
}


export default class UpdateHandler<T> {
  private eventDictionary = new DictionaryList<Event<T>>();

  /**
   * Adds a new event to the handlers.
   *
   * @param identifier The name of the event handler string.
   * @param handler The function to handle the event.
   * @param timeout The timeout function and time for the event to expire.
   */
  public addHandler(
    identifier: string,
    handler: Handler<T>,
    timeout?: EventTimeout,
  ): Event<T> {
    // Create an event with the handler function.
    const event: Event<T> = { handler };

    /*
     * If a timeout is provided, the event will remove itself and run its callback function
     * when the timeout runs out. If we need to remove the event manually and it has a timeout,
     * we will need to call the clearTimeout function on the event's expiry.
     */
    if (timeout) {
      event.expiry = setTimeout((): void => {
        this.eventDictionary.remove(identifier, (value): boolean => value !== event);
        timeout.callback();
      }, timeout.time);
    }

    // Adds the event to the list with the proper event identifier.
    this.eventDictionary.push(identifier, event);

    return event;
  }

  /**
   * Processes the event based on the handlers stored.
   *
   * @param identifier The name of the event handler string.
   * @param value The value being updated.
   * @param allEvents Key/Value pair of all events.
   */
  public event(identifier: string, value: T, allEvents?: { [key: string]: T }): void {
    const newEvents = this.eventDictionary.filter(identifier, (v): boolean => {
      const handled = v.handler(value, allEvents);
      if (handled) {
        // Remove handler.
        if (v.expiry) {
          clearTimeout(v.expiry);
        }

        return false;
      }

      // Keep handler.
      return true;
    });

    if (newEvents) {
      this.eventDictionary.set(identifier, newEvents);
    }
  }

  /**
   * Process all the given events. The value must be a key/value pair. All items
   * will attempt to be processed.
   */
  public events(allEvents: { [key: string]: T }): void {
    Object.keys(allEvents).forEach((key): void => {
      this.event(key, allEvents[key], allEvents);
    });
  }

  /**
   * Remove the given handler, the name of the event must be the same as the one used when
   * creating the handler, and the object must be the same as the one returned by addHandler
   *
   * @param identifier The name of the event handler string.
   * @param event The event itself.
   */
  public removeHandler(identifier: string, event: Event<T>): void {
    const ev = this.eventDictionary.remove(identifier, (value): boolean => value === event);
    if (ev && ev.expiry) {
      clearTimeout(ev.expiry);
    }
  }
}
