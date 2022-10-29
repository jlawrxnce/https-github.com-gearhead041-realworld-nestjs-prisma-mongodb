# ![RealWorld Example App](logo.png)

> ### Nestjs codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.


### [Demo](https://demo.realworld.io/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)


This codebase was created to demonstrate a fully fledged fullstack application built with Nestjs including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the Nestjscommunity styleguides & best practices.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.


# How it works
This implementation works with nestjs connected to a mongodb database running as a replica set. The database transactions are carried out with prisma as a orm.
# Getting started
To run locally ensure mongodb is installed on your system and a mongod process is running as a replication set.
To start a mongod process as a replication set look [here](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/)
## Installation

```bash
$ npm install
```

## Running the app
In a different console
```bash
mongod --replSet rs0
```
In a different console
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

