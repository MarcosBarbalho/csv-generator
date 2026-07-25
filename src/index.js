import { Command, Option } from "commander";
import { DEFAULT_FIELDS, DOCUMENT_TYPES, generateCsv } from "./generate-csv.js";

const program = new Command();

program
    .name("csv-generator")
    .description("Generate fake registration CSV files")
    .option("-r, --records <number>", "Number of records", "100")
    .option("-o, --output <path>", "Output file", "output/registrations.csv")
    .option("-d, --delimiter <character>", "CSV delimiter", ",")
    .option("--formatted-document", "Generate formatted CPF or CNPJ", false)
    .option("--no-header", "Do not include the CSV header")
    .option("--seed <number>", "Seed for deterministic generation")
    .option("--fields <fields>", `Comma-separated list of fields.\nAvailable: ${DEFAULT_FIELDS.join(", ")}`)
    .addOption(
        new Option("--document-type <type>", "Document type to generate")
            .choices(Object.values(DOCUMENT_TYPES))
            .default(DOCUMENT_TYPES.RANDOM),
    )
    .parse();

const options = program.opts();

const records = Number.parseInt(options.records, 10);

if (!Number.isInteger(records) || records <= 0) {
    program.error("The --records option must be a positive integer.");
}

const seed = options.seed === undefined ? null : Number.parseInt(options.seed, 10);

if (options.seed !== undefined && Number.isNaN(seed)) {
    program.error("The --seed option must be an integer.");
}

const fields = options.fields
    ? options.fields
          .split(",")
          .map((field) => field.trim())
          .filter(Boolean)
    : DEFAULT_FIELDS;

const invalidFields = fields.filter((field) => !DEFAULT_FIELDS.includes(field));

if (invalidFields.length > 0) {
    program.error(`Invalid fields: ${invalidFields.join(", ")}.\nAvailable fields: ${DEFAULT_FIELDS.join(", ")}`);
}

const result = generateCsv({
    records,
    output: options.output,
    delimiter: options.delimiter,
    includeHeader: options.header,
    formattedDocument: options.formattedDocument,
    documentType: options.documentType,
    fields,
    seed,
});

console.log(`Generated ${result.records} registrations in ${result.output}.`);
