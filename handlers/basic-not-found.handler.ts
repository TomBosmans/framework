export default async function basicNotFouncHandler() {
  return new Response("Not found", { status: 404 });
}
