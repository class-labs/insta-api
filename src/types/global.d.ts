/* eslint-disable @typescript-eslint/no-explicit-any */
type Reviver = (this: any, key: string, value: any) => any;
type Replacer = (this: any, key: string, value: any) => any;

declare global {
  type ObjectOf<T> = {
    [key: string]: T;
  };

  type JsonValue =
    | null
    | boolean
    | number
    | string
    | Array<JsonValue>
    | { [key: string]: JsonValue };

  type JsonObject = { [key: string]: JsonValue };

  interface JSON {
    parse(text: string, reviver?: Reviver): JsonValue;
    stringify<T>(
      value: T,
      replacer?: Replacer | Array<number | string> | null,
      space?: string | number,
    ): undefined extends T
      ? T extends undefined
        ? undefined
        : string | undefined
      : string;
  }

  interface ObjectConstructor {
    keys<T>(
      o: T,
    ): T extends Record<string, unknown>
      ? Array<keyof T & string>
      : Array<string>;
  }

  // This is used to "expand" an intersection of two or more objects when
  // displayed in tooltips, for example `Expand<{ a: string } & { b: string }>`
  // will expand to `{ a: string, b: string }`
  // Reference: https://stackoverflow.com/a/57683652
  type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
}

export {};
