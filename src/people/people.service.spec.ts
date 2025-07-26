import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PeopleService } from './people.service';
import { People } from './people.entity';

describe('PeopleService', () => {
  let service: PeopleService;

  const mockPeople: People[] = [
    { id: 1, name: 'Luke Skywalker', mass: 77, height: 172, gender: 'male' },
    { id: 2, name: 'Darth Vader', mass: 136, height: 202, gender: 'male' },
    { id: 3, name: 'Princess Leia', mass: 49, height: 150, gender: 'female' },
  ];

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeopleService,
        {
          provide: getRepositoryToken(People),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PeopleService>(PeopleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated people', async () => {
      const page = 1;
      const limit = 2;
      const expectedPeople = mockPeople.slice(0, 2);

      mockRepository.find.mockResolvedValue(expectedPeople);

      const result = await service.findAll(page, limit);

      expect(mockRepository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 2,
      });
      expect(result).toEqual(expectedPeople);
    });

    it('should calculate correct skip value for pagination', async () => {
      const page = 3;
      const limit = 5;

      mockRepository.find.mockResolvedValue([]);

      await service.findAll(page, limit);

      expect(mockRepository.find).toHaveBeenCalledWith({
        skip: 10, // (3-1) * 5
        take: 5,
      });
    });
  });

  describe('findById', () => {
    it('should return a person by id', async () => {
      const person = mockPeople[0];
      mockRepository.findOne.mockResolvedValue(person);

      const result = await service.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(person);
    });

    it('should throw NotFoundException if person not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        new NotFoundException('Person with ID 999 not found'),
      );
    });
  });

  describe('create', () => {
    it('should create and save a new person', async () => {
      const newPersonData = {
        name: 'Rey Skywalker',
        mass: 54,
        height: 170,
        gender: 'female',
      };
      const savedPerson = { id: 4, ...newPersonData };

      mockRepository.create.mockReturnValue(savedPerson);
      mockRepository.save.mockResolvedValue(savedPerson);

      const result = await service.create(newPersonData);

      expect(mockRepository.create).toHaveBeenCalledWith(newPersonData);
      expect(mockRepository.save).toHaveBeenCalledWith(savedPerson);
      expect(result).toEqual(savedPerson);
    });
  });

  describe('update', () => {
    it('should update a person and return the updated entity', async () => {
      const updateData = { name: 'Luke Skywalker (Jedi)' };
      const updatedPerson = { ...mockPeople[0], ...updateData };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedPerson);

      const result = await service.update(1, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedPerson);
    });

    it('should throw NotFoundException if person to update not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a person and return true', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false if no person was affected', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.delete(999);

      expect(result).toBe(false);
    });

    it('should handle null affected count', async () => {
      mockRepository.delete.mockResolvedValue({ affected: null });

      const result = await service.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('getTwoRandom', () => {
    it('should return two random people', async () => {
      const randomPeople = [mockPeople[0], mockPeople[2]];
      const mockQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(randomPeople),
      };

      mockRepository.count.mockResolvedValue(3);
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTwoRandom();

      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('people');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('RANDOM()');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(2);
      expect(result).toEqual(randomPeople);
    });

    it('should throw error if less than 2 people in database', async () => {
      mockRepository.count.mockResolvedValue(1);

      await expect(service.getTwoRandom()).rejects.toThrow(
        'Not enough people in database for comparison',
      );
    });

    it('should throw error if no people in database', async () => {
      mockRepository.count.mockResolvedValue(0);

      await expect(service.getTwoRandom()).rejects.toThrow(
        'Not enough people in database for comparison',
      );
    });
  });
});
