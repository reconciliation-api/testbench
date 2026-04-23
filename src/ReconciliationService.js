
import { fetchParams, postParams } from './utils.js';
import { specVersions } from './JsonSchemas.js';
import { getSchema } from './JsonValidator.js';

export default class ReconciliationService {
    constructor(endpoint, manifest) {
       this.endpoint = endpoint;
       this.manifest = manifest;

       // test the service's manifest against manifest schemas
       // for all known versions of the specs, in order.
       this.latestCompatibleVersion = null;
       for (var version of specVersions) {
	   let schema = getSchema(version, 'manifest');
	   let valid = schema(manifest);
	   if (valid) {
		this.latestCompatibleVersion = version;
           }
       }
    }

    getFetcher() {
       return fetchParams;
    }

    postFetcher() {
      return postParams;
   }
}


