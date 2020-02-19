import {
  Body,
  Controller,
  FileInterceptor,
  FilesInterceptor,
  Get,
  injectNestClient,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from 'nest-client';

/* tslint:disable:no-unused-variable */

@Controller('file')
export class FileService {
  baseUrl: string;

  constructor(baseUrl: string) {
    injectNestClient(this, {
      baseUrl,
      allowNonRestMethods: true,
    });
    this.baseUrl = baseUrl;
  }

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  postSingleFile(
    @UploadedFile() _file: File,
  ): Promise<string> {
    return undefined as any;
  }
  
}

/* tslint:enable:no-unused-variable */
