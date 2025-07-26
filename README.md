# Mass vs. Crew - Backend API

A Star Wars-themed GraphQL API built with NestJS, TypeORM, and PostgreSQL.

## 📖 Table of Contents

- [🌟 Features](#🌟-features)
- [🚀 Quick Start](#🚀-quick-start)
- [🔧 Configuration](#🔧-configuration)
- [📊 API Overview](#📊-api-overview)
- [📝 Data Schema](#📝-data-schema)
- [🧪 Testing](#🧪-testing)
- [👤 Author](#👤-author)

## 🌟 Features

- **GraphQL API** with Apollo Server
- **Star Wars Data** - 15 characters and 15 starships
- **Random Selection** - Get random pairs of characters/starships
- **Comparable Data** - All entities include numerical fields (mass, height, crew, length)
- **Full CRUD** - Create, read, update, delete entities
- **Pagination** - Efficient data loading
- **TypeScript** - Full type safety
- **Comprehensive Tests** - Unit, integration, and E2E

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone and setup**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   npm install
   ```

2. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work with Docker)
   ```

3. **Start database**

   ```bash
   npm run docker:up
   ```

4. **Seed data**

   ```bash
   npm run seed
   ```

5. **Start development server**
   ```bash
   npm run start:dev
   ```

🎉 **Ready!** GraphQL Playground: http://localhost:3000/graphql

## 🔧 Configuration

### Environment Variables (.env)

```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=mass_vs_crew
PORT=3000
```

## 📊 API Overview

### People Queries

```graphql
# Get paginated people
getPeople(page: 1, limit: 10)

# Get person by ID
getPeopleById(id: 1)

# Get two random people
getTwoRandomPeople
```

### Starship Queries

```graphql
# Get paginated starships
getStarships(page: 1, limit: 10)

# Get starship by ID
getStarshipById(id: 1)

# Get two random starships
getTwoRandomStarships
```

### Random Data Example

```graphql
query GetRandomData {
  people: getTwoRandomPeople {
    id
    name
    mass
    height
  }
  starships: getTwoRandomStarships {
    id
    name
    crew
    length
  }
}
```

### Database Management

```bash
# Start database only
npm run db:up

# Start with PgAdmin (localhost:8080)
npm run pgadmin:up

# View logs
npm run db:logs

# Complete reset
npm run db:reset && npm run seed
```

### Comparable Data Fields

All entities include numerical fields suitable for comparisons:

- **People**: `mass` (integer) - body mass in kilograms, `height` (integer) - height in centimeters
- **Starships**: `crew` (integer) - crew size, `length` (integer) - length in meters

## 📝 Data Schema

### People Entity

```typescript
{
  id: number;
  name: string; // "Luke Skywalker"
  mass: number; // 77
  height: number; // 172
  gender: string; // "male"
}
```

### Starship Entity

```typescript
{
  id: number;
  name: string; // "Millennium Falcon"
  model: string; // "YT-1300 light freighter"
  manufacturer: string; // "Corellian Engineering"
  crew: number; // 4
  length: number; // 35
}
```

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# With coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Test Coverage

- **Unit Tests**: Services and Resolvers
- **Integration Tests**: GraphQL endpoints
- **E2E Tests**: Full application flow

## 👤 Author

**Artur Witkowski**
