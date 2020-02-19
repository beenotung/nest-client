import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnimalModule } from './animal/animal.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [AnimalModule, FileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
