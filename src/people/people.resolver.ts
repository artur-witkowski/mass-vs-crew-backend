import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { People } from './people.entity';
import { PeopleService } from './people.service';
import { PaginationArgs } from '../common/pagination.args';

@Resolver(() => People)
export class PeopleResolver {
  constructor(private readonly peopleService: PeopleService) {}

  @Query(() => [People], { name: 'getPeople' })
  async findAll(@Args() paginationArgs: PaginationArgs): Promise<People[]> {
    return this.peopleService.findAll(
      paginationArgs.page,
      paginationArgs.limit,
    );
  }

  @Query(() => People, { name: 'getPeopleById', nullable: true })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<People> {
    return this.peopleService.findById(id);
  }

  @Query(() => [People], { name: 'getTwoRandomPeople' })
  async getTwoRandom(): Promise<People[]> {
    return this.peopleService.getTwoRandom();
  }

  @Mutation(() => People)
  async createPeople(
    @Args('name') name: string,
    @Args('mass', { type: () => Int }) mass: number,
    @Args('height', { type: () => Int }) height: number,
    @Args('gender') gender: string,
  ): Promise<People> {
    return this.peopleService.create({ name, mass, height, gender });
  }

  @Mutation(() => People)
  async updatePeople(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('mass', { type: () => Int, nullable: true }) mass?: number,
    @Args('height', { type: () => Int, nullable: true }) height?: number,
    @Args('gender', { nullable: true }) gender?: string,
  ): Promise<People> {
    const updateData: Partial<People> = {};
    if (name !== undefined) updateData.name = name;
    if (mass !== undefined) updateData.mass = mass;
    if (height !== undefined) updateData.height = height;
    if (gender !== undefined) updateData.gender = gender;

    return this.peopleService.update(id, updateData);
  }

  @Mutation(() => Boolean)
  async deletePeople(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.peopleService.delete(id);
  }
}
