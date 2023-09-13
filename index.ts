import App from "./app";
import BasicContainer from "./containers/basic-container";
import Route from "./core/route";
import BasicLogger from "./loggers/basic-logger";
import BasicRouter from "./routers/basic-router";

const routes: Route[] = [
  new Route({
    method: "GET",
    path: "/",
    handler: (dep3: string) => {
      return new Response(dep3, { status: 200 })
    }
  }),
];

const app = new App({
  port: 3000,
  publicPath: "public",
  container: new BasicContainer(),
  logger: new BasicLogger(),
  router: new BasicRouter({ routes }),
  errorHandler: async () =>
    new Response("Woops something wen't wrong", { status: 500 }),
});

const dep1 = () => "dep1"
const dep2 = () => "dep2"
const dep3 = (dep1: string, dep2: string) => dep1 + " " + dep2

app.container.register(dep1, { name: "dep1", type: "function" })
app.container.register(dep2, { name: "dep2", type: "function" })
app.container.register(dep3, { name: "dep3", type: "function" })

app.container.register("hello world!", {
  name: "content",
  type: "value"
})

app.start();
