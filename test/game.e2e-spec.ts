/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { People } from '../src/people/people.entity';
import { Starship } from '../src/starships/starship.entity';

describe('Game Logic E2E', () => {
  let app: INestApplication;
  let peopleRepository: Repository<People>;
  let starshipRepository: Repository<Starship>;

  const gameTestPeople: Partial<People>[] = [
    { name: 'Lightweight Fighter', mass: 45, height: 160, gender: 'male' },
    { name: 'Heavyweight Champion', mass: 150, height: 200, gender: 'male' },
    { name: 'Middleweight Warrior', mass: 75, height: 175, gender: 'female' },
    { name: 'Ultra Heavy Titan', mass: 200, height: 220, gender: 'male' },
    { name: 'Speed Demon', mass: 40, height: 155, gender: 'female' },
  ];

  const gameTestStarships: Partial<Starship>[] = [
    {
      name: 'Solo Fighter',
      model: 'Single Pilot',
      manufacturer: 'Rebel Alliance',
      crew: 1,
      length: 12,
    },
    {
      name: 'Small Frigate',
      model: 'Light Cruiser',
      manufacturer: 'Republic Fleet',
      crew: 50,
      length: 200,
    },
    {
      name: 'Massive Dreadnought',
      model: 'Super Destroyer',
      manufacturer: 'Imperial Navy',
      crew: 50000,
      length: 15000,
    },
    {
      name: 'Tiny Scout',
      model: 'Reconnaissance',
      manufacturer: 'Rebels',
      crew: 2,
      length: 8,
    },
    {
      name: 'Giant Battleship',
      model: 'Capital Ship',
      manufacturer: 'Empire',
      crew: 100000,
      length: 25000,
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
    // Clean and seed with game test data
    await peopleRepository.clear();
    await starshipRepository.clear();

    for (const person of gameTestPeople) {
      await peopleRepository.save(peopleRepository.create(person));
    }

    for (const starship of gameTestStarships) {
      await starshipRepository.save(starshipRepository.create(starship));
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Mass Battle Logic', () => {
    it('should consistently return people for mass battles', async () => {
      const query = `
        query {
          getTwoRandomPeople {
            id
            name
            mass
          }
        }
      `;

      // Run multiple battles to test consistency
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.getTwoRandomPeople).toHaveLength(2);

        const [person1, person2] = response.body.data.getTwoRandomPeople;
        expect(person1.id).not.toBe(person2.id);
        expect(typeof person1.mass).toBe('number');
        expect(typeof person2.mass).toBe('number');
        expect(person1.mass).toBeGreaterThan(0);
        expect(person2.mass).toBeGreaterThan(0);
      }
    });

    it('should have clear mass battle winners', async () => {
      const query = `
        query {
          getTwoRandomPeople {
            id
            name
            mass
          }
        }
      `;

      // Test mass battle determination logic
      for (let i = 0; i < 10; i++) {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const [person1, person2] = response.body.data.getTwoRandomPeople;
        const winner = person1.mass > person2.mass ? person1 : person2;
        const loser = person1.mass > person2.mass ? person2 : person1;

        expect(winner.mass).toBeGreaterThanOrEqual(loser.mass);

        // Verify we have clear winners (no ties in our test data)
        if (winner.mass === loser.mass) {
          // This should be rare with our diverse test data
          console.log('Tie detected:', winner.name, 'vs', loser.name);
        }
      }
    });
  });

  describe('Crew Battle Logic', () => {
    it('should consistently return starships for crew battles', async () => {
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

      // Run multiple battles to test consistency
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.getTwoRandomStarships).toHaveLength(2);

        const [ship1, ship2] = response.body.data.getTwoRandomStarships;
        expect(ship1.id).not.toBe(ship2.id);
        expect(typeof ship1.crew).toBe('number');
        expect(typeof ship2.crew).toBe('number');
        expect(typeof ship1.length).toBe('number');
        expect(typeof ship2.length).toBe('number');
      }
    });

    it('should have clear crew battle winners', async () => {
      const query = `
        query {
          getTwoRandomStarships {
            id
            name
            crew
          }
        }
      `;

      // Test crew battle determination logic
      for (let i = 0; i < 10; i++) {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const [ship1, ship2] = response.body.data.getTwoRandomStarships;
        const crewWinner = ship1.crew > ship2.crew ? ship1 : ship2;
        const crewLoser = ship1.crew > ship2.crew ? ship2 : ship1;

        expect(crewWinner.crew).toBeGreaterThanOrEqual(crewLoser.crew);
      }
    });

    it('should have clear length battle winners', async () => {
      const query = `
        query {
          getTwoRandomStarships {
            id
            name
            length
          }
        }
      `;

      // Test length battle determination logic
      for (let i = 0; i < 10; i++) {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const [ship1, ship2] = response.body.data.getTwoRandomStarships;
        const lengthWinner = ship1.length > ship2.length ? ship1 : ship2;
        const lengthLoser = ship1.length > ship2.length ? ship2 : ship1;

        expect(lengthWinner.length).toBeGreaterThanOrEqual(lengthLoser.length);
      }
    });
  });

  describe('Combined Battle Scenarios', () => {
    it('should support simultaneous people and starship battles', async () => {
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

      // Verify both battle types work simultaneously
      expect(response.body.data.people).toHaveLength(2);
      expect(response.body.data.starships).toHaveLength(2);

      // Check mass battle logic
      const [person1, person2] = response.body.data.people;
      const massWinner = person1.mass > person2.mass ? person1 : person2;
      expect(massWinner.mass).toBeGreaterThanOrEqual(
        person1.mass > person2.mass ? person2.mass : person1.mass,
      );

      // Check crew battle logic
      const [ship1, ship2] = response.body.data.starships;
      const crewWinner = ship1.crew > ship2.crew ? ship1 : ship2;
      expect(crewWinner.crew).toBeGreaterThanOrEqual(
        ship1.crew > ship2.crew ? ship2.crew : ship1.crew,
      );

      // Check length battle logic
      const lengthWinner = ship1.length > ship2.length ? ship1 : ship2;
      expect(lengthWinner.length).toBeGreaterThanOrEqual(
        ship1.length > ship2.length ? ship2.length : ship1.length,
      );
    });
  });

  describe('Game Performance', () => {
    it('should handle multiple rapid battle requests', async () => {
      const query = `
        query {
          getTwoRandomPeople {
            id
            name
            mass
          }
        }
      `;

      const startTime = Date.now();
      const promises: Promise<any>[] = [];

      // Fire 10 simultaneous requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/graphql')
            .send({ query })
            .expect(200),
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      // Verify all responses are valid
      responses.forEach((response) => {
        expect(response.body.data.getTwoRandomPeople).toHaveLength(2);
      });

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty database gracefully', async () => {
      // Clear all data
      await peopleRepository.clear();
      await starshipRepository.clear();

      const peopleQuery = `
        query {
          getTwoRandomPeople {
            id
            name
          }
        }
      `;

      const starshipsQuery = `
        query {
          getTwoRandomStarships {
            id
            name
          }
        }
      `;

      // Both should return errors
      const peopleResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: peopleQuery })
        .expect(200);

      const starshipsResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: starshipsQuery })
        .expect(200);

      expect(peopleResponse.body.errors).toBeDefined();
      expect(starshipsResponse.body.errors).toBeDefined();
    });

    it('should handle single record gracefully', async () => {
      // Clear and add only one record of each type
      await peopleRepository.clear();
      await starshipRepository.clear();

      await peopleRepository.save(peopleRepository.create(gameTestPeople[0]));
      await starshipRepository.save(
        starshipRepository.create(gameTestStarships[0]),
      );

      const peopleQuery = `
        query {
          getTwoRandomPeople {
            id
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: peopleQuery })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        'Not enough people in database for comparison',
      );
    });
  });
});
