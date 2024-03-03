import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { URL } from 'url';

const HUB_ORIGIN = [0, 0];

function calculateDistance(start, end) {
  return Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2),
  );
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value,
      })
    : (obj[key] = value);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== 'symbol' ? key + '' : key, value);
  return value;
};
class Delivery {
  constructor(id, pickup, dropoff) {
    this.id = id;
    this.pickup = pickup;
    this.dropoff = dropoff;
    __publicField(this, 'distance');
    __publicField(this, 'startDistance');
    __publicField(this, 'endDistance');
    __publicField(this, 'nearestFollowups', []);
    __publicField(this, 'followupDistanceMap', /* @__PURE__ */ new Map());
    pickup[0];
    pickup[1];
    dropoff[0];
    dropoff[1];
    this.distance = calculateDistance(pickup, dropoff);
    this.startDistance = calculateDistance(HUB_ORIGIN, pickup);
    this.endDistance = calculateDistance(dropoff, HUB_ORIGIN);
  }
}

const __dirname = new URL('.', import.meta.url).pathname;
const problemLinePattern =
  /^(\d+)\s+\((-?\d+\.\d+),(-?\d+\.\d+)\)\s\((-?\d+\.\d+),(-?\d+\.\d+)\)$/;
async function readAndParseProblemFile(problemFile) {
  const filePath = join(__dirname, '../', problemFile);
  const fileContents = await readFile(filePath, 'utf-8');
  const fileLines = fileContents.split('\n');
  const result = [];
  for (let i = 1; i < fileLines.length; i++) {
    const line = fileLines[i];
    if (!line) {
      continue;
    }
    const lineMatch = problemLinePattern.exec(line);
    if (!lineMatch) {
      throw new Error('Invalid input format.');
    }
    const id = +lineMatch[1];
    const pickup = [+lineMatch[2], +lineMatch[3]];
    const dropoff = [+lineMatch[4], +lineMatch[5]];
    result.push([id, new Delivery(id, pickup, dropoff)]);
  }
  return result;
}

function structureManifest(deliveries) {
  deliveries.sort((a, b) => {
    if (a[1].startDistance > b[1].startDistance) {
      return 1;
    } else if (a[1].startDistance < b[1].startDistance) {
      return -1;
    }
    return 0;
  });
  const deliveryMap = new Map(deliveries);
  const deliveryValues = [...deliveryMap.values()];
  for (const delivery of deliveryValues) {
    for (const followup of deliveryValues) {
      delivery.followupDistanceMap.set(
        followup.id,
        calculateDistance(delivery.dropoff, followup.pickup),
      );
    }
    delivery.nearestFollowups = deliveryValues.slice().sort((a, b) => {
      const aDistance = delivery.followupDistanceMap.get(a.id);
      const bDistance = delivery.followupDistanceMap.get(b.id);
      if (aDistance > bDistance) {
        return 1;
      } else if (aDistance < bDistance) {
        return -1;
      }
      return 0;
    });
  }
  return deliveryMap;
}
function calculateRoutes(deliveryMap) {
  const routes = [];
  function calculateRoute(route, lastDelivery, baseDistance) {
    for (const followup of lastDelivery.nearestFollowups) {
      if (deliveryMap.has(followup.id)) {
        const followupBaseDistance =
          lastDelivery.followupDistanceMap.get(followup.id) + followup.distance;
        if (
          baseDistance + followupBaseDistance + followup.endDistance <
          12 * 60
        ) {
          deliveryMap.delete(followup.id);
          route.push(followup.id);
          return calculateRoute(
            route,
            followup,
            baseDistance + followupBaseDistance,
          );
        }
      }
    }
    return route;
  }
  for (const [id, delivery] of deliveryMap) {
    deliveryMap.delete(id);
    let distance = delivery.startDistance + delivery.distance;
    const route = calculateRoute([id], delivery, distance);
    routes.push(route);
  }
  return routes;
}

(async function run() {
  const deliveries = await readAndParseProblemFile(process.argv[2]);
  const deliveryMap = structureManifest(deliveries);
  const routes = calculateRoutes(deliveryMap);
  for (const route of routes) {
    console.log(JSON.stringify(route));
  }
})();
