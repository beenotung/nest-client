import { Module } from '@nestjs/common';
import { AnimalController } from './animal.controller';

@Module({
  controllers: [AnimalController],
})
export class AnimalModule {}
