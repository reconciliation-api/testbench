
import { fetchJsonpParams, fetchParams , postParams , postJsonpParams } from './utils.js';
import { specVersions } from './JsonSchemas.js';
import { getSchema } from './JsonValidator.js';

export default class ReconciliationService {
    constructor(endpoint, manifest, cors) {
       this.endpoint = endpoint;
       this.manifest = manifest;
       this.cors = cors;

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
       return this.cors ? fetchParams : fetchJsonpParams;
    }
    
    postFetcher() {
      return this.cors ? postParams : postJsonpParams;
   }
}


