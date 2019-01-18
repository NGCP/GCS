/**
 * Data structure for storing a dictionary that maps to a list.
 * Also allows for customizable get methods so that the item in the list may
 * be accessed accorrding to a custom algorithm. The default method is to access
 * the oldest item (FIFO)
 *
 *
 * Creating a custom getter method requires providing a method that should
 * accept a list of values and return the index of the value to access.
 */

export default class ListDict {
  constructor(default_value, get_method) {
    if (default_value !== undefined) {
      this.default_value = default_value;
    }
    if (get_method !== undefined) {
      this.get_method = get_method;
    } else {
      this.get_method = () => 0;
    }

    this.dict = {};
    this.item_count = 0;
  }

  /**
   * Returns the value in the dictionary according to the provided getter method
   *
   * @param {Any} key the key for the item.
   * @returns {Any} the value in the list
   */
  get(key) {
    if (!(key in this.dict) || this.dict[key].length <= 0) {
      if (this.default_value !== undefined) {
        return this.default_value;
      } else {
        throw new RangeError(`No entry for the key: ${key}`);
      }
    } else {
      this.item_count--;
      return this.dict[key].splice(this.get_method(this.dict[key]), 1)[0];
    }
  }

  /**
   * Remove the value from the list pointed at by the specified key. This will remove
   * all the values equal to the value given (not just the first one).
   * @param  {string} key   the key to the list from which to remove the value
   * @param  {Any} value the value to remove
   */
  remove(key, value) {
    if (key in this.dict) {
      const filtered_list = this.dict[key].filter(v => v !== value);
      this.item_count -= this.dict[key].length - filtered_list.length;
      this.dict[key] = filtered_list;
    }
  }

  /**
   * Push an item to the array for the given key.
   *
   * @param {Any} key the key for the item
   * @param {Any} value the value to insert
   */
  push(key, value) {
    if (!(key in this.dict)) {
      this.dict[key] = [];
    }
    this.item_count++;
    this.dict[key].push(value);
  }

  /**
   * Count the number of items that are stored under the given key.
   *
   * @param {Any} key the key for the item
   * @returns {integer} number of items stored
   */
  countItemsForKey(key) {
    if (key in this.dict) {
      return this.dict[key].length;
    } else {
      return 0;
    }
  }

  get keys() {
    return Object.keys(this.dict).filter(key => this.dict[key].length > 0);
  }

  get count() {
    return this.item_count;
  }
}
