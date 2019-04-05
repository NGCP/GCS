export type Callback<T> = (value: T, index: number, array: T[]) => boolean;

/**
 * Structure that can store lists in a dictionary. Lists can be obtained with a key string,
 * and can be modified with custom functions.
 *
 * The functions in this structure can be called from the list with a few lines of code. However
 * it is possible that the value of a certain key can be undefined, which this class will do
 * checks for.
 */
export default class DictionaryList<T> {
  /**
   * Object of string keys to generic type arrays for the class to use.
   */
  private dictionary: { [key: string]: T[] | undefined } = {};

  /**
   * Total number of items between all lists in the dictionary.
   */
  private numItems = 0;

  /**
   * Appends new elements to an array, and returns the new size of the dictionary.
   *
   * @param key The key to access the list in the dictionary.
   */
  public push(key: string, ...values: T[]): number {
    if (!this.dictionary[key]) {
      this.dictionary[key] = [];
    }

    // Cast to T[] since this value cannot be undefined.
    const list = this.dictionary[key] as T[];

    this.numItems += values.length;
    list.push(...values);

    return this.numItems;
  }

  /**
   * Gets the list stored at the dictionary with the given key.
   *
   * @param key The key to access the list in the dictionary.
   */
  public get(key: string): T[] | undefined {
    return this.dictionary[key];
  }

  /**
   * Sets the list stored at the dictionary with the given key to the provided list.
   *
   * @param key The key to access the list in the dictionary.
   * @param list The list to change the dictionary's list to.
   */
  public set(key: string, list: T[]): void {
    this.dictionary[key] = list;
  }

  /**
   * Gets the oldest element from dictionary's list with the given key
   * where the callback is true.
   *
   * @param key The key to access the list in the dictionary.
   * @param callback Test each element, from oldest to newest. First element to pass
   * will be returned.
   */
  public find(key: string, callback: Callback<T>): T | undefined {
    const list = this.dictionary[key];
    if (!list) return undefined;

    return list.find(callback);
  }

  /**
   * Removes the oldest element from dictionary's list with the given key
   * and returns it. Will return undefined if there is no list at the given key
   * or if the list at that key is empty.
   *
   * @param key The key to access the list in the dictionary.
   */
  public shift(key: string): T | undefined {
    const list = this.dictionary[key];
    if (!list || list.length === 0) return undefined;

    this.numItems -= 1;
    return list.shift();
  }

  /**
   * Removes the oldest element from dictionary's list with the given key
   * where the callback is true.
   *
   * @param key The key to access the list in the dictionary.
   * @param callback Test each element, from oldest to newest. First element to pass
   * will be removed and returned.
   */
  public remove(key: string, callback: Callback<T>): T | undefined {
    const list = this.dictionary[key];
    if (!list) return undefined;

    const index = list.findIndex(callback);
    if (index === -1) return undefined;

    // Removes the element at that index and returns it.
    this.numItems -= 1;
    return list.splice(index, 1)[0];
  }

  /**
   * Removes all elements of an array that meets the condition specified in a callback function.
   *
   * @param key The key to access the list in the dictionary.
   * @param callback Test each element, from oldest to newest. All elements to pass
   * will be removed and returned in an array.
   */
  public removeAll(key: string, callback: Callback<T>): T[] | undefined {
    const list = this.dictionary[key];
    if (!list) return undefined;

    const removed: T[] = [];
    const kept: T[] = [];
    for (let i = 0; i < list.length; i += 1) {
      if (callback(list[i], i, list)) {
        removed.push(list[i]);
      } else {
        kept.push(list[i]);
      }
    }

    this.numItems -= removed.length;
    this.dictionary[key] = kept;
    return removed;
  }

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param key The key to access the list in the dictionary.
   * @param callback Test each element, from oldest to newest. All elements to pass
   * will be returned in an array.
   */
  public filter(key: string, callback: Callback<T>): T[] | undefined {
    const list = this.dictionary[key];
    if (!list) return undefined;

    return list.filter(callback);
  }

  /**
   * Gets all keys of the object whose list value has an element or more.
   */
  public keys(): string[] {
    return Object.keys(this.dictionary).filter((key): boolean => {
      const list = this.dictionary[key];
      if (!list) return false;

      return list.length > 0;
    });
  }

  /**
   * Gets the total number of items in the lists in the dictionary, or a certain list if
   * a key is provided.
   *
   * @param key The key to access the list in the dictionary.
   */
  public size(key?: string): number {
    if (key) {
      const list = this.dictionary[key];
      if (!list) return 0;

      return list.length;
    }

    return this.numItems;
  }
}