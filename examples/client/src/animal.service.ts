import {
  Body,
  Controller,
  Get,
  injectNestClient,
  Param,
  Post
} from 'nest-client';

@Controller('animal')
export class AnimalService {
  constructor(baseUrl: string) {
    injectNestClient(this, {
      baseUrl,
      allowNonRestMethods: true
    });
  }

  @Post('talk')
  async talk(): Promise<string> {
    return null as any;
  }

  @Get('name')
  async name(): Promise<{ type: string; value: string }> {
    return null as any;
  }

  @Get('/echo/:channel/:topic')
  async getEcho(
    @Param('channel') channel: string,
    @Param('topic') topic: string
  ): Promise<Echo> {
    return null as any;
  }

  @Post('/echo')
  async postEcho(
    @Body('channel') channel: string,
    @Body('topic') topic: string
  ): Promise<Echo> {
    return null as any;
  }
}

type Echo = { channel: string; topic: string };
