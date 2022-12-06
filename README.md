# nest-client
[![npm Package Version](https://img.shields.io/npm/v/nest-client.svg?maxAge=2592000)](https://www.npmjs.com/package/nest-client)

nest.js client stub library

This allows almost no additioanl effort to make client SDK by coping from the nest.js controller file in the server codebase.

Tips: you can auto generate the client stub using [nest-gen](https://www.npmjs.com/package/nest-gen)

## Example (client side)
```typescript
import { Body, Controller, Get, injectNestClient, Param, Post, setBaseUrl } from "nest-client";

setBaseUrl("http://127.0.0.1:3000"); // set the default baseUrl

@Controller("animal")
class Animal {
  constructor() {
    injectNestClient(this, {
      baseUrl: "http://127.0.0.1:3000", // optional if called setBaseUrl()
      allowNonRestMethods: true // default false
    });
  }

  @Post("talk")
  talk(): any {
    // these code will not be called, server response will be returned instead
    console.log("talking manually");
    return "manually";
  }

  @Get("name")
  name(): any {
  }

  @Get("/get_echo/:Msg/:User")
  get_echo(@Param("Msg")Msg, @Param("User")User) {
  }

  @Post("/post_echo")
  post_echo(@Body("Msg")Msg) {
  }

  customMethod() {
    return 'this method will not be override'
  }
}
```

## Running the Example
```bash
cd examples/server
npm i
npm run start & sleep 5
cd ../../
npm test
```

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
