import { generateCsv } from './generate-csv.js';

const records = Number.parseInt(process.argv[2] ?? '100', 10);

generateCsv({
    records,
    output: `output/registrations-${records}.csv`,
    delimiter: ';',
    formattedCpf: true,
});

console.log(`Generated ${records} registrations.`);