import axios from 'axios';
import {
  bodies,
  getControllerMethodParams,
  getControllerMethodPath,
  getControllerPath,
  hasControllerMethodParams,
  hasControllerMethodPath,
  params,
  setControllerMethodParam,
  setControllerMethodPath,
  setControllerPath,
} from './rest-states';
import { functionParams } from './utils';

let defaultBaseUrl = '';

export function setBaseUrl (url: string) {
  if (url.endsWith('/')) {
    url = url.substr(0, url.length - 1);
  }
  defaultBaseUrl = url;
}

export function Controller (path: string) {
  return function (target: object) {
    setControllerPath(target, path);
  };
}

function restMethod (name: string) {
  const f = function (path: string) {
    return function (target: object, method: PropertyKey) {
      setControllerMethodPath(target, method, f, path);
    };
  };
  Object.defineProperty(f, 'name', { value: name, writable: false });
  return f;
}

/*
export function Res() {
  return function (target, method, param) {
  }
}
*/

export function Param (restParamName: string) {
  return function (target: object, method: PropertyKey, paramIdx: number) {
    const funcParams = functionParams(target[method]);
    const funcParamName = funcParams[paramIdx];
    setControllerMethodParam(
      params,
      target,
      method,
      paramIdx,
      funcParamName,
      restParamName,
    );
  };
}

export function Body (bodyName?: string) {
  return function (target: object, method: PropertyKey, paramIdx: number) {
    const funcParams = functionParams(target[method]);
    const funcParamName = funcParams[paramIdx];
    setControllerMethodParam(
      bodies,
      target,
      method,
      paramIdx,
      funcParamName,
      bodyName,
    );
  };
}

export interface NestClientOptions {
  allowNonRestMethods?: false | boolean;
  baseUrl?: string;
}

export function injectNestClient (
  instance: object,
  options?: NestClientOptions,
) {
  const target = Object.getPrototypeOf(instance);
  const controllerPath = getControllerPath(target.constructor);
  for (const method of Object.getOwnPropertyNames(target)) {
    if (method === 'constructor') {
      continue;
    }
    if (
      options &&
      options.allowNonRestMethods &&
      !hasControllerMethodPath(target, method)
    ) {
      continue;
    }
    const [restMethod, methodPath] = getControllerMethodPath(target, method);
    const restfulMethod = restMethod.name.toLowerCase();
    if (!axios[restfulMethod]) {
      console.error('unsupported restful method of', restfulMethod);
      throw new Error('unsupported restful method');
    }
    const restUrl = ('/' + controllerPath + '/' + methodPath).replace(
      /\/\//g,
      '/',
    );
    const oriMethod = instance[method];
    const oriParams = functionParams(oriMethod);
    instance[method] = function () {
      let localRestUrl = restUrl;
      let data = {};

      if (oriParams.length > 0) {
        let ps: Map<any, any>;
        if (hasControllerMethodParams(params, target, method)) {
          ps = params;
        } else if (hasControllerMethodParams(bodies, target, method)) {
          ps = bodies;
        } else {
          console.error('missing param decorators', {
            target: target.name,
            method,
            arguments,
          });
          throw new Error('missing param decorators');
        }

        /* for GET */
        const map = getControllerMethodParams(ps, target, method);
        for (let i = 0; i < arguments.length; i++) {
          const oriParamName = oriParams[i];
          const paramValue = arguments[i];
          const [paramName, restParamName] = map.get(i);
          if (paramName !== oriParamName) {
            console.warn('unmatched param name', { oriParamName, paramName });
          }

          /* for post */
          if (restParamName) {
            /* assigned named field on body */
            data[restParamName] = paramValue;
          } else {
            /* assign as the entire body */
            data = paramValue;
            continue;
          }

          /* for get */
          const idx = localRestUrl.indexOf(':' + restParamName);
          if (idx === -1) {
            continue;
          }
          switch (localRestUrl[idx + 1 + restParamName.length]) {
            case ':':
            case '/':
            case undefined:
              localRestUrl =
                localRestUrl.substring(0, idx) +
                encodeURI(paramValue) +
                localRestUrl.substring(idx + 1 + restParamName.length);
              break;
            default:
              console.error(
                `failed to replace ':${restParamName}' in '${localRestUrl}'`,
              );
              console.error(
                `next one is :'${
                  localRestUrl[idx + 1 + restParamName.length]
                }'`,
              );
              break;
          }
        }
      }

      let baseUrl = defaultBaseUrl;
      if (options && options.baseUrl) {
        baseUrl = options.baseUrl;
      }
      const url = baseUrl + localRestUrl;
      return axios
        .request({
          url,
          method: restfulMethod,
          data,
        })
        .then((response) => {
          if (200 <= response.status && response.status < 300) {
            return response.data;
          } else {
            return Promise.reject(response);
          }
        });
    }.bind(instance);
  }
}

/**@deprecated*/
export let injectMethods = injectNestClient;

/* without data */
export const Delete = restMethod('Delete');
export const Get = restMethod('Get');
export const Head = restMethod('Head');
export const Options = restMethod('Options');

/* with data */
export const Post = restMethod('Post');
export const Put = restMethod('Put');
export const Patch = restMethod('Patch');
