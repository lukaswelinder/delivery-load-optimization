import type { Coordinate } from './types';
import { HUB_ORIGIN } from './constants';
import { calculateDistance } from './utils';

/**
 * Represents a delivery and defines some basic metadata for use
 * in calculating optimal routes.
 */
export class Delivery {
  public distance: number;
  public startDistance: number;
  public endDistance: number;
  public nearestFollowups: Delivery[] = [];
  public followupDistanceMap: Map<number, number> = new Map();

  constructor(
    public id: number,
    public pickup: Coordinate,
    public dropoff: Coordinate,
  ) {
    const x1 = pickup[0];
    const y1 = pickup[1];
    const x2 = dropoff[0];
    const y2 = dropoff[1];
    this.distance = calculateDistance(pickup, dropoff);
    this.startDistance = calculateDistance(HUB_ORIGIN, pickup);
    this.endDistance = calculateDistance(dropoff, HUB_ORIGIN);
  }
}
