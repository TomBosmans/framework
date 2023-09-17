import BasicLogger from "./loggers/basic-logger";
import Container from "./core/container";
import Handler from "./core/handler";
import Logger from "./core/logger";
import Route from "./core/route";
import Router from "./core/router";
import basicErrorHandler from "./handlers/basic-error.handler";
import basicNotFouncHandler from "./handlers/basic-not-found.handler";
import { BasicContainer } from "./containers/basic-container";
import { BasicRouter } from "./routers/basic-container";
import { Errorlike } from "bun";
import { join } from "path";

type AppStartParams = {
  port?: number;
  development?: boolean;
};

const defaultStartParams: AppStartParams = {
  port: 3000,
  development: false,
};

type AppParams = {
  container?: Container;
  errorHandler?: Handler;
  notFoundHandler?: Handler;
  logger?: Logger;
  modules?: RegExp[];
  publicPath?: string;
  router?: Router; srcPath?: string;
};

export default class App {
  public container: Container;
  public errorHandler: Handler;
  public notFoundHandler: Handler;
  public logger: Logger;
  public publicPath: string;
  public router: Router;
  public srcPath: string;

  constructor({
    container = new BasicContainer(),
    errorHandler = basicErrorHandler,
    notFoundHandler = basicNotFouncHandler,
    logger = new BasicLogger(),
    modules = [/\.middleware\.ts$/, /\.service\.ts$/, /\.route\.ts$/],
    publicPath = "public",
    router = new BasicRouter(),
    srcPath = join(import.meta.dir, "src"),
  }: AppParams) {
    this.container = container;
    this.errorHandler = errorHandler;
    this.notFoundHandler = notFoundHandler;
    this.logger = logger;
    this.publicPath = publicPath;
    this.router = router;
    this.srcPath = srcPath;

    this.container.register(logger, { name: "logger", type: "value" });
    this.container.loadModules(modules, this.srcPath);
    const routeNames = this.container.registrations(/Route/);
    for (const routeName of routeNames) {
      const route = this.container.resolve<Route>(routeName);
      this.router.register(route);
    }
  }

  public start(params?: AppStartParams) {
    const { port, development } = {
      ...defaultStartParams,
      ...params,
    }

    return Bun.serve({
      development,
      port,
      fetch: async (request) => {
        const url = new URL(request.url);
        const isPublicUrl = url.pathname.split("/")[1] === this.publicPath;
        const response = isPublicUrl
          ? await this.handleStaticFiles(url)
          : await this.handleRoute(request);

        if (response) return response;
        return this.handleNotFound(request);
      },
      error: async (error) => await this.handleError(error),
    });
  }

  private async handleError(error: Errorlike) {
    const context = this.container.createScope();
    context.register(error, { name: "error", type: "value" });
    return await context.build(this.errorHandler);
  }

  private async handleRoute(request: Request) {
    const { route, params } = this.router.match(request);
    const context = this.container.createScope();
    if (!route) return null;

    context.register(request, { name: "request", type: "value" });
    context.register(params, { name: "params", type: "value" });
    Object.keys(route.context).map((name) =>
      context.register(route.context?.[name], { name, type: "value" }),
    );
    return await context.build(route.handler);
  }

  private async handleStaticFiles(url: URL) {
    const filePath = url.pathname.slice(1);
    const file = Bun.file(filePath);
    if (await file.exists()) return new Response(file);
  }

  private async handleNotFound(request: Request) {
    const context = this.container.createScope();
    context.register(request, { name: "request", type: "value" });
    return await context.build(this.notFoundHandler);
  }
}
