/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
	schemaFile: "http://localhost:3001/api/v1/doc-json",
	apiFile: "./feature/api/client/api/api-base.ts",
	apiImport: "api",
	outputFile: "./feature/api/client/api/generated-api.ts",
	exportName: "generatedApi",
	hooks: true,
};

module.exports = config;