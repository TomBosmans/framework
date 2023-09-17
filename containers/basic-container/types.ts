import { RegisterData } from "../../core/container";

export type ClassType<T> = new (...args: any[]) => T;
export type FunctionType<T> = (...args: any[]) => T;
export type RegisterItem = {
  type: RegisterData["type"];
  registration: unknown;
};
export type Registry = Record<string, RegisterItem>;
