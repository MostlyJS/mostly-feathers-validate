import { BadRequest } from 'feathers-errors';

import Sanitization from '../sanitization';

export default function sanitizate (accepts) {
  return async (hook) => {
    if (typeof accepts === 'function') {
      accepts = accepts(hook);
    }
    const action = hook.params.__action || hook.method;
    if (!accepts[action]) return hook;

    switch (hook.method) {
      case 'find':
      case 'get':
      case 'remove':
        if (accepts[action]) {
          hook.params = await Sanitization(hook.params, accepts[action]);
        }
        break;
      case 'create':
      case 'update':
      case 'patch':
        if (accepts[action]) {
          hook.data = await Sanitization(hook.data, accepts[action]);
        }
        break;
    }
    return hook;
  };
}