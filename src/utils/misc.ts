type TAllKeys<T> = T extends unknown ? keyof T : never;

type TIndexValue<T, K extends PropertyKey, D = never> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : D
  : never;

type TPartialKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>> extends infer O
  ? { [P in keyof O]: O[P] }
  : never;

type TFunction = (...a: unknown[]) => unknown;

type TPrimitives =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | Date
  | TFunction;

type TMerged<T> = [T] extends [Array<unknown>]
  ? { [K in keyof T]: TMerged<T[K]> }
  : [T] extends [TPrimitives]
    ? T
    : [T] extends [object]
      ? TPartialKeys<{ [K in TAllKeys<T>]: TMerged<TIndexValue<T, K>> }, never>
      : T;

function isObject(obj: unknown): boolean {
  if (typeof obj === 'object' && obj !== null) {
    if (typeof Object.getPrototypeOf === 'function') {
      const prototype = Object.getPrototypeOf(obj);
      return prototype === Object.prototype || prototype === null;
    }

    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  return false;
}

interface IObject {
  [key: string]: unknown;
}

function merge<T extends IObject[]>(...objects: T): TMerged<T[number]> {
  return objects.reduce((result, current) => {
    if (Array.isArray(current)) {
      throw new TypeError(
        'Arguments provided to ts-deepmerge must be objects, not arrays.',
      );
    }

    Object.keys(current).forEach((key) => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        return;
      }

      if (Array.isArray(result[key]) && Array.isArray(current[key])) {
        result[key] = Array.from(
          new Set((result[key] as unknown[]).concat(current[key] as unknown[])),
        );
      } else if (isObject(result[key]) && isObject(current[key])) {
        result[key] = merge(result[key] as IObject, current[key] as IObject);
      } else {
        result[key] = current[key];
      }
    });

    return result;
  }, {}) as TMerged<T[number]>;
}

// eslint-disable-next-line import/prefer-default-export
export { merge };
