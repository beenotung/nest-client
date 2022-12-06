export const genMap = () => new Map();

export function mapGetOrSet<K, V>(map: Map<K, V>, key: K, f: () => V) {
  if (map.has(key)) {
    return map.get(key);
  }
  if (!f) {
    console.error("failed to find", key, "in", map);
    throw new Error("value not found in map");
  }
  const value = f();
  map.set(key, value);
  return value;
}

export function chainF(f: Function, acc: any, argsList: any[][]) {
  /*
  if (argsList.length === 0) {
    throw new Error('no args List');
  }
  */
  for (const args of argsList) {
    acc = f(acc, ...args);
  }
  return acc;
}

export function functionParams(f: Function): string[] {
  const ps = f
    .toString()
    .split(")")[0]
    .split("(")[1]
    .split(",")
    .map(s => s.trim());
  return ps.length === 1 && ps[0] === "" ? [] : ps;
}
