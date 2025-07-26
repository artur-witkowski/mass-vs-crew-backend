import { Test, TestingModule } from '@nestjs/testing';
import { PeopleResolver } from './people.resolver';
import { PeopleService } from './people.service';
import { People } from './people.entity';
import { PaginationArgs } from '../common/pagination.args';

describe('PeopleResolver', () => {
  let resolver: PeopleResolver;

  const mockPeople: People[] = [
    { id: 1, name: 'Luke Skywalker', mass: 77, height: 172, gender: 'male' },
    { id: 2, name: 'Darth Vader', mass: 136, height: 202, gender: 'male' },
    { id: 3, name: 'Princess Leia', mass: 49, height: 150, gender: 'female' },
  ];

  const mockPeopleService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getTwoRandom: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeopleResolver,
        {
          provide: PeopleService,
          useValue: mockPeopleService,
        },
      ],
    }).compile();

    resolver = module.get<PeopleResolver>(PeopleResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated people', async () => {
      const paginationArgs: PaginationArgs = { page: 1, limit: 2 };
      const expectedPeople = mockPeople.slice(0, 2);

      mockPeopleService.findAll.mockResolvedValue(expectedPeople);

      const result = await resolver.findAll(paginationArgs);

      expect(mockPeopleService.findAll).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(expectedPeople);
    });

    it('should handle different pagination parameters', async () => {
      const paginationArgs: PaginationArgs = { page: 3, limit: 5 };

      mockPeopleService.findAll.mockResolvedValue([]);

      await resolver.findAll(paginationArgs);

      expect(mockPeopleService.findAll).toHaveBeenCalledWith(3, 5);
    });
  });

  describe('findOne', () => {
    it('should return a person by id', async () => {
      const person = mockPeople[0];
      mockPeopleService.findById.mockResolvedValue(person);

      const result = await resolver.findOne(1);

      expect(mockPeopleService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(person);
    });

    it('should handle service throwing NotFoundException', async () => {
      const error = new Error('Person not found');
      mockPeopleService.findById.mockRejectedValue(error);

      await expect(resolver.findOne(999)).rejects.toThrow(error);
    });
  });

  describe('getTwoRandom', () => {
    it('should return two random people', async () => {
      const randomPeople = [mockPeople[0], mockPeople[2]];
      mockPeopleService.getTwoRandom.mockResolvedValue(randomPeople);

      const result = await resolver.getTwoRandom();

      expect(mockPeopleService.getTwoRandom).toHaveBeenCalled();
      expect(result).toEqual(randomPeople);
    });

    it('should handle service throwing error for insufficient data', async () => {
      const error = new Error('Not enough people in database');
      mockPeopleService.getTwoRandom.mockRejectedValue(error);

      await expect(resolver.getTwoRandom()).rejects.toThrow(error);
    });
  });

  describe('createPeople', () => {
    it('should create a new person', async () => {
      const newPersonData = {
        name: 'Rey Skywalker',
        mass: 54,
        height: 170,
        gender: 'female',
      };
      const createdPerson = { id: 4, ...newPersonData };

      mockPeopleService.create.mockResolvedValue(createdPerson);

      const result = await resolver.createPeople(
        newPersonData.name,
        newPersonData.mass,
        newPersonData.height,
        newPersonData.gender,
      );

      expect(mockPeopleService.create).toHaveBeenCalledWith(newPersonData);
      expect(result).toEqual(createdPerson);
    });
  });

  describe('updatePeople', () => {
    it('should update a person with all fields', async () => {
      const updateData = {
        name: 'Luke Skywalker (Jedi)',
        mass: 80,
        height: 175,
        gender: 'male',
      };
      const updatedPerson = { id: 1, ...updateData };

      mockPeopleService.update.mockResolvedValue(updatedPerson);

      const result = await resolver.updatePeople(
        1,
        updateData.name,
        updateData.mass,
        updateData.height,
        updateData.gender,
      );

      expect(mockPeopleService.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedPerson);
    });

    it('should update a person with partial fields', async () => {
      const updateData = { name: 'Luke Skywalker (Jedi)' };
      const updatedPerson = { ...mockPeople[0], ...updateData };

      mockPeopleService.update.mockResolvedValue(updatedPerson);

      const result = await resolver.updatePeople(1, updateData.name);

      expect(mockPeopleService.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedPerson);
    });

    it('should handle undefined optional parameters', async () => {
      const updatedPerson = mockPeople[0];

      mockPeopleService.update.mockResolvedValue(updatedPerson);

      const result = await resolver.updatePeople(
        1,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      expect(mockPeopleService.update).toHaveBeenCalledWith(1, {});
      expect(result).toEqual(updatedPerson);
    });

    it('should handle mixed defined and undefined parameters', async () => {
      const updateData = { mass: 85, gender: 'male' };
      const updatedPerson = { ...mockPeople[0], ...updateData };

      mockPeopleService.update.mockResolvedValue(updatedPerson);

      const result = await resolver.updatePeople(
        1,
        undefined,
        85,
        undefined,
        'male',
      );

      expect(mockPeopleService.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedPerson);
    });
  });

  describe('deletePeople', () => {
    it('should delete a person and return true', async () => {
      mockPeopleService.delete.mockResolvedValue(true);

      const result = await resolver.deletePeople(1);

      expect(mockPeopleService.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false if person was not deleted', async () => {
      mockPeopleService.delete.mockResolvedValue(false);

      const result = await resolver.deletePeople(999);

      expect(mockPeopleService.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
});
