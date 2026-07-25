# CSV Generator

A simple Node.js utility for generating realistic CSV files containing fake user registration data. This project is intended for development, testing, load testing, and importing sample data into applications.

## Features

* Generate any number of user registrations
* Realistic Brazilian data using Faker
* Valid CPF generation
* Configurable CSV delimiter
* Optional CSV header
* Formatted or unformatted CPF
* Custom output file
* Customizable exported fields
* Deterministic generation using a seed
* Dockerized development environment

## Generated Fields

By default, each record contains:

| Field          | Description        |
| -------------- | ------------------ |
| `id`           | UUID               |
| `name`         | Full name          |
| `email`        | Email address      |
| `cpf`          | Valid CPF          |
| `phone`        | Phone number       |
| `birth_date`   | Birth date         |
| `gender`       | Gender             |
| `street`       | Street name        |
| `number`       | Building number    |
| `neighborhood` | Neighborhood       |
| `city`         | City               |
| `state`        | State abbreviation |
| `zip_code`     | ZIP Code           |
| `country`      | Country            |
| `job_title`    | Job title          |
| `company`      | Company name       |
| `created_at`   | Registration date  |

---

# Requirements

* Docker
* Docker Compose

Or, alternatively:

* Node.js 20+
* npm

---

# Running with Docker

Start the development container:

```bash
docker compose up -d
```

Generate a CSV with 1,000 records:

```bash
docker compose exec app npm run generate -- 1000
```

The generated file will be available inside the `output/` directory.

Stop the environment:

```bash
docker compose down
```

---

# Local Installation

Install dependencies:

```bash
npm install
```

Generate a CSV:

```bash
npm run generate -- 1000
```

---

# Configuration

The generator accepts the following options:

| Option          | Default                    | Description                   |
| --------------- | -------------------------- | ----------------------------- |
| `records`       | `100`                      | Number of records to generate |
| `output`        | `output/registrations.csv` | Output file                   |
| `delimiter`     | `,`                        | CSV delimiter                 |
| `includeHeader` | `true`                     | Include header row            |
| `formattedCpf`  | `false`                    | Generate formatted CPF        |
| `fields`        | All fields                 | Columns to export             |
| `encoding`      | `utf8`                     | File encoding                 |
| `seed`          | `null`                     | Deterministic data generation |

Example:

```javascript
generateCsv({
    records: 5000,
    output: 'output/users.csv',
    delimiter: ';',
    formattedCpf: true,
    seed: 1234,
});
```

---

# Custom Fields

You can export only the columns you need.

Example:

```javascript
generateCsv({
    records: 1000,
    fields: [
        'name',
        'email',
        'cpf',
        'phone',
        'city',
        'state',
    ],
});
```

---

# Project Structure

```text
.
├── docker-compose.yml
├── package.json
├── output/
└── src/
    ├── generate-csv.js
    └── index.js
```

---

# Main Dependencies

* **@faker-js/faker** — Generates realistic fake data
* **cpf-cnpj-validator** — Generates and validates Brazilian CPF numbers

---

# Use Cases

* API testing
* Import testing
* Performance testing
* Database seeding
* QA environments
* Development environments
* Demonstrations

---

# License

This project is available under the MIT License.
