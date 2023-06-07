# INTERNAL EXAMINATION RECORDS - BACKEND

The backend server for the internal exmaination records management system.

## _Note: Donot merge with main. All development works should be merged to this `development` branch_

> This is the development branch. Create new branches from this one and merge to this after completion.
> `main` branch is used for pushing codes to hosting ,i.e `production`

### Necessary Tools

Make sure you have the following tools installed on your machine

- Docker
- Postman
- Node
- Pnpm
- Vscode (extensions: Prettier, Prisma, Eslint, GitLens)

### Run

- Run
  ```bash
  cp .env.example .env
  ```
  > and edit `.env` file with required details (JWT_SECRET, DATABASE_URL,...)
- Install dependencies
  ```bash
  npm install -g pnpm && pnpm install
  ```
- To setup database connection
  ```bash
  pnpm exec prisma migrate dev
  ```
- To run locally
  ```bash
  pnpm run dev
  ```

### Setting up Prisma (When you update schema)

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
    └── routes -> Where the routes(controllers) will be stored

```

### Postgres Setup

- Method - 1

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

> This will start a postgres instance at TCP port 5432 with username `postgres` and password `test1234`

4. You can access the postgres acces as such

```bash
docker exec -it psql-dev bash
psql -h localhost -U postgres
```

5. From next time, just run `docker start psql-dev` to start the container

- Method-2

1. Use the `aiven.io` postgres setup

### Coding Guidelines

1. Explicitly define response's `status code`
2. Explicit `return` after sending response
3. Explicitly set return `content-type`

```js
res
  .status(401)
  .json(
    errorResponse(
      "Authentication Error",
      "Please provide valid login credentials."
    )
  )
return
```

4. Explicity set request body `content-type`
5. A database helper function should return with `toResult()` function

## API Documentation (Donot worry about this)

- The swagger ui is available from `/docs` endpoint

- We will be using Postman for openapi specs generation
- Save the specs to `/src/swagger/swagger-output.json`
- Use the specs to generate swagger ui
  _Note: However provide enough comments about endpoint in source files as well_
