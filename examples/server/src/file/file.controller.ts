import {
  Controller,
  UploadedFile,
  Body,
  HttpStatus,
  HttpException,
  UseInterceptors,
  FileInterceptor,
  Post,
} from '@nestjs/common';
import mkdirp from 'mkdirp';
import { createHash } from 'crypto';
import { File } from './file.type';
import { writeFileSync } from 'fs';
import { join } from 'path';

@Controller('file')
export class FileController {
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  postSingleFile(
    @UploadedFile() file: File,
  ): string {
    mkdirp.sync('data');
    const hash = createHash('sha256');
    hash.write(file.buffer);
    const digest = hash.digest().toString('hex');
    if (!file) {
      throw new HttpException('missing file', HttpStatus.BAD_REQUEST);
    }
    writeFileSync(join('data', digest), file.buffer, 'binary');
    return digest;
  }
}
