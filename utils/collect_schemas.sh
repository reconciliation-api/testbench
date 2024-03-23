#!/bin/bash

# Script to collect schemas from a version of the specs and join them into
# one big JSON object, which can be included in the sources of the testbench
# for validation purposes.


# Path to a local clone of the specs repository
path_to_specs_repository=$1
# Path to a file listing on each line a version for which the schemas should be included
path_to_versions=$2

echo "// This file was automatically generated by utils/collect_schemas.sh"
echo "// The schemas are stored in the reconciliation-api/specs repository."
echo "// If any changes to the schema should be made, please do it there instead!"
echo "// Any local changes will be overridden by the next update."

echo ""

echo "export const specVersions = ["
for version in `cat $path_to_versions`; do
	echo "\"$version\","
done;
echo "];"

echo ""

echo "export const specSchemas = {"
for version in `cat $path_to_versions`; do
	path_to_schemas="$path_to_specs_repository/$version/schemas"
	echo "\"$version\": {"
	for fname in `ls $path_to_schemas`; do
		schema_name=`echo $fname | sed -e 's/\.json$//'`;
		echo "\"$schema_name\":"
		cat "$path_to_schemas/$fname"
		echo ","
	done
	echo "},"
done
echo "};"