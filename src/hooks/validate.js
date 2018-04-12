import { BadRequest } from 'feathers-errors';

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
          errors = await Validation(context.params, accepts[action]);
        }
        break;
      case 'create':
      case 'update':
      case 'patch':
        if (accepts[action]) {
          errors = await Validation(context.data, accepts[action]);
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