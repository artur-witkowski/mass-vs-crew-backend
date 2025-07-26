import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { People } from './people.entity';
import { PeopleService } from './people.service';
import { PeopleResolver } from './people.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([People])],
  providers: [PeopleService, PeopleResolver],
  exports: [PeopleService],
})
export class PeopleModule {}
