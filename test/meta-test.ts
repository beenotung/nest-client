import { Body, Controller, Get, injectNestClient, Param, Post, setBaseUrl } from "../src";

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
    return "this method will not be override";
  }
}

let animal = new Animal();

function log(o: object, method: string, args: any[]) {
  o[method](...args)
    .then(response => {
      console.log(method, { response });
    })
    .catch(response => {
      console.error(method, { response });
    });
}

log(animal, "talk", []);
log(animal, "name", []);

log(animal, "get_echo", ["Get the echo message", "Alice"]);
log(animal, "post_echo", ["Post the echo message"]);
