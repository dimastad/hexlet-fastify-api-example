types-to-openapi:
	npx tsp compile .

types-to-typebox:
	npx @geut/openapi-box openapi.json

types: types-to-openapi types-to-typebox