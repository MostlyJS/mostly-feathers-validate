import { BadRequest } from 'feathers-errors';
import fp from 'mostly-func';

import Validation from '../validation';

export default function validate (accepts) {
  return async (context) => {
    if (typeof accepts === 'function') {
      accepts = accepts(context);
    }
    const action = context.params.__action || context.method;
    if (!accepts[action]) return context;

    let errors = null;
    switch (context.method) {
      case 'find':
      case 'get':
      case 'remove':
        if (accepts[action]) {
          const params = fp.assoc('id', context.id, context.params);
          errors = await Validation(params, accepts[action]);
        }
        break;
      case 'create':
      case 'update':
      case 'patch':
        if (accepts[action]) {
          const data = fp.assoc('id', context.id, context.data);
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