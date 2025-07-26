import { Test, TestingModule } from '@nestjs/testing';
import { StarshipResolver } from './starship.resolver';
import { StarshipService } from './starship.service';
import { Starship } from './starship.entity';
import { PaginationArgs } from '../common/pagination.args';

describe('StarshipResolver', () => {
  let resolver: StarshipResolver;

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

  const mockStarshipService = {
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
        StarshipResolver,
        {
          provide: StarshipService,
          useValue: mockStarshipService,
        },
      ],
    }).compile();

    resolver = module.get<StarshipResolver>(StarshipResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated starships', async () => {
      const paginationArgs: PaginationArgs = { page: 1, limit: 2 };
      const expectedStarships = mockStarships.slice(0, 2);

      mockStarshipService.findAll.mockResolvedValue(expectedStarships);

      const result = await resolver.findAll(paginationArgs);

      expect(mockStarshipService.findAll).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(expectedStarships);
    });

    it('should handle different pagination parameters', async () => {
      const paginationArgs: PaginationArgs = { page: 2, limit: 3 };

      mockStarshipService.findAll.mockResolvedValue([]);

      await resolver.findAll(paginationArgs);

      expect(mockStarshipService.findAll).toHaveBeenCalledWith(2, 3);
    });
  });

  describe('findOne', () => {
    it('should return a starship by id', async () => {
      const starship = mockStarships[0];
      mockStarshipService.findById.mockResolvedValue(starship);

      const result = await resolver.findOne(1);

      expect(mockStarshipService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(starship);
    });

    it('should handle service throwing NotFoundException', async () => {
      const error = new Error('Starship not found');
      mockStarshipService.findById.mockRejectedValue(error);

      await expect(resolver.findOne(999)).rejects.toThrow(error);
    });
  });

  describe('getTwoRandom', () => {
    it('should return two random starships', async () => {
      const randomStarships = [mockStarships[0], mockStarships[2]];
      mockStarshipService.getTwoRandom.mockResolvedValue(randomStarships);

      const result = await resolver.getTwoRandom();

      expect(mockStarshipService.getTwoRandom).toHaveBeenCalled();
      expect(result).toEqual(randomStarships);
    });

    it('should handle service throwing error for insufficient data', async () => {
      const error = new Error('Not enough starships in database');
      mockStarshipService.getTwoRandom.mockRejectedValue(error);

      await expect(resolver.getTwoRandom()).rejects.toThrow(error);
    });
  });

  describe('createStarship', () => {
    it('should create a new starship', async () => {
      const newStarshipData = {
        name: 'Razor Crest',
        model: 'ST-70 Assault Ship',
        manufacturer: 'Razor Crest Manufacturing',
        crew: 1,
      };
      const createdStarship = { id: 4, ...newStarshipData, length: 38 };

      mockStarshipService.create.mockResolvedValue(createdStarship);

      const result = await resolver.createStarship(
        newStarshipData.name,
        newStarshipData.model,
        newStarshipData.manufacturer,
        newStarshipData.crew,
      );

      expect(mockStarshipService.create).toHaveBeenCalledWith(newStarshipData);
      expect(result).toEqual(createdStarship);
    });
  });

  describe('updateStarship', () => {
    it('should update a starship with all fields', async () => {
      const updateData = {
        name: 'Millennium Falcon (Modified)',
        model: 'YT-1300 light freighter (Custom)',
        manufacturer: 'Corellian Engineering Corporation',
        crew: 6,
      };
      const updatedStarship = { id: 1, ...updateData, length: 35 };

      mockStarshipService.update.mockResolvedValue(updatedStarship);

      const result = await resolver.updateStarship(
        1,
        updateData.name,
        updateData.model,
        updateData.manufacturer,
        updateData.crew,
      );

      expect(mockStarshipService.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedStarship);
    });

    it('should update a starship with partial fields', async () => {
      const updateData = { crew: 8 };
      const updatedStarship = { ...mockStarships[0], ...updateData };

      mockStarshipService.update.mockResolvedValue(updatedStarship);

      const result = await resolver.updateStarship(
        1,
        undefined,
        undefined,
        undefined,
        8,
      );

      expect(mockStarshipService.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedStarship);
    });

    it('should handle undefined optional parameters', async () => {
      const updatedStarship = mockStarships[0];

      mockStarshipService.update.mockResolvedValue(updatedStarship);

      const result = await resolver.updateStarship(
        1,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      expect(mockStarshipService.update).toHaveBeenCalledWith(1, {});
      expect(result).toEqual(updatedStarship);
    });

    it('should handle mixed defined and undefined parameters', async () => {
      const updateData = { name: 'Modified Falcon', crew: 5 };
      const updatedStarship = { ...mockStarships[0], ...updateData };

      mockStarshipService.update.mockResolvedValue(updatedStarship);

      const result = await resolver.updateStarship(
        1,
        'Modified Falcon',
        undefined,
        undefined,
        5,
      );

      expect(mockStarshipService.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedStarship);
    });
  });

  describe('deleteStarship', () => {
    it('should delete a starship and return true', async () => {
      mockStarshipService.delete.mockResolvedValue(true);

      const result = await resolver.deleteStarship(1);

      expect(mockStarshipService.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false if starship was not deleted', async () => {
      mockStarshipService.delete.mockResolvedValue(false);

      const result = await resolver.deleteStarship(999);

      expect(mockStarshipService.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
});
