import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

// TODO: remove when https://github.com/benmosher/eslint-plugin-import/issues/1282 resolves
import DictionaryList, { Callback } from '../../../src/common/struct/DictionaryList'; // eslint-disable-line import/named

let dict: DictionaryList<number>;

describe('DictionaryList', (): void => {
  describe('+ shift()', (): void => {
    beforeEach((): void => { dict = new DictionaryList(); });

    it('should shift values in order that they were inserted', (): void => {
      dict.push('P1', 100);
      dict.push('P1', 101);
      dict.push('P1', 102);

      expect(dict.size()).to.equal(3);
      expect(dict.shift('P1')).to.equal(100);
      expect(dict.shift('P1')).to.equal(101);
      expect(dict.shift('P1')).to.equal(102);
      expect(dict.size()).to.equal(0);
    });

    it('should return undefined when attempting to shift an empty or invalid key', (): void => {
      dict.push('P1', 100);

      expect(dict.shift('P1')).to.equal(100);
      expect(dict.shift('P1')).to.be.undefined;
      expect(dict.shift('ETC')).to.be.undefined;
    });
  });

  describe('+ remove()', (): void => {
    beforeEach((): void => { dict = new DictionaryList(); });

    it('should use custom callback method to remove when set', (): void => {
      const callback: Callback<number> = (_, index, array): boolean => index === array.length - 1;

      dict.push('P1', 100);
      dict.push('P1', 101);
      dict.push('P1', 102);
      dict.push('P1', 103);

      expect(dict.remove('P1', callback)).to.equal(103);
      expect(dict.remove('P1', callback)).to.equal(102);
      expect(dict.remove('P1', callback)).to.equal(101);
      expect(dict.remove('P1', callback)).to.equal(100);
      expect(dict.remove('P1', callback)).to.be.undefined;
    });
  });

  describe('+ push()', (): void => {
    beforeEach((): void => { dict = new DictionaryList(); });

    it('should add an item to the list with the specified key', (): void => {
      expect(dict.get('P1')).to.be.undefined;
      expect(dict.get('P2')).to.be.undefined;
      expect(dict.get('P3')).to.be.undefined;

      dict.push('P1', 100);
      dict.push('P1', 100);
      dict.push('P1', 100);
      dict.push('P2', 100);

      expect(dict.size('P1')).to.equal(3);
      expect(dict.size('P2')).to.equal(1);
      expect(dict.size('P3')).to.equal(0);
      expect(dict.size()).to.equal(4);
    });

    it('should be able to add to an old key that has previously been exhaused', (): void => {
      dict.push('P1', 100);
      dict.push('P1', 100);
      dict.push('P1', 100);
      dict.push('P2', 100);

      dict.shift('P1');
      dict.shift('P1');
      dict.shift('P1');

      expect(dict.size('P1')).to.equal(0);
      expect(dict.size('P2')).to.equal(1);
      expect(dict.size()).to.equal(1);

      dict.push('P1', 101);

      expect(dict.size('P1')).to.equal(1);
      expect(dict.shift('P1')).to.equal(101);
    });
  });

  describe('+ removeAll()', (): void => {
    beforeEach((): void => { dict = new DictionaryList(); });

    it('should remove the values equal to that specified for the given key', (): void => {
      dict.push('P1', 100);
      dict.push('P1', 101);
      dict.push('P2', 102);
      dict.push('P3', 103);

      expect(dict.size('P1')).to.equal(2);
      expect(dict.size()).to.equal(4);

      dict.removeAll('P1', (value): boolean => value === 101);
      expect(dict.size('P1')).to.equal(1);

      dict.removeAll('P1', (value): boolean => value === 100);
      expect(dict.size('P1')).to.equal(0);
      expect(dict.size()).to.equal(2);
    });

    it('should remove all the values equal to that specified for the given key, other keys are untouched', (): void => {
      dict.push('P1', 101);
      dict.push('P1', 101);
      dict.push('P1', 101);
      dict.push('P1', 102);
      dict.push('P1', 101);

      dict.push('P2', 101);

      expect(dict.size('P1')).to.equal(5);
      expect(dict.size()).to.equal(6);

      dict.removeAll('P1', (value): boolean => value === 101);
      expect(dict.size('P1')).to.equal(1);

      expect(dict.size()).to.equal(2);
    });
  });
});
