import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { StarshipService } from './starship.service';
import { Starship } from './starship.entity';

describe('StarshipService', () => {
  let service: StarshipService;

  const mockStarships: Starship[] = [
    {
      id: 1,
      name: 'Millennium Falcon',
      model: 'YT-1300 light freighter',
      manufacturer: 'Corellian Engineering Corporation',
      crew: 4,
      length: 35,
    },
    {
      id: 2,
      name: 'Imperial Star Destroyer',
      model: 'Imperial I-class Star Destroyer',
      manufacturer: 'Kuat Drive Yards',
      crew: 37000,
      length: 1600,
    },
    {
      id: 3,
      name: 'X-wing Starfighter',
      model: 'T-65 X-wing',
      manufacturer: 'Incom Corporation',
      crew: 1,
      length: 13,
    },
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
        StarshipService,
        {
          provide: getRepositoryToken(Starship),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StarshipService>(StarshipService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated starships', async () => {
      const page = 1;
      const limit = 2;
      const expectedStarships = mockStarships.slice(0, 2);

      mockRepository.find.mockResolvedValue(expectedStarships);

      const result = await service.findAll(page, limit);

      expect(mockRepository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 2,
      });
      expect(result).toEqual(expectedStarships);
    });

    it('should calculate correct skip value for pagination', async () => {
      const page = 2;
      const limit = 3;

      mockRepository.find.mockResolvedValue([]);

      await service.findAll(page, limit);

      expect(mockRepository.find).toHaveBeenCalledWith({
        skip: 3, // (2-1) * 3
        take: 3,
      });
    });
  });

  describe('findById', () => {
    it('should return a starship by id', async () => {
      const starship = mockStarships[0];
      mockRepository.findOne.mockResolvedValue(starship);

      const result = await service.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(starship);
    });

    it('should throw NotFoundException if starship not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        new NotFoundException('Starship with ID 999 not found'),
      );
    });
  });

  describe('create', () => {
    it('should create and save a new starship', async () => {
      const newStarshipData = {
        name: 'Razor Crest',
        model: 'ST-70 Assault Ship',
        manufacturer: 'Razor Crest Manufacturing',
        crew: 1,
        length: 38,
      };
      const savedStarship = { id: 4, ...newStarshipData };

      mockRepository.create.mockReturnValue(savedStarship);
      mockRepository.save.mockResolvedValue(savedStarship);

      const result = await service.create(newStarshipData);

      expect(mockRepository.create).toHaveBeenCalledWith(newStarshipData);
      expect(mockRepository.save).toHaveBeenCalledWith(savedStarship);
      expect(result).toEqual(savedStarship);
    });
  });

  describe('update', () => {
    it('should update a starship and return the updated entity', async () => {
      const updateData = { crew: 6, length: 40 };
      const updatedStarship = { ...mockStarships[0], ...updateData };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedStarship);

      const result = await service.update(1, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedStarship);
    });

    it('should throw NotFoundException if starship to update not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { crew: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a starship and return true', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false if no starship was affected', async () => {
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
    it('should return two random starships', async () => {
      const randomStarships = [mockStarships[0], mockStarships[2]];
      const mockQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(randomStarships),
      };

      mockRepository.count.mockResolvedValue(3);
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTwoRandom();

      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'starship',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('RANDOM()');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(2);
      expect(result).toEqual(randomStarships);
    });

    it('should throw error if less than 2 starships in database', async () => {
      mockRepository.count.mockResolvedValue(1);

      await expect(service.getTwoRandom()).rejects.toThrow(
        'Not enough starships in database for comparison',
      );
    });

    it('should throw error if no starships in database', async () => {
      mockRepository.count.mockResolvedValue(0);

      await expect(service.getTwoRandom()).rejects.toThrow(
        'Not enough starships in database for comparison',
      );
    });
  });
});
