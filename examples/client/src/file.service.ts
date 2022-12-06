import {
  Controller,
  injectNestClient,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from 'nest-client';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor
} from 'nest-client';

@Controller('file')
export class FileService {
  constructor(baseUrl: string) {
    injectNestClient(this, {
      baseUrl,
      allowNonRestMethods: true
    });
  }

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async single(
    @UploadedFile() file?: File
  ): Promise<{ mimetype: string; size: number; filename: string }> {
    return null as any;
  }

  @Post('array')
  @UseInterceptors(FilesInterceptor('files'))
  async array(@UploadedFiles() files: File[]): Promise<string[]> {
    return null as any;
  }

  @Post('multiple')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'background', maxCount: 1 }
    ])
  )
  async multiple(
    @UploadedFiles()
    files: {
      avatar?: File[];
      background?: File[];
    }
  ): Promise<{ avatar: string; background: string }> {
    return null as any;
  }
}
