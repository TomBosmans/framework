import Container, { RegisterData } from "../core/container";

type ClassType<T> = new (...args: any[]) => T;
type FunctionType<T> = (...args: any[]) => T;
type RegisterItem = { type: RegisterData["type"]; registration: unknown };
type Registry = Record<string, RegisterItem>;

export default class BasicContainer implements Container {
  private registry: Registry = {};

  constructor(registry: Registry = {}) {
    this.registry = registry;
  }

  public register<T>(registration: T, { name, type = "class" }: RegisterData) {
    this.registry[name] = {
      type,
      registration,
    };
  }

  public resolve<T>(name: string): T {
    const match = this.registry[name];
    if (!match) throw new Error(`Dependency not found: ${name}`);
    const { type, registration } = match;

    if (type === "class") {
      const dependencies = this.resolveDependencies(registration);
      const classRegistration = registration as ClassType<T>;
      return new classRegistration(...dependencies);
    }
    if (type === "function") {
      const dependencies = this.resolveDependencies(registration);
      const functionRegistration = registration as FunctionType<T>;
      return functionRegistration(...dependencies);
    }
    return registration as T;
  }

  public build<T>(resolver: ClassType<T> | FunctionType<T>) {
    const dependencies = this.resolveDependencies(resolver);
    const isFunction =
      typeof resolver === "function" && resolver instanceof Function;

    if (isFunction) {
      const functionResolver = resolver as FunctionType<T>;
      return functionResolver(...dependencies);
    } else {
      const classResolver = resolver as ClassType<T>;
      return new classResolver(...dependencies);
    }
  }

  public createScope() {
    const copyRegistry = { ...this.registry };
    return new BasicContainer(copyRegistry);
  }

  public dispose() {}

  public loadModules(modules: string[]) {
    console.log(modules);
  }

  public registrations(pattern?: RegExp) {
    if (!pattern) return Object.keys(this.registry);
    return Object.keys(this.registry).filter((name) => pattern.test(name));
  }

  private resolveDependencies(constructor: any) {
    const parameterNames = this.getParameterNames(constructor);
    const dependencies = parameterNames.map((paramName) =>
      this.resolve(paramName),
    );
    return dependencies;
  }

  private getParameterNames(func: Function) {
    // Use a regular expression to extract parameter names from a function's source code.
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
    const ARGUMENT_NAMES = /([^\s,]+)/g;
    const fnStr = func.toString().replace(STRIP_COMMENTS, "");
    const result = fnStr
      .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
      .match(ARGUMENT_NAMES);
    return result || [];
  }
}
