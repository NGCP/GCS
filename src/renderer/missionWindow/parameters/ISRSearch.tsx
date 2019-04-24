import { Event, ipcRenderer } from 'electron';
import React, { Component, ReactNode } from 'react';

import { missionName, jobTypes } from '../../../common/missions/ISRSearch';

import { Location } from '../../../static/index';

import { ISRSearchInformation } from '../../../types/missionInformation';
import { VehicleObject } from '../../../types/vehicle';

import ipc from '../../../util/ipc';

export const name = 'ISR Search';

const information: ISRSearchInformation = {
  missionName: 'isrSearch',
  parameters: {
    takeoff: {
      lat: 0,
      lng: 0,
      alt: 0,
      loiter: {
        lat: 0,
        lng: 0,
        alt: 0,
        radius: 0,
        direction: 0,
      },
    },
    isrSearch: {
      alt: 0,
      waypoints: [
        {
          lat: 0,
          lng: 0,
        },
        {
          lat: 0,
          lng: 0,
        },
        {
          lat: 0,
          lng: 0,
        },
      ],
    },
    land: {
      waypoints: [
        {
          lat: 0,
          lng: 0,
          alt: 0,
        },
        {
          lat: 0,
          lng: 0,
          alt: 0,
        },
      ],
    },
  },
  // TODO: Move options as a separate entity for Orchestrator to take to make Mission UI easier.
  options: {
    noTakeoff: false,
    noLand: false,
  },
};

const checklist: { [check: string]: number | undefined } = {
  // Parameter checks.
  takeoffLat: undefined,
  takeoffLng: undefined,
  takeoffAlt: undefined,
  loiterLat: undefined,
  loiterLng: undefined,
  loiterRadius: undefined,
  loiterDirection: undefined,
  isrSearchAlt: undefined,
  isrSearchLat1: undefined,
  isrSearchLng1: undefined,
  isrSearchLat2: undefined,
  isrSearchLng2: undefined,
  isrSearchLat3: undefined,
  isrSearchLng3: undefined,
  landLat1: undefined,
  landLng1: undefined,
  landAlt1: undefined,
  landLat2: undefined,
  landLng2: undefined,
  landAlt2: undefined,
};

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ISRSearchProps {
  vehicles: { [vehicleId: number]: VehicleObject };
}

export class ISRSearch extends Component<ISRSearchProps> {
  private static onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    ISRSearch.updateChecklist({
      [event.target.name]: parseInt(event.target.value, 10),
    });
  }

  private static updateWaypoints(...waypoints: { name: string; location: Location }[]): void {
    const checks: { [checkName: string]: number } = {};

    waypoints.forEach((waypoint): void => {
      switch (waypoint.name) {
        case 'Takeoff':
          checks.takeoffLat = waypoint.location.lat;
          checks.takeoffLng = waypoint.location.lng;
          break;

        case 'Loiter':
          checks.loiterLat = waypoint.location.lat;
          checks.loiterLng = waypoint.location.lng;
          break;

        case 'ISR Search 1':
          checks.isrSearchLat1 = waypoint.location.lat;
          checks.isrSearchLng1 = waypoint.location.lng;
          break;

        case 'ISR Search 2':
          checks.isrSearchLat2 = waypoint.location.lat;
          checks.isrSearchLng2 = waypoint.location.lng;
          break;

        case 'ISR Search 3':
          checks.isrSearchLat3 = waypoint.location.lat;
          checks.isrSearchLng4 = waypoint.location.lng;
          break;

        case 'Land 1':
          checks.landLat1 = waypoint.location.lat;
          checks.landLng1 = waypoint.location.lng;
          break;

        case 'Land 2':
          checks.landLat2 = waypoint.location.lat;
          checks.landLng2 = waypoint.location.lng;
          break;

        default: break;
      }
    });

    ISRSearch.updateChecklist(checks);
  }

  private static updateChecklist(checks: { [checkName: string]: number }): void {
    Object.keys(checks).forEach((checkName): void => {
      const value = checks[checkName];
      /*
       * Following check is to ensure that we have all the "name" fields in the
       * form correctly put in. Delete the following check when we ensure it works.
       */
      if (!(checkName in checklist)) {
        throw new RangeError('Wrong value provided');
      }

      checklist[checkName] = value;
    });

    if (ISRSearch.isReadyToStart) {
      ipc.postUpdateInformation(information);
    }
  }

  private static isReadyToStart(): boolean {
    return Object.values(checklist).every((value): boolean => value !== undefined);
  }

  private static onClickTakeoff(): void {
    ipc.postCreateWaypoints({ name: 'Takeoff' });
  }

  private static onClickLoiter(): void {
    ipc.postCreateWaypoints({ name: 'Loiter' });
  }

  private static onClickSearch1(): void {
    ipc.postCreateWaypoints({ name: 'ISR Search 1' });
  }

  private static onClickSearch2(): void {
    ipc.postCreateWaypoints({ name: 'ISR Search 2' });
  }

  private static onClickSearch3(): void {
    ipc.postCreateWaypoints({ name: 'ISR Search 3' });
  }

  private static onClickLand1(): void {
    ipc.postCreateWaypoints({ name: 'Land 1' });
  }

  private static onClickLand2(): void {
    ipc.postCreateWaypoints({ name: 'Land 2' });
  }

  public componentDidMount(): void {
    ipcRenderer.on('updateWaypoints', (__: Event, _: boolean, ...waypoints: { name: string; location: Location }[]): void => ISRSearch.updateWaypoints(...waypoints));
  }

  public render(): ReactNode {
    const { parameters } = information;

    return (
      <div>
        <h2>ISR Search</h2>

        <p>Takeoff Coordinates</p>
        <input type="number" name="takeoffLat" placeholder="Latitude" value={checklist.takeoffLat && parameters.takeoff.lat} onChange={ISRSearch.onChange} />
        <input type="number" name="takeoffLng" placeholder="Longitude" value={checklist.takeoffLng && parameters.takeoff.lng} onChange={ISRSearch.onChange} />
        <button type="button" onClick={ISRSearch.onClickTakeoff}>Create Pin</button>
        <br />
        <input type="number" name="takeoffAlt" placeholder="Altitude" value={checklist.takeoffAlt && parameters.takeoff.alt} onChange={ISRSearch.onChange} />

        <p>Loiter Coordinates</p>
        <input type="number" name="loiterLat" placeholder="Latitude" value={checklist.loiterLat && parameters.takeoff.loiter.lat} onChange={ISRSearch.onChange} />
        <input type="number" name="loiterLng" placeholder="Longitude" value={checklist.loiterLng && parameters.takeoff.loiter.lng} onChange={ISRSearch.onChange} />
        <button type="button" onClick={ISRSearch.onClickLoiter}>Create Pin</button>
        <br />
        <input type="number" name="loiterAlt" placeholder="Altitude" value={checklist.loiterAlt && parameters.takeoff.loiter.alt} onChange={ISRSearch.onChange} />
        <input type="number" name="loiterRadius" placeholder="Radius" value={checklist.loiterRadius && parameters.takeoff.loiter.radius} onChange={ISRSearch.onChange} />
        <input type="number" name="loiterDirection" placeholder="Direction" value={checklist.loiterDirection && parameters.takeoff.loiter.direction} onChange={ISRSearch.onChange} />

        <p>ISR Search Waypoints</p>
        <input type="number" id="isrSearchLat1" placeholder="Latitude" value={checklist.isrSearchLat1 && parameters.isrSearch.waypoints[0].lat} onChange={ISRSearch.onChange} />
        <input type="number" id="isrSearchLng1" placeholder="Longitude" value={checklist.isrSearchLng1 && parameters.isrSearch.waypoints[0].lng} onChange={ISRSearch.onChange} />
        <button type="button" onClick={ISRSearch.onClickSearch1}>Create Pin</button>
        <br />
        <input type="number" id="isrSearchLat2" placeholder="Latitude" value={checklist.isrSearchLat2 && parameters.isrSearch.waypoints[1].lat} onChange={ISRSearch.onChange} />
        <input type="number" id="isrSearchLng2" placeholder="Longitude" value={checklist.isrSearchLng2 && parameters.isrSearch.waypoints[1].lng} onChange={ISRSearch.onChange} />
        <button type="button" onClick={ISRSearch.onClickSearch2}>Create Pin</button>
        <br />
        <input type="number" id="isrSearchLat3" placeholder="Latitude" value={checklist.isrSearchLat3 && parameters.isrSearch.waypoints[2].lat} onChange={ISRSearch.onChange} />
        <input type="number" id="isrSearchLng3" placeholder="Longitude" value={checklist.isrSearchLng3 && parameters.isrSearch.waypoints[2].lng} onChange={ISRSearch.onChange} />
        <button type="button" onClick={ISRSearch.onClickSearch3}>Create Pin</button>
        <br />
        <input type="number" name="isrSearchAlt" placeholder="Altitude" value={checklist.isrSearchAlt && parameters.isrSearch.alt} onChange={ISRSearch.onChange} />

        <p>Land Waypoints</p>
        <input type="number" id="landLat1" placeholder="Latitude" value={checklist.landLat1 && parameters.land.waypoints[0].lat} onChange={ISRSearch.onChange} />
        <input type="number" id="landLng1" placeholder="Longitude" value={checklist.landLng1 && parameters.land.waypoints[0].lng} onChange={ISRSearch.onChange} />
        <button type="button" onClick={ISRSearch.onClickLand1}>Create Pin</button>
        <br />
        <input type="number" name="landAlt1" placeholder="Altitude" value={checklist.landAlt1 && parameters.land.waypoints[0].alt} onChange={ISRSearch.onChange} />
        <br />
        <input type="number" id="landLat1" placeholder="Latitude" value={checklist.landLat1 && parameters.land.waypoints[1].lat} onChange={ISRSearch.onChange} />
        <input type="number" id="landLng1" placeholder="Longitude" value={checklist.landLng1 && parameters.land.waypoints[1].lng} onChange={ISRSearch.onChange} />
        <button type="button" onClick={ISRSearch.onClickLand2}>Create Pin</button>
        <br />
        <input type="number" name="landAlt1" placeholder="Altitude" value={checklist.landAlt1 && parameters.land.waypoints[1].alt} onChange={ISRSearch.onChange} />

        <br />

        <label htmlFor="takeoffbox">
          <input type="checkbox" id="takeoffbox" name="takeoff" />
          {'Do not takeoff'}
        </label>
        <br />
        <label htmlFor="landbox">
          <input type="checkbox" id="landbox" name="landbox" />
          {'Do not land after mission'}
        </label>
      </div>
    );
  }
}

export default {
  name,
  missionName,
  jobTypes,
  layout: ISRSearch as React.ElementType,
};
