/**
 * "Predicate" name and description is taken from official TypeScript definitions.
 */
type Predicate<T> = (value: T, index: number, obj: T[]) => boolean;

/**
 * Modified array class with a modified shift function.
 *
 *Note: shift is JavaScript's convention of naming the Queue dequeue function.
 */
export class List<T> extends Array<T> {
  /**
   * Modified version of Array's shift function. Removes all elements from oldest to the element
   * where predicate is true. If no element makes predicate true, then no elements are removed and
   * undefined is returned.
   *
   * @param predicate Calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found,
   * array will remove all elements from oldest up to that element. Otherwise, will not
   * remove any elements and returns undefined.
   */
  public shiftToElement(predicate: Predicate<T>): T[] | undefined {
    // If array length is zero or length was modified to a negative number.
    if (this.length <= 0) {
      return undefined;
    }

    const elementIndex = this.findIndex(predicate);
    return elementIndex !== -1 ? this.splice(elementIndex) : undefined;
  }
}

/**
 * Options for the DictionaryList class.
 */
export interface DictionaryListOptions<T> {
  predicate: Predicate<T>;
}

/**
 * Structure that can store lists in a dictionary. Lists can be obtained with a key string,
 * and can be modified with custom functions.
 */
export default class DictionaryList<T> {
  /**
   * Object of string keys to generic type arrays for the class to use.
   */
  private dictionary: { [key: string]: List<T> } = {};

  /**
   * Total number of items between all lists in the dictionary.
   */
  private numItems = 0;

  /**
   * Custom callback function to obtain values for list.
   */
  private predicate: Predicate<T> | undefined = undefined;

  public constructor(options?: DictionaryListOptions<T>) {
    if (!options) return;

    this.predicate = options.predicate;
  }

  /**
   * Removes the oldest element from dictionary's list with the given key
   * and returns it.
   */
  public dequeue(key: string): T | undefined {
    return this.dictionary[key].shift();
  }
}
