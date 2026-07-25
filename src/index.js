import { Command } from "commander";
import { generateCsv } from "./generate-csv.js";

const program = new Command();

program
    .name("csv-generator")
    .description("Generate fake registration CSV files")
    .option("-r, --records <number>", "Number of records", "100")
    .option("-o, --output <path>", "Output file", "output/registrations.csv")
    .option("-d, --delimiter <char>", "CSV delimiter", ",")
    .option("--formatted-cpf", "Generate formatted CPF")
    .option("--no-header", "Do not include header")
    .option("--seed <number>", "Seed for deterministic generation")
    .parse();

const options = program.opts();

generateCsv({
    records: Number(options.records),
    output: options.output,
    delimiter: options.delimiter,
    includeHeader: options.header,
    formattedCpf: options.formattedCpf,
    seed: options.seed ? Number(options.seed) : null,
});
