/**
 * internal states
 * */

/* class -> path */
import { chainF, genMap, mapGetOrSet } from './utils';

const controllers = new Map<object, string>();

/* class -> method -> rest method -> path */
const methods = new Map<object, Map<PropertyKey, Map<Function, string>>>();

/* class -> method -> paramIdx -> [paramName, restParamName] */
export const params = new Map<
  object,
  Map<PropertyKey, Map<number, [string, string]>>
>();

/* class -> method -> bodyIdx -> [bodyName, restBodyName] */
export const bodies = new Map<
  object,
  Map<PropertyKey, Map<number, [string, string]>>
>();

export function setControllerPath (target: object, path: string) {
  controllers.set(target, path);
}

export function getControllerPath (target: object): string {
  if (!controllers.has(target)) {
    console.error('controller', target, 'is not registered');
    throw new Error('unregistered controller');
  }
  return controllers.get(target);
}

export function setControllerMethodPath (
  target: object,
  method: PropertyKey,
  restMethod: Function,
  path: string,
) {
  const map = chainF(mapGetOrSet, methods, [
    [target, genMap],
    [method, genMap],
  ]) as Map<Function, string>;
  map.set(restMethod, path);
}

export function hasControllerMethodPath (
  target: object,
  method: PropertyKey,
): boolean {
  if (!methods.has(target)) {
    return false;
  }
  const m = methods.get(target);
  if (!m.has(method)) {
    return false;
  }
  return m.get(method).size > 0;
}

export function getControllerMethodPath (
  target: object,
  method: PropertyKey,
): [Function, string] {
  const map = chainF(mapGetOrSet, methods, [[target], [method]]) as Map<
    Function,
    string
  >;

  if (map.size < 1) {
    console.error('no method registered', { class: target, method });
    throw new Error('no method registered');
  }
  if (map.size > 1) {
    console.error('multiple methods registered', {
      class: target,
      method,
      methods: map.entries(),
    });
    throw new Error('multiple methods registered');
  }
  const [restMethod, methodPath] = map.entries().next().value;
  return [restMethod, methodPath];
}

export function setControllerMethodParam (
  params: Map<any, any>,
  target: object,
  method: PropertyKey,
  paramIdx: number,
  paramName: string,
  restParamName: string,
) {
  const map = chainF(mapGetOrSet, params, [
    [target, genMap],
    [method, genMap],
  ]) as Map<number, [string, string]>;
  map.set(paramIdx, [paramName, restParamName]);
}

export function hasControllerMethodParams (
  params: Map<any, any>,
  target: object,
  method: PropertyKey,
): boolean {
  if (!params.has(target)) {
    return false;
  }
  return (params.get(target) as Map<PropertyKey, any>).has(method);
}

export function getControllerMethodParams (
  params: Map<any, any>,
  target: object,
  method: PropertyKey,
): Map<number, [string, string]> {
  return chainF(mapGetOrSet, params, [[target], [method]]);
}
