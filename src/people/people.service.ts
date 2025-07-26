import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { People } from './people.entity';

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(People)
    private readonly peopleRepository: Repository<People>,
  ) {}

  async findAll(page: number, limit: number): Promise<People[]> {
    const skip = (page - 1) * limit;
    return this.peopleRepository.find({
      skip,
      take: limit,
    });
  }

  async findById(id: number): Promise<People> {
    const person = await this.peopleRepository.findOne({ where: { id } });
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  async create(data: Partial<People>): Promise<People> {
    const person = this.peopleRepository.create(data);
    return this.peopleRepository.save(person);
  }

  async update(id: number, data: Partial<People>): Promise<People> {
    await this.peopleRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.peopleRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getTwoRandom(): Promise<People[]> {
    const count = await this.peopleRepository.count();
    if (count < 2) {
      throw new Error('Not enough people in database for comparison');
    }

    return this.peopleRepository
      .createQueryBuilder('people')
      .orderBy('RANDOM()')
      .limit(2)
      .getMany();
  }
}
