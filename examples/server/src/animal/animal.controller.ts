import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@Controller('animal')
export class AnimalController {
  @Get()
  async list(): Promise<string[]> {
    return ['the', 'path', 'is', 'optional'];
  }

  @Post('talk')
  async talk(): Promise<string> {
    return 'this animal is talking';
  }

  @Get('name')
  async name(): Promise<{ type: string; value: string }> {
    return {
      type: 'string',
      value: 'animal name',
    };
  }

  @Get('/echo/:channel/:topic')
  async getEcho(
    @Param('channel') channel: string,
    @Param('topic') topic: string,
  ): Promise<Echo> {
    return { channel, topic };
  }

  @Post('/echo')
  async postEcho(
    @Body('channel') channel: string,
    @Body('topic') topic: string,
  ): Promise<Echo> {
    return { channel, topic };
  }
}

type Echo = { channel: string; topic: string };
