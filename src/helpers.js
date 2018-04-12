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
export const atLeastOneOf = (...fields) => {
  return (val, params) => {
    const values = fp.map((k) => params[k], fields);
    const allPassed = fp.reduce((acc, item) => {
      return acc || !fp.isEmpty(item);
    }, false, values);
    if (allPassed) return;
    return 'At least one of ' + fields.join(', ') + ' must be provided';
  };
};

/**
 * check id exists by service
 */
export const idExists = (service, id, message) => async (val, params) => {
  if (fp.is(Array, id)) {
    const ids = fp.reject(fp.isNil, fp.values(fp.pick(id, params)));
    const items = await service.find({
      query: { _id: { $in: ids } },
      paginate: false
    });
    if (fp.isEmpty(items)) return message;
  } else {
    const item = await service.get(params[id]);
    if (!item) return message;
  }
};