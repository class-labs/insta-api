import * as rt from 'runtypes';

type Runtypes = typeof rt;

export function schema<T>(fn: (rt: Runtypes) => T): T {
  return fn(rt);
}
