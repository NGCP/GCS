import { locationConfig } from '../../static/index';

import ipc from '../../util/ipc';

const { lat, lng } = locationConfig.startLocation;

const boundingBox = {
  name: 'Test Bounding Box',
  color: 'red',
  bounds: {
    top: lat,
    bottom: lat - 0.001,
    left: lng - 0.001,
    right: lng,
  },
};

ipc.postUpdateBoundingBoxes(boundingBox);
