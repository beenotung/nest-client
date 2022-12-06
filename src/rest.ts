import { postMultipartFormData } from '@beenotung/tslib/form';
import axios, { AxiosInstance, Method } from 'axios';
import {
  bodies,
  getControllerMethodParams,
  getControllerMethodPath,
  getControllerPath,
  getFileFieldName,
  hasControllerMethodParams,
  hasControllerMethodPath,
  hasFileFieldName,
  params,
  setControllerMethodParam,
  setControllerMethodPath,
  setControllerPath,
  setFileFieldName,
} from './rest-states';
import { functionParams, mapGetOrSet } from './utils';

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
  axiosInstance?: AxiosInstance;
}

export function injectNestClient (
  instance: object,
  options?: NestClientOptions,
) {
  const axiosInstance: AxiosInstance = options.axiosInstance || axios;
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
    const restfulMethod = restMethod.name.toLowerCase() as Method;
    if (!axiosInstance[restfulMethod]) {
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
      if (hasFileFieldName(target, method)) {
        if (restfulMethod !== 'post') {
          console.warn(
            'file must be sent via POST multipart-form, but the restfulMethod is',
            restfulMethod,
            '. auto switching to POST multipart-form',
          );
        }
        return postMultipartFormData(url, data).then((res) => {
          if (200 <= res.status && res.status < 300) {
            try {
              return JSON.parse(res.data.toString());
            } catch (e) {
              return res.data;
            }
          } else {
            return Promise.reject(res);
          }
        });
      }
      return axiosInstance
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

/* for multi-part form post to upload file(s) */
export type Interceptor = (
  target: object,
  method?: PropertyKey,
  descriptor?: any,
) => void;
export function UseInterceptors (...interceptors: Interceptor[]) {
  return function (target: object, key?: string, descriptor?: any) {
    interceptors.forEach((interceptor) => interceptor(target, key, descriptor));
  };
}

/* target -> method -> listener[] */
const fileHook = new Map<object, Map<PropertyKey, Array<() => void>>>();

function addFileHook (
  target: object,
  method: PropertyKey,
  listener: () => void,
) {
  mapGetOrSet(
    mapGetOrSet(fileHook, target, () => new Map()),
    method,
    () => [],
  ).push(listener);
}

function triggerFileHook (target: object, method: PropertyKey) {
  mapGetOrSet(
    mapGetOrSet(fileHook, target, () => new Map()),
    method,
    () => [],
  ).forEach((listener) => listener());
}

export function FileInterceptor (
  fieldName: string,
  localOptions?: object,
): Interceptor {
  return function (target: object, method: PropertyKey, descriptor?: any) {
    setFileFieldName(target, method, fieldName);
    triggerFileHook(target, method);
  };
}

export function FilesInterceptor (
  fieldName: string,
  localOptions?: object,
): Interceptor {
  return function (target: object, method: PropertyKey, descriptor?: any) {
    setFileFieldName(target, method, fieldName);
    triggerFileHook(target, method);
  };
}

export interface MulterField {
  name: string
  maxCount?: number
}

export function FileFieldsInterceptor (
  uploadFields: MulterField[],
  localOptions?: object,
): Interceptor {
  return function (target: object, method: PropertyKey, descriptor?: any) {
    uploadFields.forEach(field => {
      setFileFieldName(target, method, field.name)
      triggerFileHook(target, method)
    })
  }
}

export function UploadedFile () {
  return function (target: object, method: PropertyKey, paramIdx: number) {
    const funcParams = functionParams(target[method]);
    const funcParamName = funcParams[paramIdx];
    addFileHook(target, method, () => {
      const fieldName = getFileFieldName(target, method);
      return setControllerMethodParam(
        bodies,
        target,
        method,
        paramIdx,
        funcParamName,
        fieldName,
      );
    });
  };
}

export function UploadedFiles () {
  return function (target: object, method: PropertyKey, paramIdx: number) {
    const funcParams = functionParams(target[method]);
    const funcParamName = funcParams[paramIdx];
    addFileHook(target, method, () => {
      const fieldName = getFileFieldName(target, method);
      return setControllerMethodParam(
        bodies,
        target,
        method,
        paramIdx,
        funcParamName,
        fieldName,
      );
    });
  };
}
