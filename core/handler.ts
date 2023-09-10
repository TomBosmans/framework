export default interface Handler {
  async (...args: any[]): Promise<Response>
}
