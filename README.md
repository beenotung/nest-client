# nest-client
[![npm Package Version](https://img.shields.io/npm/v/nest-client.svg?maxAge=2592000)](https://www.npmjs.com/package/nest-client)

nest.js client stub library

This allows almost no additioanl effort to make client SDK by coping from the nest.js controller file on the server codebase.

## Example (client side)
```typescript
import { Body, Controller, Get, injectNestClient, Param, Post, setBaseUrl } from "nest-client";

setBaseUrl("http://127.0.0.1:3000"); // set the default baseUrl

@Controller("animal")
class Animal {
  constructor() {
    injectNestClient(this, {
      baseUrl: "http://127.0.0.1:3000", // optional if called setBaseUrl()
      allowNonRestMethods: true
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
