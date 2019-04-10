import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import UpdateHandler from '../../../src/common/struct/UpdateHandler';

let handler: UpdateHandler;

describe('UpdateHandler', (): void => {
  describe('+ addHandler() & + event()', (): void => {
    beforeEach((): void => { handler = new UpdateHandler(); });

    it('should allow adding a simple one time event', (): void => {
      let counter = 0;

      handler.addHandler<number>('status', (v): boolean => {
        if (v === 10) counter += 1;
        return v === 10;
      });

      expect(counter).to.equal(0);

      // Event should run and remove itself (only runs once).
      handler.event<number>('status', 10);
      expect(counter).to.equal(1);

      // Since event not present, should do nothing.
      handler.event<number>('status', 10);
      expect(counter).to.equal(1);
    });

    it('event does not get removed if it does not get run', (): void => {
      let counter = 0;

      handler.addHandler<number>('status', (v): boolean => {
        if (v === 10) counter += 1;
        return v === 10;
      });

      expect(counter).to.equal(0);

      handler.event<number>('nope', 10);
      expect(counter).to.equal(0);

      handler.event<number>('status', 10);
      expect(counter).to.equal(1);
    });

    it('should allow adding events that can be run, but not get removed immediately', (): void => {
      let counter = 0;

      handler.addHandler<number>('status', (v): boolean => {
        counter += 1;
        return v === 10;
      });

      expect(counter).to.equal(0);

      handler.event<number>('status', 0);
      expect(counter).to.equal(1);

      handler.event<number>('status', -100);
      expect(counter).to.equal(2);

      handler.event<number>('status', 1);
      expect(counter).to.equal(3);

      handler.event<number>('status', 10);
      expect(counter).to.equal(4);

      handler.event<number>('status', 10);
      expect(counter).to.equal(4);
    });

    it('should allow adding several events with different keys', (): void => {
      let counter = 0;

      handler.addHandler<number>('status', (v): boolean => {
        counter += 1;
        return v === 10;
      });

      handler.addHandler<string>('job', (v): boolean => {
        counter += 100;
        return v === 'error';
      });

      expect(counter).to.equal(0);

      handler.event<number>('status', 0);
      expect(counter).to.equal(1);

      handler.event<number>('job', -100);
      expect(counter).to.equal(101);

      handler.event<number>('status', 1);
      expect(counter).to.equal(102);

      handler.event<string>('job', 'error');
      expect(counter).to.equal(202);

      handler.event<number>('status', 10);
      expect(counter).to.equal(203);

      handler.event<string>('job', 'error');
      expect(counter).to.equal(203);

      handler.event<number>('status', 10);
      expect(counter).to.equal(203);
    });

    it('should allow adding several events with the same key', (): void => {
      let counter1 = 0;
      let counter2 = 0;

      handler.addHandler<number>('status', (v): boolean => {
        counter1 += 1;
        return v === 10;
      });

      handler.addHandler<string>('status', (v): boolean => {
        counter2 += 100;
        return v === 'error';
      });

      expect(counter1).to.equal(0);
      expect(counter2).to.equal(0);

      handler.event('status', 0);
      expect(counter1).to.equal(1);
      expect(counter2).to.equal(100);

      handler.event('status', 1);
      expect(counter1).to.equal(2);
      expect(counter2).to.equal(200);

      handler.event('status', 'error');
      expect(counter1).to.equal(3);
      expect(counter2).to.equal(300);

      handler.event('status', 'error');
      expect(counter1).to.equal(4);
      expect(counter2).to.equal(300);

      handler.event('status', 10);
      expect(counter1).to.equal(5);
      expect(counter2).to.equal(300);

      handler.event('status', 10);
      expect(counter1).to.equal(5);
      expect(counter2).to.equal(300);
    });

    it('should allow for events to expire on their own after a certain amount of time', (done): void => {
      /*
       * This test tests that the timeout runs after a certain amount of time.
       * If this test is timing out, this is likely because the timeout handler is
       * not getting executed.
       * Failure can also happen if the expiry runs before the events (unlikely).
       * Try increasing the expiry to a longer time (will slow tests) to check if this is your
       * issue.
       */
      let counter = 0;

      handler.addHandler<number>('status', (v): boolean => {
        counter += 1;
        return v === 10;
      }, {
        callback(): void {
          counter += 100;
          expect(counter).to.equal(102);

          handler.event<number>('status', 0);
          expect(counter).to.equal(102);

          done();
        },
        time: 25,
      });

      expect(counter).to.equal(0);

      handler.event<number>('status', 0);
      expect(counter).to.equal(1);

      handler.event<number>('status', 0);
      expect(counter).to.equal(2);
    });

    it('should allow for events to expire on their own after a certain amount of time, with more events for the same key', (done): void => {
      /*
       * This test tests that the timeout runs after a certain amount of time.
       * If this test is timing out, this is likely because the timeout handler is
       * not getting executed.
       * Failure can also happen if the expiry runs before the events (unlikely).
       * Try increasing the expiry to a longer time (will slow tests) to check if this is your
       * issue.
       */
      let counter1 = 0;
      let counter2 = 0;

      handler.addHandler<number>('status', (v): boolean => {
        counter1 += 1;
        return v === 10;
      }, {
        callback(): void {
          counter1 -= 100;
          expect(counter1).to.equal(-98);
          expect(counter2).to.equal(2);

          handler.event<number>('status', 0);
          expect(counter1).to.equal(-98);
          expect(counter2).to.equal(3);

          done();
        },
        time: 25,
      });

      handler.addHandler<string>('status', (v): boolean => {
        counter2 += 1;
        return v === 'error';
      });

      expect(counter1).to.equal(0);
      expect(counter2).to.equal(0);

      handler.event<number>('status', 0);
      expect(counter1).to.equal(1);
      expect(counter2).to.equal(1);

      handler.event<number>('status', 0);
      expect(counter1).to.equal(2);
      expect(counter2).to.equal(2);
    });
  });

  describe('+ events()', (): void => {
    beforeEach((): void => { handler = new UpdateHandler(); });

    it('should processing many events at once', (): void => {
      handler = new UpdateHandler();
      let statusCounter = 0;
      let locationCounter = 0;

      handler.addHandler<number>('status', (v): boolean => {
        statusCounter += v;
        return false;
      });

      handler.addHandler<number>('location', (v): boolean => {
        locationCounter += v;
        return false;
      });

      expect(statusCounter).to.equal(0);
      expect(locationCounter).to.equal(0);

      handler.events({ status: 1, location: 1 });

      expect(statusCounter).to.equal(1);
      expect(locationCounter).to.equal(1);

      handler.events({ status: 5 });

      expect(statusCounter).to.equal(6);
      expect(locationCounter).to.equal(1);
    });
  });


  describe('+ removeHandler()', (): void => {
    beforeEach((): void => { handler = new UpdateHandler(); });

    it('should allow the removal of the given handler', (): void => {
      handler = new UpdateHandler();
      let statusCounter = 0;
      let locationCounter = 0;

      const statusHandler = handler.addHandler<number>('status', (v): boolean => {
        statusCounter += v;
        return false;
      });

      const locationHandler = handler.addHandler<number>('location', (v): boolean => {
        locationCounter += v;
        return false;
      });

      expect(statusCounter).to.equal(0);
      expect(locationCounter).to.equal(0);

      handler.events({ status: 1, location: 1 });

      expect(statusCounter).to.equal(1);
      expect(locationCounter).to.equal(1);

      statusHandler.removeHandler();
      handler.events({ status: 1, location: 1 });

      expect(statusCounter).to.equal(1);
      expect(locationCounter).to.equal(2);

      locationHandler.removeHandler();
      handler.events({ status: 1, location: 1 });

      expect(statusCounter).to.equal(1);
      expect(locationCounter).to.equal(2);
    });
  });
});
