
import { fetchJsonpParams, fetchParams } from './utils.js';

export default class ReconciliationService {
    constructor(endpoint, manifest, cors) {
       this.endpoint = endpoint;
       this.manifest = manifest;
       this.cors = cors;
    }

    getFetcher() {
       return this.cors ? fetchParams : fetchJsonpParams;
    }
}


