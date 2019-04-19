/*
 * This fixture bypasses the MessageHandler, and interacts directly with the Orchestrator
 * to add vehicles and post update messages about them.
 *
 * In a real field test, all messages are sent through the MessageHandler (as it is received
 * on an Xbee).
 */

import { JobType, locationConfig } from '../../static/index';

import * as Message from '../../types/message';
import { VehicleStatus } from '../../types/vehicle';

import ipc from '../../util/ipc';

interface Fixture {
  sid: number;
  jobs: JobType[];
  lat: number;
  lng: number;
}

const fixtureOptions: { sid: number; jobs: JobType[] }[] = [
  {
    sid: 100,
    jobs: ['isrSearch', 'payloadDrop'],
  },
  {
    sid: 200,
    jobs: ['ugvRescue'],
  },
  {
    sid: 300,
    jobs: ['uuvRescue'],
  },
  {
    sid: 400,
    jobs: ['quickScan'],
  },
  {
    sid: 401,
    jobs: ['detailedSearch'],
  },
  {
    sid: 500,
    jobs: [],
  },
  {
    sid: 600,
    jobs: [],
  },
];

let fixtures: Fixture[] = fixtureOptions.map(
  (fixtureOption): Fixture => ({ ...fixtureOption, ...locationConfig.startLocation }),
);

const status: VehicleStatus[] = ['ready', 'waiting', 'paused', 'running', 'error'];

let messageId = 0;

function generateJSONMessage(vehicleId: number, message: Message.Message): Message.JSONMessage {
  const jsonMessage = {
    id: messageId,
    sid: vehicleId,
    tid: 0,
    time: Date.now(),
    ...message,
  };

  messageId += 1;
  return jsonMessage;
}

function randomCoordinate(location: { lat: number; lng: number }): { lat: number; lng: number } {
  return {
    lat: location.lat + (Math.random() / 5000) - 0.0001,
    lng: location.lng + (Math.random() / 5000) - 0.0001,
  };
}

function connectVehicles(): void {
  fixtures.forEach((fixture): void => {
    ipc.postConnectToVehicle(generateJSONMessage(fixture.sid, {
      type: 'connect',
      jobsAvailable: fixture.jobs,
    }));
  });
}

function updateVehicles(): void {
  fixtures = fixtures.map(
    (fixture): Fixture => ({ ...fixture, ...randomCoordinate(fixture) }),
  );

  fixtures.forEach((fixture): void => {
    ipc.postHandleUpdateMessage(generateJSONMessage(fixture.sid, {
      type: 'update',
      lat: fixture.lat,
      lng: fixture.lng,
      status: status[Math.floor(Math.random() * status.length)],
    }));
  });
}

connectVehicles();
setInterval((): void => { updateVehicles(); }, 1000);
