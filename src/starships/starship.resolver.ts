import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { Starship } from './starship.entity';
import { StarshipService } from './starship.service';
import { PaginationArgs } from '../common/pagination.args';

@Resolver(() => Starship)
export class StarshipResolver {
  constructor(private readonly starshipService: StarshipService) {}

  @Query(() => [Starship], { name: 'getStarships' })
  async findAll(@Args() paginationArgs: PaginationArgs): Promise<Starship[]> {
    return this.starshipService.findAll(
      paginationArgs.page,
      paginationArgs.limit,
    );
  }

  @Query(() => Starship, { name: 'getStarshipById', nullable: true })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Starship> {
    return this.starshipService.findById(id);
  }

  @Query(() => [Starship], { name: 'getTwoRandomStarships' })
  async getTwoRandom(): Promise<Starship[]> {
    return this.starshipService.getTwoRandom();
  }

  @Mutation(() => Starship)
  async createStarship(
    @Args('name') name: string,
    @Args('model') model: string,
    @Args('manufacturer') manufacturer: string,
    @Args('crew', { type: () => Int }) crew: number,
  ): Promise<Starship> {
    return this.starshipService.create({ name, model, manufacturer, crew });
  }

  @Mutation(() => Starship)
  async updateStarship(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('model', { nullable: true }) model?: string,
    @Args('manufacturer', { nullable: true }) manufacturer?: string,
    @Args('crew', { type: () => Int, nullable: true }) crew?: number,
  ): Promise<Starship> {
    const updateData: Partial<Starship> = {};
    if (name !== undefined) updateData.name = name;
    if (model !== undefined) updateData.model = model;
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (crew !== undefined) updateData.crew = crew;

    return this.starshipService.update(id, updateData);
  }

  @Mutation(() => Boolean)
  async deleteStarship(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.starshipService.delete(id);
  }
}
