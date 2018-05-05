import { BadRequest } from 'feathers-errors';
import fp from 'mostly-func';

import Sanitization from '../sanitization';
import normalize from '../normalize';

export default function sanitizate (accepts) {
  return async (context) => {
    if (typeof accepts === 'function') {
      accepts = accepts(context);
    }
    const action = context.params.action || context.method;
    if (!accepts[action]) return context;

    switch (context.method) {
      case 'find':
      case 'get':
      case 'remove':
        if (accepts[action]) {
          const query = context.params.query || {};
          context.params.query = await normalize(query, accepts[action]);
          context.params.query = await Sanitization(context.params.query, accepts[action]);
        }
        break;
      case 'create':
        if (accepts[action]) {
          const data = fp.assoc('primary', context.params.primary, context.data || {});
          context.data = await normalize(data, accepts[action]);
          context.data = await Sanitization(data, accepts[action]);
        }
        break;
      case 'update':
      case 'patch':
        if (accepts[action]) {
          const data = fp.assoc('primary', context.params.primary,
                       fp.assoc('id', context.id, context.data || {}));
          context.data = await normalize(data, accepts[action]);
          context.data = await Sanitization(context.data, accepts[action]);
        }
        break;
    }
    return context;
  };
}