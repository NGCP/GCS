/*
 * Set up the Spectron testing environment for unit tests
 */

const chai = require('chai');

const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const beforeEach = mocha.beforeEach;

import ListDict from '../main/control/DataStructures/ListDict';

describe('ListDict', () => {
  describe('+ get()', () => {
    let list_dict;

    it('should return a value in order that they were inserted', () => {
      list_dict = new ListDict();

      list_dict.push('P1', 100);
      list_dict.push('P1', 101);
      list_dict.push('P1', 102);

      chai.expect(list_dict.count).to.equal(3);
      chai.expect(list_dict.get('P1')).to.equal(100);
      chai.expect(list_dict.get('P1')).to.equal(101);
      chai.expect(list_dict.get('P1')).to.equal(102);
      chai.expect(list_dict.count).to.equal(0);
    });

    it('should throw an error when attempting to get an empty or invalid key', () => {
      list_dict = new ListDict();

      list_dict.push('P1', 100);

      chai.expect(list_dict.get('P1')).to.equal(100);
      chai.expect(() => list_dict.get('P1')).to.throw();

      chai.expect(() => list_dict.get('NOT_DEF')).to.throw();
    });

    it('should return the default value if it is set', () => {
      list_dict = new ListDict(null);

      list_dict.push('P1', 100);

      chai.expect(list_dict.get('P1')).to.equal(100);
      chai.expect(list_dict.get('P1')).to.equal(null);

      chai.expect(list_dict.get('NOT_DEF')).to.equal(null);
    });

    it('should use custom get method when set', () => {
      list_dict = new ListDict(undefined, arr => arr.length - 1);

      list_dict.push('P1', 100);
      list_dict.push('P1', 101);
      list_dict.push('P1', 102);
      list_dict.push('P1', 103);

      // In pop order as defined (LIFO)
      chai.expect(list_dict.get('P1')).to.equal(103);
      chai.expect(list_dict.get('P1')).to.equal(102);
      chai.expect(list_dict.get('P1')).to.equal(101);
      chai.expect(list_dict.get('P1')).to.equal(100);
      chai.expect(() => list_dict.get('P1')).to.throw();
    });
  });


  describe('+ push()', () => {
    let list_dict;

    beforeEach(() => {
      list_dict = new ListDict();
    });

    it('should add an item to the list with the specified key', () => {
      chai.expect(list_dict.countItemsForKey('P1')).to.equal(0);
      chai.expect(list_dict.countItemsForKey('P2')).to.equal(0);
      chai.expect(list_dict.countItemsForKey('P3')).to.equal(0);
      chai.expect(list_dict.count).to.equal(0);

      list_dict.push('P1', 100);
      list_dict.push('P1', 100);
      list_dict.push('P1', 100);
      list_dict.push('P2', 100);

      chai.expect(list_dict.countItemsForKey('P1')).to.equal(3);
      chai.expect(list_dict.countItemsForKey('P2')).to.equal(1);
      chai.expect(list_dict.countItemsForKey('P3')).to.equal(0);
      chai.expect(list_dict.count).to.equal(4);
    });

    it('should be able to add to an old key that has previously been exhaused', () => {
      list_dict.push('P1', 100);
      list_dict.push('P1', 100);
      list_dict.push('P1', 100);
      list_dict.push('P2', 100);

      list_dict.get('P1');
      list_dict.get('P1');
      list_dict.get('P1');

      chai.expect(list_dict.countItemsForKey('P1')).to.equal(0);
      chai.expect(list_dict.countItemsForKey('P2')).to.equal(1);
      chai.expect(list_dict.count).to.equal(1);

      list_dict.push('P1', 101);

      chai.expect(list_dict.countItemsForKey('P1')).to.equal(1);
      chai.expect(list_dict.get('P1')).to.equal(101);
    });
  });


  describe('+ keys', () => {
    it('should return a list of all the keys with values', () => {
      const list_dict = new ListDict();

      list_dict.push('P1', 100);
      list_dict.push('P1', 101);
      list_dict.push('P2', 200);
      list_dict.push('P3', 300);

      chai.expect(list_dict.keys.sort()).to.deep.equal(['P1', 'P2', 'P3'].sort());

      list_dict.get('P3');

      chai.expect(list_dict.keys.sort()).to.deep.equal(['P1', 'P2'].sort());
    });
  });


  describe('+ remove()', () => {
    it('should remove the values equal to that specified for the given key', () => {
      const list_dict = new ListDict();

      list_dict.push('P1', 100);
      list_dict.push('P1', 101);
      list_dict.push('P2', 200);
      list_dict.push('P3', 300);

      chai.expect(list_dict.countItemsForKey('P1')).to.equal(2);
      chai.expect(list_dict.count).to.equal(4);

      list_dict.remove('P1', 101);
      chai.expect(list_dict.countItemsForKey('P1')).to.equal(1);

      list_dict.remove('P1', 100);
      chai.expect(list_dict.countItemsForKey('P1')).to.equal(0);
      chai.expect(list_dict.count).to.equal(2);
    });

    it('should remove all the values equal to that specified for the given key, other keys are untouched', () => {
      const list_dict = new ListDict();

      list_dict.push('P1', 101);
      list_dict.push('P1', 101);
      list_dict.push('P1', 101);
      list_dict.push('P1', 102);
      list_dict.push('P1', 101);

      list_dict.push('P2', 101);

      chai.expect(list_dict.countItemsForKey('P1')).to.equal(5);
      chai.expect(list_dict.count).to.equal(6);

      list_dict.remove('P1', 101);
      chai.expect(list_dict.countItemsForKey('P1')).to.equal(1);

      chai.expect(list_dict.count).to.equal(2);
    });
  });


  describe('+ setGetterForKey()', () => {
    let list_dict;

    it('should add a custom getter just for the given key', () => {
      list_dict = new ListDict();

      list_dict.push('P1', 100);
      list_dict.push('P1', 101);
      list_dict.push('P1', 102);
      list_dict.push('P2', 200);
      list_dict.push('P2', 201);
      list_dict.push('P2', 202);

      list_dict.setGetterForKey(arr => arr.length - 1, 'P1');

      // Custom getter in LIFO
      chai.expect(list_dict.get('P1')).to.equal(102);
      chai.expect(list_dict.get('P1')).to.equal(101);
      chai.expect(list_dict.get('P1')).to.equal(100);
      // Default getter in FIFO
      chai.expect(list_dict.get('P2')).to.equal(200);
      chai.expect(list_dict.get('P2')).to.equal(201);
      chai.expect(list_dict.get('P2')).to.equal(202);
    });
  });


  describe('+ removeGetterForKey()', () => {
    let list_dict;

    it('should remove a custom getter just for the given key', () => {
      list_dict = new ListDict();

      list_dict.push('P1', 100);
      list_dict.push('P1', 101);
      list_dict.push('P1', 102);

      list_dict.setGetterForKey(arr => arr.length - 1, 'P1');

      // Custom getter in LIFO
      chai.expect(list_dict.get('P1')).to.equal(102);
      chai.expect(list_dict.get('P1')).to.equal(101);
      chai.expect(list_dict.get('P1')).to.equal(100);

      list_dict.push('P1', 100);
      list_dict.push('P1', 101);
      list_dict.push('P1', 102);

      list_dict.removeGetterForKey('P1');
      chai.expect(list_dict.get('P1')).to.equal(100);
      chai.expect(list_dict.get('P1')).to.equal(101);
      chai.expect(list_dict.get('P1')).to.equal(102);
    });
  });


  describe('+ setGetter()', () => {
    let list_dict;

    it('should modify the global getter method', () => {
      list_dict = new ListDict();
      list_dict.setGetter(arr => arr.length - 1);

      list_dict.push('P1', 100);
      list_dict.push('P1', 101);
      list_dict.push('P1', 102);
      list_dict.push('P1', 103);

      // In pop order as defined (LIFO)
      chai.expect(list_dict.get('P1')).to.equal(103);
      chai.expect(list_dict.get('P1')).to.equal(102);
      chai.expect(list_dict.get('P1')).to.equal(101);
      chai.expect(list_dict.get('P1')).to.equal(100);
      chai.expect(() => list_dict.get('P1')).to.throw();
    });
  });
});
