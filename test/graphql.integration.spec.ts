/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { People } from '../src/people/people.entity';
import { Starship } from '../src/starships/starship.entity';

describe('GraphQL Integration (e2e)', () => {
  let app: INestApplication;
  let peopleRepository: Repository<People>;
  let starshipRepository: Repository<Starship>;

  const testPeople: Partial<People>[] = [
    { name: 'Luke Skywalker', mass: 77, height: 172, gender: 'male' },
    { name: 'Darth Vader', mass: 136, height: 202, gender: 'male' },
    { name: 'Princess Leia', mass: 49, height: 150, gender: 'female' },
  ];

  const testStarships: Partial<Starship>[] = [
    {
      name: 'Millennium Falcon',
      model: 'YT-1300 light freighter',
      manufacturer: 'Corellian Engineering Corporation',
      crew: 4,
      length: 35,
    },
    {
      name: 'X-wing Starfighter',
      model: 'T-65 X-wing',
      manufacturer: 'Incom Corporation',
      crew: 1,
      length: 13,
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    peopleRepository = app.get<Repository<People>>(getRepositoryToken(People));
    starshipRepository = app.get<Repository<Starship>>(
      getRepositoryToken(Starship),
    );
  });

  beforeEach(async () => {
    // Clean the database
    await peopleRepository.clear();
    await starshipRepository.clear();

    // Seed test data
    for (const person of testPeople) {
      await peopleRepository.save(peopleRepository.create(person));
    }

    for (const starship of testStarships) {
      await starshipRepository.save(starshipRepository.create(starship));
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('People Queries', () => {
    it('should get all people with pagination', async () => {
      const query = `
        query {
          getPeople(page: 1, limit: 2) {
            id
            name
            mass
            height
            gender
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.getPeople).toHaveLength(2);
      expect(response.body.data.getPeople[0]).toHaveProperty('id');
      expect(response.body.data.getPeople[0]).toHaveProperty('name');
      expect(response.body.data.getPeople[0]).toHaveProperty('mass');
    });

    it('should get person by id', async () => {
      const savedPerson = await peopleRepository.findOne({
        where: { name: 'Luke Skywalker' },
      });

      if (!savedPerson) {
        throw new Error('Test person not found');
      }

      const query = `
        query {
          getPeopleById(id: ${savedPerson.id}) {
            id
            name
            mass
            height
            gender
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.getPeopleById.name).toBe('Luke Skywalker');
      expect(response.body.data.getPeopleById.mass).toBe(77);
    });

    it('should get two random people', async () => {
      const query = `
        query {
          getTwoRandomPeople {
            id
            name
            mass
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.getTwoRandomPeople).toHaveLength(2);
      expect(response.body.data.getTwoRandomPeople[0].id).not.toBe(
        response.body.data.getTwoRandomPeople[1].id,
      );
    });

    it('should handle getTwoRandomPeople with insufficient data', async () => {
      // Remove all but one person
      await peopleRepository.clear();
      await peopleRepository.save(peopleRepository.create(testPeople[0]));

      const query = `
        query {
          getTwoRandomPeople {
            id
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        'Not enough people in database for comparison',
      );
    });
  });

  describe('People Mutations', () => {
    it('should create a new person', async () => {
      const mutation = `
        mutation {
          createPeople(
            name: "Rey Skywalker"
            mass: 54
            height: 170
            gender: "female"
          ) {
            id
            name
            mass
            height
            gender
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      expect(response.body.data.createPeople.name).toBe('Rey Skywalker');
      expect(response.body.data.createPeople.mass).toBe(54);

      // Verify in database
      const savedPerson = await peopleRepository.findOne({
        where: { name: 'Rey Skywalker' },
      });
      expect(savedPerson).toBeDefined();
    });

    it('should update a person', async () => {
      const savedPerson = await peopleRepository.findOne({
        where: { name: 'Luke Skywalker' },
      });

      if (!savedPerson) {
        throw new Error('Test person not found');
      }

      const mutation = `
        mutation {
          updatePeople(
            id: ${savedPerson.id}
            name: "Luke Skywalker (Jedi)"
            mass: 80
          ) {
            id
            name
            mass
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      expect(response.body.data.updatePeople.name).toBe(
        'Luke Skywalker (Jedi)',
      );
      expect(response.body.data.updatePeople.mass).toBe(80);
    });

    it('should delete a person', async () => {
      const savedPerson = await peopleRepository.findOne({
        where: { name: 'Luke Skywalker' },
      });

      if (!savedPerson) {
        throw new Error('Test person not found');
      }

      const mutation = `
        mutation {
          deletePeople(id: ${savedPerson.id})
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      expect(response.body.data.deletePeople).toBe(true);

      // Verify deletion
      const deletedPerson = await peopleRepository.findOne({
        where: { id: savedPerson.id },
      });
      expect(deletedPerson).toBeNull();
    });
  });

  describe('Starship Queries', () => {
    it('should get all starships with pagination', async () => {
      const query = `
        query {
          getStarships(page: 1, limit: 2) {
            id
            name
            model
            manufacturer
            crew
            length
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.getStarships).toHaveLength(2);
      expect(response.body.data.getStarships[0]).toHaveProperty('length');
    });

    it('should get starship by id', async () => {
      const savedStarship = await starshipRepository.findOne({
        where: { name: 'Millennium Falcon' },
      });

      if (!savedStarship) {
        throw new Error('Test starship not found');
      }

      const query = `
        query {
          getStarshipById(id: ${savedStarship.id}) {
            id
            name
            crew
            length
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.getStarshipById.name).toBe('Millennium Falcon');
      expect(response.body.data.getStarshipById.crew).toBe(4);
      expect(response.body.data.getStarshipById.length).toBe(35);
    });

    it('should get two random starships', async () => {
      const query = `
        query {
          getTwoRandomStarships {
            id
            name
            crew
            length
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.getTwoRandomStarships).toHaveLength(2);
      expect(response.body.data.getTwoRandomStarships[0]).toHaveProperty(
        'length',
      );
    });
  });

  describe('Starship Mutations', () => {
    it('should create a new starship with length field', async () => {
      const mutation = `
        mutation {
          createStarship(
            name: "Razor Crest"
            model: "ST-70 Assault Ship"
            manufacturer: "Razor Crest Manufacturing"
            crew: 1
          ) {
            id
            name
            crew
            length
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200);

      expect(response.body.data.createStarship.name).toBe('Razor Crest');
      expect(response.body.data.createStarship.crew).toBe(1);
    });
  });

  describe('Combined Game Queries', () => {
    it('should get both people and starships for battle', async () => {
      const query = `
        query {
          people: getTwoRandomPeople {
            id
            name
            mass
          }
          starships: getTwoRandomStarships {
            id
            name
            crew
            length
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.people).toHaveLength(2);
      expect(response.body.data.starships).toHaveLength(2);
      expect(response.body.data.starships[0]).toHaveProperty('length');
    });
  });
});
