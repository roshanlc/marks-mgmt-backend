# INTERNAL EXAMINATION RECORDS - BACKEND

The backend server for the internal exmaination records management system.

## _Note: Donot merge with main. All development works should be merged to this `development` branch_

This is the development branch. Create new branches from this one and merge to this after completion.

## Initial Setup dependencies

1. Install prettier and eslint extension in VSCode
2. Install pnpm with `npm install -g pnpm`
3. Run the following commands

```bash
pnpm add express
pnpm add eslint --save-dev
pnpm add -D nodemon
pnpm exec eslint --init
pnpm add prisma --save-dev
pnpm exec prisma init --datasource-provider postgresql
pnpm add swagger-jsdoc --save
pnpm add swagger-ui-express --save

```

### Run

- Run
  ```bash
  cp .env.example .env
  ```
  and edit `.env` with necessary details
- Install dependencies
  ```bash
  pnpm install --frozen-lockfile
  ```
- To run locally
  ```bash
  pnpm run dev
  ```

### Swagger documentation

- The swagger ui is available from `/docs` endpoint

### Setting up Prisma

1. Update the `prisma/schema.prisma` file as necessary
2. Run `pnpm exec prisma migrate dev`
   - This will update database and generate prisma client
3. For more details :
   - Visit prisma's website https://www.prisma.io/docs
   - Or, run `pnpm exec prisma help`

### Directory Structure

- A basic project structure
- Subject to change over time

```
.
└── src
    ├── db -> Where the db related files will be stored
    ├── index.js -> entry point for the node
    ├── middlewares -> Where the middlewares will stored
    └── routes -> Where the routes will be stored

```

### Postgres Setup

1. Install `docker` on your machine
2. Pull `postgres` image

```bash
docker pull postgres:latest
```

3. Run the following command

```bash
docker run --name psql-dev \
-e POSTGRES_PASSWORD=test1234 \
-p 5432:5432 postgres
```

- This will start a postgres instance at TCP port 5432 with username `postgres` and password `test1234`

4. You can access the postgres acces as such

```bash
docker exec -it psql-dev bash
psql -h localhost -U postgres
```

5. From next time, just run `docker start psql-dev` to start the container
