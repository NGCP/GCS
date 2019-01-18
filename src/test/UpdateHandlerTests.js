/*
 * Set up the Spectron testing environment for unit tests
 */

const chai = require('chai');

const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;

import UpdateHandler from '../main/control/DataStructures/UpdateHandler';

describe('UpdateHandler', () => {
  describe('+ addHandler() & + event()', () => {
    let handler;

    it('should allow adding a simple one time event', () => {
      handler = new UpdateHandler();
      let counter = 0;

      handler.addHandler('status', v => {
        if (v === 10) {
          counter += 1;
          return true;
        }
        return false;
      });

      chai.expect(counter).to.equal(0);

      // event should run and remove itself (only runs once)
      handler.event('status', 10);

      chai.expect(counter).to.equal(1);

      // Since event not present, should do nothing
      handler.event('status', 10);

      chai.expect(counter).to.equal(1);
    });

    it('should allow adding a simple one time event; testing that event does not get removed if it does not get run', () => {
      handler = new UpdateHandler();
      let counter = 0;

      handler.addHandler('status', v => {
        if (v === 10) {
          counter += 1;
          return true;
        }
        return false;
      });

      chai.expect(counter).to.equal(0);
      handler.event('nope', 10);

      chai.expect(counter).to.equal(0);

      handler.event('status', 10);
      chai.expect(counter).to.equal(1);
    });

    it('should allow adding events that can be run, but not get removed immediately', () => {
      handler = new UpdateHandler();
      let counter = 0;

      handler.addHandler('status', v => {
        counter += 1;
        if (v === 10) {
          return true;
        }
        return false;
      });

      chai.expect(counter).to.equal(0);

      handler.event('status', 0);
      chai.expect(counter).to.equal(1);

      handler.event('status', -100);
      chai.expect(counter).to.equal(2);

      handler.event('status', 1);
      chai.expect(counter).to.equal(3);

      handler.event('status', 10);
      chai.expect(counter).to.equal(4);

      handler.event('status', 10);
      chai.expect(counter).to.equal(4);
    });

    it('should allow adding several events with different keys', () => {
      handler = new UpdateHandler();
      let counter = 0;

      handler.addHandler('status', v => {
        counter += 1;
        if (v === 10) {
          return true;
        }
        return false;
      });

      handler.addHandler('job', v => {
        counter += 100;
        if (v === 'ERROR') {
          return true;
        }
        return false;
      });

      chai.expect(counter).to.equal(0);

      handler.event('status', 0);
      chai.expect(counter).to.equal(1);

      handler.event('job', -100);
      chai.expect(counter).to.equal(101);

      handler.event('status', 1);
      chai.expect(counter).to.equal(102);

      handler.event('job', 'ERROR');
      chai.expect(counter).to.equal(202);

      handler.event('status', 10);
      chai.expect(counter).to.equal(203);

      handler.event('job', 'ERROR');
      chai.expect(counter).to.equal(203);

      handler.event('status', 10);
      chai.expect(counter).to.equal(203);
    });

    it('should allow adding several events with the same key', () => {
      handler = new UpdateHandler();
      let counter_a = 0;
      let counter_b = 0;

      handler.addHandler('status', v => {
        counter_a += 1;
        if (v === 10) {
          return true;
        }
        return false;
      });

      handler.addHandler('status', v => {
        counter_b += 100;
        if (v === 'ERROR') {
          return true;
        }
        return false;
      });

      chai.expect(counter_a).to.equal(0);
      chai.expect(counter_b).to.equal(0);

      handler.event('status', 0);
      chai.expect(counter_a).to.equal(1);
      chai.expect(counter_b).to.equal(100);

      handler.event('status', 1);
      chai.expect(counter_a).to.equal(2);
      chai.expect(counter_b).to.equal(200);

      handler.event('status', 'ERROR');
      chai.expect(counter_a).to.equal(3);
      chai.expect(counter_b).to.equal(300);

      handler.event('status', 'ERROR');
      chai.expect(counter_a).to.equal(4);
      chai.expect(counter_b).to.equal(300);

      handler.event('status', 10);
      chai.expect(counter_a).to.equal(5);
      chai.expect(counter_b).to.equal(300);

      handler.event('status', 10);
      chai.expect(counter_a).to.equal(5);
      chai.expect(counter_b).to.equal(300);
    });

    it('should allow for events to expire on their own after a certain amount of time', done => {
      // This test tests that the timeout runs after a certain amount of time.
      // If this test is timing out, this is likely because the timeout handler is
      // not getting executed.
      // Failure can also happen if the expiry runs before the events (unlikely)
      // Try increasing the expiry to a longer time (will slow tests) to check if this is your issue

      const my_handler = new UpdateHandler();
      let counter = 0;
      const t_handler = () => {
        chai.expect(counter).to.equal(102);

        my_handler.event('status', 0);
        chai.expect(counter).to.equal(102);

        done();
      };

      my_handler.addHandler('status', v => {
        counter += 1;
        if (v === 10) {
          return true;
        }
        return false;
      }, () => {
        counter += 100;
        t_handler();
      }, 25);

      chai.expect(counter).to.equal(0);

      my_handler.event('status', 0);
      chai.expect(counter).to.equal(1);

      my_handler.event('status', 0);
      chai.expect(counter).to.equal(2);
    });

    it('should allow for events to expire on their own after a certain amount of time, with more events for the same key', done => {
      // This test tests that the timeout runs after a certain amount of time.
      // If this test is timing out, this is likely because the timeout handler is
      // not getting executed.
      // Failure can also happen if the expiry runs before the events (unlikely)
      // Try increasing the expiry to a longer time (will slow tests) to check if this is your issue

      const my_handler = new UpdateHandler();
      let counter_a = 0;
      let counter_b = 0;

      const t_handler = () => {
        chai.expect(counter_a).to.equal(-98);
        chai.expect(counter_b).to.equal(2);

        my_handler.event('status', 0);
        chai.expect(counter_a).to.equal(-98);
        chai.expect(counter_b).to.equal(3);

        done();
      };

      my_handler.addHandler('status', v => {
        counter_a += 1;
        if (v === 10) {
          return true;
        }
        return false;
      }, () => {
        counter_a -= 100;
        t_handler();
      }, 25);

      my_handler.addHandler('status', v => {
        counter_b += 1;
        if (v === 'ERROR') {
          return true;
        }
        return false;
      });

      chai.expect(counter_a).to.equal(0);
      chai.expect(counter_b).to.equal(0);

      my_handler.event('status', 0);
      chai.expect(counter_a).to.equal(1);
      chai.expect(counter_b).to.equal(1);

      my_handler.event('status', 0);
      chai.expect(counter_a).to.equal(2);
      chai.expect(counter_b).to.equal(2);
    });
  });


  describe('+ events()', () => {
    let handler;

    it('should processing many events at once', () => {
      handler = new UpdateHandler();
      let counter_status = 0;
      let counter_location = 0;

      handler.addHandler('status', v => {
        counter_status += v;
        return false;
      });

      handler.addHandler('location', v => {
        counter_location += v;
        return false;
      });

      chai.expect(counter_status).to.equal(0);
      chai.expect(counter_location).to.equal(0);

      handler.events({ status: 1, location: 1 });

      chai.expect(counter_status).to.equal(1);
      chai.expect(counter_location).to.equal(1);

      handler.events({ status: 5 });

      chai.expect(counter_status).to.equal(6);
      chai.expect(counter_location).to.equal(1);
    });
  });


  describe('+ removeHandler()', () => {
    let handler;

    it('should allow the removal of the given handler', () => {
      handler = new UpdateHandler();
      let counter_status = 0;
      let counter_location = 0;

      const status_handler = handler.addHandler('status', v => {
        counter_status += v;
        return false;
      });

      const location_handler = handler.addHandler('location', v => {
        counter_location += v;
        return false;
      });

      chai.expect(counter_status).to.equal(0);
      chai.expect(counter_location).to.equal(0);

      handler.events({ status: 1, location: 1 });

      chai.expect(counter_status).to.equal(1);
      chai.expect(counter_location).to.equal(1);

      handler.removeHandler('status', status_handler);
      handler.events({ status: 1, location: 1 });

      chai.expect(counter_status).to.equal(1);
      chai.expect(counter_location).to.equal(2);

      handler.removeHandler('location', location_handler);
      handler.events({ status: 1, location: 1 });

      chai.expect(counter_status).to.equal(1);
      chai.expect(counter_location).to.equal(2);
    });
  });
});
