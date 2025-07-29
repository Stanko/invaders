import mem from 'mem';

export default function memoize(fn: (...args: unknown[]) => any) {
  return mem(fn, {
    cacheKey: (args) => {
      const key = args
        .map((arg) => {
          if (typeof arg === 'function') {
            const fn = arg as any;
            return fn.displayName ? fn.displayName : arg.toString();
          } else {
            return JSON.stringify(arg);
          }
        })
        .join(',');

      return key;
    },
  });
}
