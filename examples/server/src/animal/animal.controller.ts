import {Body, Controller, Get, HttpStatus, Param, Post, Res} from '@nestjs/common';

function ok(res, data) {
    return res.status(HttpStatus.OK).json(data);
}

@Controller('animal')
export class AnimalController {
    @Post('talk')
    talk(@Res()res) {
        res.status(HttpStatus.OK).json('this animal is talking');
    }

    @Get('name')
    name(@Res()res) {
        res.status(HttpStatus.OK).json({
            type: 'string',
            value: 'animal name',
        });
    }

    @Get('/get_echo/:Msg/:User')
    get_echo(@Res()res, @Param('Msg')Msg, @Param('User')User) {
        ok(res, {Msg, User});
    }

    @Post('/post_echo')
    post_echo(@Res()res, @Body('Msg')Msg) {
        ok(res, {Msg});
    }
}
