import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PeopleService } from './people/people.service';
import { StarshipService } from './starships/starship.service';

async function seed() {
  console.log('🌱 Starting database seeding...');

  const app = await NestFactory.createApplicationContext(AppModule);

  const peopleService = app.get(PeopleService);
  const starshipService = app.get(StarshipService);

  try {
    // Seed People data
    console.log('👥 Seeding People...');
    const peopleData = [
      { name: 'Luke Skywalker', mass: 77, height: 172, gender: 'male' },
      { name: 'Darth Vader', mass: 136, height: 202, gender: 'male' },
      { name: 'Princess Leia', mass: 49, height: 150, gender: 'female' },
      { name: 'Han Solo', mass: 80, height: 180, gender: 'male' },
      { name: 'Chewbacca', mass: 112, height: 228, gender: 'male' },
      { name: 'Obi-Wan Kenobi', mass: 77, height: 182, gender: 'male' },
      { name: 'Yoda', mass: 17, height: 66, gender: 'male' },
      { name: 'R2-D2', mass: 32, height: 96, gender: 'unknown' },
      { name: 'C-3PO', mass: 75, height: 167, gender: 'unknown' },
      { name: 'Padmé Amidala', mass: 45, height: 165, gender: 'female' },
      { name: 'Anakin Skywalker', mass: 84, height: 188, gender: 'male' },
      { name: 'Mace Windu', mass: 84, height: 188, gender: 'male' },
      { name: 'Qui-Gon Jinn', mass: 89, height: 193, gender: 'male' },
      { name: 'Boba Fett', mass: 78, height: 183, gender: 'male' },
      { name: 'Jango Fett', mass: 79, height: 183, gender: 'male' },
    ];

    for (const person of peopleData) {
      await peopleService.create(person);
    }
    console.log(`✅ Created ${peopleData.length} people`);

    // Seed Starships data
    console.log('🚀 Seeding Starships...');
    const starshipData = [
      {
        name: 'Millennium Falcon',
        model: 'YT-1300 light freighter',
        manufacturer: 'Corellian Engineering Corporation',
        crew: 4,
      },
      {
        name: 'Imperial Star Destroyer',
        model: 'Imperial I-class Star Destroyer',
        manufacturer: 'Kuat Drive Yards',
        crew: 37000,
      },
      {
        name: 'X-wing Starfighter',
        model: 'T-65 X-wing',
        manufacturer: 'Incom Corporation',
        crew: 1,
      },
      {
        name: 'TIE Fighter',
        model: 'Twin Ion Engine/Ln starfighter',
        manufacturer: 'Sienar Fleet Systems',
        crew: 1,
      },
      {
        name: 'Death Star',
        model: 'DS-1 Orbital Battle Station',
        manufacturer: 'Imperial Department of Military Research',
        crew: 342953,
      },
      {
        name: 'Y-wing Starfighter',
        model: 'BTL Y-wing',
        manufacturer: 'Koensayr Manufacturing',
        crew: 2,
      },
      {
        name: 'A-wing Starfighter',
        model: 'RZ-1 A-wing',
        manufacturer: 'Alliance Underground Engineering',
        crew: 1,
      },
      {
        name: 'Slave I',
        model: 'Firespray-31-class patrol craft',
        manufacturer: 'Kuat Systems Engineering',
        crew: 1,
      },
      {
        name: 'Tantive IV',
        model: 'CR90 corvette',
        manufacturer: 'Corellian Engineering Corporation',
        crew: 165,
      },
      {
        name: 'Super Star Destroyer',
        model: 'Executor-class Star Dreadnought',
        manufacturer: 'Kuat Drive Yards',
        crew: 279144,
      },
      {
        name: 'Naboo Royal Starship',
        model: 'J-type 327 Nubian royal starship',
        manufacturer: 'Theed Palace Space Vessel Engineering Corps',
        crew: 8,
      },
      {
        name: 'Jedi Starfighter',
        model: 'Delta-7 Aethersprite-class light interceptor',
        manufacturer: 'Kuat Systems Engineering',
        crew: 1,
      },
      {
        name: 'Clone Turbo Tank',
        model: 'HAVw A6 Juggernaut',
        manufacturer: 'Kuat Drive Yards',
        crew: 20,
      },
      {
        name: 'Venator-class Star Destroyer',
        model: 'Venator-class Star Destroyer',
        manufacturer: 'Kuat Drive Yards',
        crew: 7400,
      },
      {
        name: 'Nebulon-B Frigate',
        model: 'EF76 Nebulon-B escort frigate',
        manufacturer: 'Kuat Drive Yards',
        crew: 854,
      },
    ];

    for (const starship of starshipData) {
      await starshipService.create(starship);
    }
    console.log(`✅ Created ${starshipData.length} starships`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   👥 People: ${peopleData.length} entries`);
    console.log(`   🚀 Starships: ${starshipData.length} entries`);
    console.log('');
    console.log('🎮 Ready for Mass vs. Crew battles!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

void seed();
