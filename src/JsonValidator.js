import Ajv from 'ajv';
import { specSchemas } from './JsonSchemas.js';


const validatorAjv = new Ajv({allErrors: true});

// compiled cache of all schemas involved in the specs
const compiledSchemas = {};

for (let [version, schemas] of Object.entries(specSchemas)) {
	let compiled = {};
	for (let [name, schema] of Object.entries(schemas)) {
		compiled[name] = validatorAjv.compile(schema);
	}
	compiledSchemas[version] = compiled;
}

/**
 * Returns the schema validator for a given version and a type of object.
 */
export const getSchema = (version, schemaName) => {
	let actualVersion = version === null ? '0.1' : version;
	return compiledSchemas[actualVersion][schemaName];
}


