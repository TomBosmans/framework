import Container from "./core/container";
import Handler from "./core/handler";
import Logger from "./core/logger";
import Router from "./core/router";
import { Errorlike } from "bun";

type AppParams = {
  container: Container;
  logger: Logger;
  port: number;
  errorHandler: Handler;
  router: Router;
  publicPath: string;
};

export default class App {
  public container: AppParams["container"];
  public logger: AppParams["logger"];
  public port: AppParams["port"];
  public errorHandler: AppParams["errorHandler"];
  public router: AppParams["router"];
  public publicPath: AppParams["publicPath"];

  constructor({
    container,
    logger,
    port,
    errorHandler,
    router,
    publicPath,
  }: AppParams) {
    this.container = container;
    this.logger = logger;
    this.port = port;
    this.errorHandler = errorHandler;
    this.router = router;
    this.publicPath = publicPath;

    this.container.register(logger, { name: "logger", type: "value" });
  }

  public start() {
    return Bun.serve({
      port: this.port,
      fetch: async (request) => {
        const response = await this.handleRoute(request);
        if (!response) return await this.handleStaticFiles(request);
        return response;
      },
      error: async (error) => await this.handleError(error),
    });
  }

  private async handleError(error: Errorlike) {
    const context = this.container.createScope();
    context.register(error, { name: "error", type: "value" });
    return await context.build<Promise<Response>>(this.errorHandler);
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
    return await context.build<Promise<Response>>(route.handler);
  }

  private async handleStaticFiles(request: Request) {
    const url = new URL(request.url)
    const filePath = this.publicPath + url.pathname;
    const file = Bun.file(filePath);
    return new Response(file);
  }
}
