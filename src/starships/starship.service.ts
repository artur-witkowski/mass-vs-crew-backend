import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Starship } from './starship.entity';

@Injectable()
export class StarshipService {
  constructor(
    @InjectRepository(Starship)
    private readonly starshipRepository: Repository<Starship>,
  ) {}

  async findAll(page: number, limit: number): Promise<Starship[]> {
    const skip = (page - 1) * limit;
    return this.starshipRepository.find({
      skip,
      take: limit,
    });
  }

  async findById(id: number): Promise<Starship> {
    const starship = await this.starshipRepository.findOne({ where: { id } });
    if (!starship) {
      throw new NotFoundException(`Starship with ID ${id} not found`);
    }
    return starship;
  }

  async create(data: Partial<Starship>): Promise<Starship> {
    const starship = this.starshipRepository.create(data);
    return this.starshipRepository.save(starship);
  }

  async update(id: number, data: Partial<Starship>): Promise<Starship> {
    await this.starshipRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.starshipRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getTwoRandom(): Promise<Starship[]> {
    const count = await this.starshipRepository.count();
    if (count < 2) {
      throw new Error('Not enough starships in database for comparison');
    }

    return this.starshipRepository
      .createQueryBuilder('starship')
      .orderBy('RANDOM()')
      .limit(2)
      .getMany();
  }
}
