import { locationConfig } from '../../static/index';

import ipc from '../../util/ipc';

const { lat, lng } = locationConfig.startLocation;

const boundingBox = {
  name: 'Test Bounding Box',
  color: 'blue',
  bounds: {
    top: lat,
    bottom: lat - 0.001,
    left: lng - 0.001,
    right: lng,
  },
};

ipc.postCreateBoundingBoxes(boundingBox);
