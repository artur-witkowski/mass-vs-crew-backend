import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Starship } from './starship.entity';
import { StarshipService } from './starship.service';
import { StarshipResolver } from './starship.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Starship])],
  providers: [StarshipService, StarshipResolver],
  exports: [StarshipService],
})
export class StarshipModule {}
