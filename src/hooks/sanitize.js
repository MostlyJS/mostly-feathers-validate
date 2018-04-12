import { BadRequest } from 'feathers-errors';

import Sanitization from '../sanitization';

export default function sanitizate (accepts) {
  return async (context) => {
    if (typeof accepts === 'function') {
      accepts = accepts(context);
    }
    const action = context.params.__action || context.method;
    if (!accepts[action]) return context;

    switch (context.method) {
      case 'find':
      case 'get':
      case 'remove':
        if (accepts[action]) {
          context.params = await Sanitization(context.params, accepts[action]);
        }
        break;
      case 'create':
      case 'update':
      case 'patch':
        if (accepts[action]) {
          context.data = await Sanitization(context.data, accepts[action]);
        }
        break;
    }
    return context;
  };
}