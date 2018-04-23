import { BadRequest } from 'feathers-errors';
import fp from 'mostly-func';

import Sanitization from '../sanitization';
import normalize from '../normalize';

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
          const params = context.id? fp.assoc('id', context.id, context.params) : context.params;
          context.params = await normalize(params, accepts[action]);
          context.params = await Sanitization(context.params, accepts[action]);
        }
        break;
      case 'create':
      case 'update':
      case 'patch':
        if (accepts[action]) {
          const data = context.id? fp.assoc('id', context.id, context.data) : context.data;
          context.data = await normalize(data, accepts[action]);
          context.data = await Sanitization(context.data, accepts[action]);
        }
        break;
    }
    return context;
  };
}