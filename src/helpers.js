import fp from 'mostly-func';
import util from 'util';

/**
 * Check value is in an array
 */
export const isIn = (name, array, message) => {
  var newArray = Array.isArray(array) ? array : Object.keys(array);
  return { args: [newArray], message: message || util.format('%s is invalid', name) };
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
  if (fp.isArray(id)) {
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


/**
 * Check props exists by service
 */
export const propExists = (service, { id, path, prop, select = '*' }, message) => async (val, params) => {
  if (!path) return 'property path is empty';
  const item = await service.get(params[id], { query: { $select: select } });
  const target = fp.dotPath(path, item);
  if (target) {
    if (fp.isArray(target)) {
      if (prop) {
        if (fp.find(fp.propEq(prop, val), target)) return;
      } else {
        if (fp.contains(val, target)) return;
      }
    } else {
      if (prop) {
        if (fp.propEq(prop, val, target)) return;
      } else {
        if (fp.equals(val, target)) return;
      }
    }
  }
  return message;
};