import { BadRequest } from 'feathers-errors';
import fp from 'mostly-func';

import Validation from '../validation';

export default function validate (accepts) {
  return async (context) => {
    if (typeof accepts === 'function') {
      accepts = accepts(context);
    }
    const action = context.params.action || context.method;
    if (!accepts[action]) return context;

    let errors = null;
    switch (context.method) {
      case 'find':
      case 'get':
      case 'remove':
        if (accepts[action]) {
          const query = fp.assoc('id', context.id, context.params.query || {});
          errors = await Validation(query, accepts[action]);
        }
        break;
      case 'create':
        if (accepts[action]) {
          const data = fp.assoc('primary', context.params.primary, context.data || {});
          errors = await Validation(data, accepts[action]);
        }
        break;
      case 'update':
      case 'patch':
        if (accepts[action]) {
          const data = fp.assoc('primary', context.params.primary,
                       fp.assoc('id', context.id, context.data || {}));
          errors = await Validation(data, accepts[action]);
        }
        break;
    }
    if (errors && errors.any()) {
      if (context.data) {
        context.data.errors = errors.toHuman();
      }
      throw new BadRequest('Validation failed: ' + errors.toHuman());
    }
    return context;
  };
}