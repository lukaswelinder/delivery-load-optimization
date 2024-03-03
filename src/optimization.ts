import type { Route } from './types';
import { Delivery } from './Delivery';
import { calculateDistance } from './utils';

/**
 * This is an expensive function. It sorts deliveries by proxemity to the hub origin,
 * then for each delivery creates a proximity map and a list of other deliveries
 * sorted by proximity.
 *
 * @param deliveries Accepts an array of delivery entries.
 * @returns A map of processed deliveries indexed by `delivery.id`.
 */
export function structureManifest(
  deliveries: [id: number, Delivery][],
): Map<number, Delivery> {
  // Sort deliveries by distance to start point from hub origin
  deliveries.sort((a, b) => {
    if (a[1].startDistance > b[1].startDistance) {
      return 1;
    } else if (a[1].startDistance < b[1].startDistance) {
      return -1;
    }
    return 0;
  });
  // Store deliveries keyed by `id` in a map to simplify route generation
  const deliveryMap = new Map(deliveries);
  // Make array of deliveries for performance and code clarity
  const deliveryValues = [...deliveryMap.values()];
  for (const delivery of deliveryValues) {
    // Pre-calculate followup distances
    for (const followup of deliveryValues) {
      delivery.followupDistanceMap.set(
        followup.id,
        calculateDistance(delivery.dropoff, followup.pickup),
      );
    }
    // Generate list of followup deliveries sorted by distance to pickup from dropoff
    delivery.nearestFollowups = deliveryValues.slice().sort((a, b) => {
      const aDistance = delivery.followupDistanceMap.get(a.id) as number;
      const bDistance = delivery.followupDistanceMap.get(b.id) as number;
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

/**
 * Uses the delivery map to recursively calculate delivery routes.
 *
 * @param deliveryMap Delivery map to be used to create delivery routes.
 * @returns List of delivery routes.
 */
export function calculateRoutes(deliveryMap: Map<number, Delivery>): Route[] {
  const routes: Route[] = [];
  // Recursion for graph/node pathfinding makes for less cognitive load
  /**
   * Recurses a path through deliveries to construct an optimal route.
   * Recursion reduces cognitive load when graph pathfinding.
   *
   * @param route Route being calculated (will be mutated).
   * @param lastDelivery Reference to the last delivery; used to consider/recurse into followups.
   * @param baseDistance Calculated distance of the route being calculated.
   * @returns The calculated route (note that initially provided route param is mutated).
   */
  function calculateRoute(
    route: Route,
    lastDelivery: Delivery,
    baseDistance: number,
  ) {
    for (const followup of lastDelivery.nearestFollowups) {
      // Ignore allocated loads
      if (deliveryMap.has(followup.id)) {
        const followupBaseDistance =
          (lastDelivery.followupDistanceMap.get(followup.id) as number) +
          followup.distance;
        if (
          baseDistance + followupBaseDistance + followup.endDistance <
          12 * 60
        ) {
          // Remove load from available pool
          deliveryMap.delete(followup.id);
          route.push(followup.id);
          // Continue building route if possible
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
    // Remove load from avialable pool
    deliveryMap.delete(id);
    let distance = delivery.startDistance + delivery.distance;
    // Per instructions, assumes all routes are viable
    const route = calculateRoute([id], delivery, distance);
    routes.push(route);
  }
  return routes;
}
