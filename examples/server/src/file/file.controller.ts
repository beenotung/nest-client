import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { File } from './file.type';

const localOptions: MulterOptions = {
  dest: 'uploads',
};

@Controller('file')
export class FileController {
  @Post('single')
  @UseInterceptors(FileInterceptor('file', localOptions))
  async single(
    @UploadedFile() file: File,
  ): Promise<{ mimetype: string; size: number; filename: string }> {
    if (!file) {
      throw new HttpException('missing file', HttpStatus.BAD_REQUEST);
    }
    return {
      mimetype: file.mimetype,
      size: file.size,
      filename: file.filename,
    };
  }

  @Post('array')
  @UseInterceptors(FilesInterceptor('files', 2, localOptions))
  async array(@UploadedFiles() files: File[]): Promise<string[]> {
    return files.map((file) => file.filename);
  }

  @Post('multiple')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 },
      ],
      localOptions,
    ),
  )
  async multiple(
    @UploadedFiles()
    files: {
      avatar?: File[];
      background?: File[];
    },
  ): Promise<{ avatar: string; background: string }> {
    return {
      avatar: files.avatar?.[0].filename,
      background: files.background?.[0].filename,
    };
  }
}
