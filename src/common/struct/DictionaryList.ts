export type Callback<T> = (value: T, index: number, array: T[]) => boolean;
export type CompareFunction<T> = (a: T, b: T) => number;

/**
 * Structure that can store lists in a dictionary. Lists can be obtained with a key string,
 * and can be modified with custom functions.
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

    const list = this.dictionary[key] as T[];

    this.numItems += values.length;
    list.push(...values);

    return this.numItems;
  }

  /**
   * Appends new elements to the front of the array, and returns the new size of
   * the dictionary.
   *
   * @param key The key to access the list in the dictionary.
   */
  public unshift(key: string, ...values: T[]): number {
    if (!this.dictionary[key]) {
      this.dictionary[key] = [];
    }

    const list = this.dictionary[key] as T[];

    this.numItems += values.length;
    list.unshift(...values);

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
    const currentLength = this.dictionary[key] ? this.size(key) : 0;
    this.dictionary[key] = list;

    this.numItems += list.length - currentLength;
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
   * Inserts elements to dictionary's list with the given key at an index. If the index
   * is larger than the list's size, the element will be added to the back of the list.
   *
   * @param key The key to access the list in the dictionary
   * @param index The index to insert the element at.
   * @param values The value to add to the list.
   */
  public insert(key: string, index: number, ...values: T[]): number {
    const list = this.dictionary[key];
    if (!list || index > list.length) return this.push(key, ...values);

    this.numItems += values.length;
    list.splice(index, 0, ...values);

    return this.numItems;
  }

  /**
   * Removes all elements of an array of a specified key that meets the condition
   * specified in a callback function.
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
   * Returns the elements of an array of a specified key that meet the condition
   * specified in a callback function.
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
   * Performs the specified action for each element in an array of a specified key.
   */
  public forEach(key: string, callback: (value: T, index: number, array: T[]) => void): void {
    const list = this.dictionary[key];
    if (!list) return;

    list.forEach(callback);
  }

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param key The key to access the list in the dictionary.
   * @param callback Test each element, and return true if an element passes the callback.
   */
  public some(key: string, callback: Callback<T>): boolean {
    const list = this.dictionary[key];
    if (!list) return true;

    return list.some(callback);
  }

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param key The key to access the list in the dictionary.
   * @param callback Test each element, and return true if an element passes the callback.
   */
  public every(key: string, callback: Callback<T>): boolean {
    const list = this.dictionary[key];
    if (!list) return true;

    return list.every(callback);
  }

  /**
   * Sorts a list for a given key.
   *
   * @param key The key to access the list in the dictionary.
   * @param compareFunction The function to compare the elements in the array.
   */
  public sort(key: string, compareFunction: CompareFunction<T>): T[] {
    const list = this.dictionary[key];
    if (!list) return [];

    return list.sort(compareFunction);
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
