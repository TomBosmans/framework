export type RegisterData = {
  name: string
  type?: "value" | "function" | "class"
}

export default interface Container {
  register<Registration>(registration: Registration, { name, type }: RegisterData): void
  resolve<T>(name: RegisterData["name"]): T
  build<T>(registration: unknown): T
  createScope(): Container
  dispose(): void
  loadModules(modules: string[]): void
  registrations(pattern: RegExp): string[]
}
