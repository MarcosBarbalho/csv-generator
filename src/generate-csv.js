import { fakerPT_BR as faker } from "@faker-js/faker";
import { cpf, cnpj } from "cpf-cnpj-validator";
import fs from "node:fs";
import path from "node:path";

export const DOCUMENT_TYPES = {
    CPF: "cpf",
    CNPJ: "cnpj",
    RANDOM: "random",
};

export const DEFAULT_FIELDS = [
    "id",
    "name",
    "email",
    "document",
    "document_type",
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

function resolveDocumentType(documentType) {
    if (documentType === DOCUMENT_TYPES.RANDOM) {
        return faker.helpers.arrayElement([DOCUMENT_TYPES.CPF, DOCUMENT_TYPES.CNPJ]);
    }

    return documentType;
}

function generateDocument(documentType, formattedDocument) {
    if (documentType === DOCUMENT_TYPES.CNPJ) {
        return cnpj.generate(formattedDocument);
    }

    return cpf.generate(formattedDocument);
}

function createRegistration({ documentType, formattedDocument }) {
    const resolvedDocumentType = resolveDocumentType(documentType);

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;

    const isCompany = resolvedDocumentType === DOCUMENT_TYPES.CNPJ;

    return {
        id: faker.string.uuid(),
        name: isCompany ? faker.company.name() : fullName,
        email: faker.internet
            .email({
                firstName: isCompany ? faker.company.buzzNoun() : firstName,
                lastName: isCompany ? faker.company.buzzVerb() : lastName,
            })
            .toLowerCase(),
        document: generateDocument(resolvedDocumentType, formattedDocument),
        document_type: resolvedDocumentType,
        phone: faker.phone.number(),
        birth_date: isCompany
            ? ""
            : formatDate(
                  faker.date.birthdate({
                      min: 18,
                      max: 80,
                      mode: "age",
                  }),
              ),
        gender: isCompany ? "" : faker.person.sex(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        neighborhood: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip_code: faker.location.zipCode(),
        country: "Brasil",
        job_title: isCompany ? "" : faker.person.jobTitle(),
        company: isCompany ? faker.company.name() : faker.company.name(),
        created_at: faker.date
            .recent({
                days: 365,
            })
            .toISOString(),
    };
}

function validateOptions({ records, fields, delimiter, documentType }) {
    if (!Number.isInteger(records) || records <= 0) {
        throw new TypeError("The records option must be a positive integer.");
    }

    if (!Array.isArray(fields) || fields.length === 0) {
        throw new TypeError("The fields option must be a non-empty array.");
    }

    if (typeof delimiter !== "string" || delimiter.length !== 1) {
        throw new TypeError("The delimiter option must contain one character.");
    }

    const allowedDocumentTypes = Object.values(DOCUMENT_TYPES);

    if (!allowedDocumentTypes.includes(documentType)) {
        throw new TypeError(`The documentType option must be one of: ${allowedDocumentTypes.join(", ")}.`);
    }
}

export function generateCsv({
    records = 100,
    output = "output/registrations.csv",
    delimiter = ",",
    includeHeader = true,
    formattedDocument = false,
    documentType = DOCUMENT_TYPES.RANDOM,
    fields = DEFAULT_FIELDS,
    encoding = "utf8",
    seed = null,
} = {}) {
    validateOptions({
        records,
        fields,
        delimiter,
        documentType,
    });

    if (seed !== null) {
        faker.seed(seed);
    }

    const sampleRegistration = createRegistration({
        documentType,
        formattedDocument,
    });

    const availableFields = Object.keys(sampleRegistration);

    const invalidFields = fields.filter((field) => !availableFields.includes(field));

    if (invalidFields.length > 0) {
        throw new Error(`Invalid CSV fields: ${invalidFields.join(", ")}`);
    }

    const outputDirectory = path.dirname(output);

    fs.mkdirSync(outputDirectory, {
        recursive: true,
    });

    const rows = [];

    if (includeHeader) {
        rows.push(fields.map((field) => escapeCsvValue(field, delimiter)).join(delimiter));
    }

    for (let index = 0; index < records; index++) {
        const registration = createRegistration({
            documentType,
            formattedDocument,
        });

        const row = fields.map((field) => escapeCsvValue(registration[field], delimiter));

        rows.push(row.join(delimiter));
    }

    fs.writeFileSync(output, `\uFEFF${rows.join("\n")}`, encoding);

    return {
        records,
        output,
        fields,
        documentType,
    };
}
