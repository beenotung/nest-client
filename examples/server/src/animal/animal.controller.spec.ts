import { Test, TestingModule } from '@nestjs/testing';
import { AnimalController } from './animal.controller';

describe('Animal Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AnimalController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: AnimalController = module.get<AnimalController>(AnimalController);
    expect(controller).toBeDefined();
  });
});
