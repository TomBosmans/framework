import Route from "../core/route";

export default function testRoute() {
  return new Route({
    method: "GET",
    path: "/",
    handler: () => new Response("hello world!")
  })
}
