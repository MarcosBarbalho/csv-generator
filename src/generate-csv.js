import { fakerPT_BR as faker } from "@faker-js/faker";
import { cpf } from "cpf-cnpj-validator";
import fs from "node:fs";

const DEFAULT_FIELDS = [
    "id",
    "name",
    "email",
    "cpf",
    "phone",
    "birth_date",
    "gender",
    "street",
    "number",
    "neighborhood",
    "city",
    "state",
    "zip_code",
    "country",
    "job_title",
    "company",
    "created_at",
];

function escapeCsvValue(value, delimiter) {
    const stringValue = String(value ?? "");

    if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replaceAll('"', '""')}"`;
    }

    return stringValue;
}

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

function createRegistration({ formattedCpf }) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
        id: faker.string.uuid(),
        name: `${firstName} ${lastName}`,
        email: faker.internet
            .email({
                firstName,
                lastName,
            })
            .toLowerCase(),
        cpf: cpf.generate(formattedCpf),
        phone: faker.phone.number(),
        birth_date: formatDate(
            faker.date.birthdate({
                min: 18,
                max: 80,
                mode: "age",
            }),
        ),
        gender: faker.person.sex(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        neighborhood: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip_code: faker.location.zipCode(),
        country: "Brasil",
        job_title: faker.person.jobTitle(),
        company: faker.company.name(),
        created_at: faker.date.recent({ days: 365 }).toISOString(),
    };
}

export function generateCsv({
    records = 100,
    output = process.env.CSV_OUTPUT_DIRECTORY
        ? `${process.env.CSV_OUTPUT_DIRECTORY}/registrations.csv`
        : "output/registrations.csv",
    delimiter = ",",
    includeHeader = true,
    formattedCpf = false,
    fields = DEFAULT_FIELDS,
    encoding = "utf8",
    seed = null,
} = {}) {
    if (!Number.isInteger(records) || records <= 0) {
        throw new TypeError("The records option must be a positive integer.");
    }

    if (!Array.isArray(fields) || fields.length === 0) {
        throw new TypeError("The fields option must be a non-empty array.");
    }

    if (typeof delimiter !== "string" || delimiter.length !== 1) {
        throw new TypeError("The delimiter option must contain one character.");
    }

    if (seed !== null) {
        faker.seed(seed);
    }

    const availableFields = Object.keys(createRegistration({ formattedCpf }));

    const invalidFields = fields.filter((field) => !availableFields.includes(field));

    if (invalidFields.length > 0) {
        throw new Error(`Invalid CSV fields: ${invalidFields.join(", ")}`);
    }

    const rows = [];

    if (includeHeader) {
        rows.push(fields.join(delimiter));
    }

    for (let index = 0; index < records; index++) {
        const registration = createRegistration({ formattedCpf });

        const row = fields.map((field) => escapeCsvValue(registration[field], delimiter));

        rows.push(row.join(delimiter));
    }

    fs.writeFileSync(output, `\uFEFF${rows.join("\n")}`, encoding);

    return {
        records,
        output,
        fields,
    };
}