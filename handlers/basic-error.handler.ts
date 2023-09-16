export default async function basicErrorHandler() {
  return new Response("Woops something wen't wrong", { status: 500 })
}
