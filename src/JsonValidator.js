import Ajv from 'ajv';
import { specSchemas } from './JsonSchemas.js';
import addFormats from "ajv-formats";

// compiled cache of all schemas involved in the specs
const compiledSchemas = {};

for (let [version, schemas] of Object.entries(specSchemas)) {
        // we use a different Ajv instance for each version, since
        // Ajv caches our schemas internally and those use the same name
        const validatorAjv = new Ajv({allErrors: true});
        addFormats(validatorAjv);
	for (let [name, schema] of Object.entries(schemas)) {
                validatorAjv.addSchema(schema, name + '.json');
	}
	compiledSchemas[version] = validatorAjv;
}

/**
 * Returns the schema validator for a given version and a type of object.
 */
export const getSchema = (version, schemaName) => {
	let actualVersion = version === null ? '0.1' : version;
	return compiledSchemas[actualVersion].getSchema(schemaName + '.json');
}


