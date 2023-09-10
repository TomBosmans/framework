import Handler from "./handler"
import parsePath from "../utils/parse-paths"
import { HttpMethod } from "../constants"

type RouteParams = {
  path: string
  method: HttpMethod
  handler: Handler
}

export default class Route {
  public path: RouteParams["path"]
  public method: RouteParams["method"]
  public handler: RouteParams["handler"]
  public pathSegments: string[]

  constructor({ path, method, handler }: RouteParams) {
    this.path = path
    this.method = method
    this.handler = handler
    this.pathSegments = parsePath(path)
  }
}
