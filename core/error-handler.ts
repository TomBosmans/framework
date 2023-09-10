export default interface ErrorHandler {
  async (...args: any[]): Promise<Response>
}
