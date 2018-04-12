import fp from 'mostly-func';
import util from 'util';

/**
 * Check value is in an array
 */
export const isIn = (name, array) => {
  var newArray = Array.isArray(array) ? array : Object.keys(array);
  return { args: [newArray], message: util.format('%s is invalid', name) };
};

/**
 * Check at least one of argument must be provided
 */
export const atLeastOneOf = () => {
  const _arguments = Array.prototype.slice.call(arguments);
  return (val, args) => {
    const values = fp.map((k) => _arguments[k], args);
    const allPassed = fp.reduce((acc, item) => {
      return acc || !fp.isEmpty(item);
    }, values);
    if (allPassed) return;
    return 'At least one of ' + _arguments.join(', ') + ' must be provided';
  };
};

/**
 * check id exists by service
 */
export const idExists = (service, id, message) => async (val, params) => {
  const item = await service.get(params[id]);
  if (!item) return message;
};