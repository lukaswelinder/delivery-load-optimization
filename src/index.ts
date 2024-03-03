import { Delivery } from './Delivery';
import { readAndParseProblemFile } from './setup';
import { calculateDistance } from './utils';
import { structureManifest, calculateRoutes } from './optimization';

(async function run() {
  const deliveries = await readAndParseProblemFile(process.argv[2]);
  const deliveryMap = structureManifest(deliveries);
  const routes = calculateRoutes(deliveryMap);
  for (const route of routes) {
    console.log(JSON.stringify(route));
  }
})();
