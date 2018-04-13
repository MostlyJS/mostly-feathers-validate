import makeDebug from 'debug';
import { Dynamic } from 'mostly-entity';
import fp from 'mostly-func';

const debug = makeDebug('mostly:feathers-validate:dynamic');

// Use dynamic to coerce a value or array of values.
function dynamic (val, toType, opts) {
  if (Array.isArray(val)) {
    return fp.map((v) => {
      return dynamic(v, toType, opts);
    }, val);
  }
  return (new Dynamic(val, opts)).to(toType);
}

/*!
 * Integer test regexp.
 */
const isint = /^[0-9]+$/;

/*!
 * Float test regexp.
 */
const isfloat = /^([0-9]+)?\.[0-9]+$/;

/*!
 * excape RegExp string
 */
const escapeRegex = function (d) {
  // see http://stackoverflow.com/a/6969486/69868
  return d.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

function coerce (str) {
  if (typeof str !== 'string') return str;
  if ('null' === str) return null;
  if ('true' === str) return true;
  if ('false' === str) return false;
  if (isfloat.test(str)) return parseFloat(str, 10);
  if (isint.test(str) && str.charAt(0) !== '0') return parseInt(str, 10);
  return str;
}

// coerce every string in the given object / array
function coerceAll (obj) {
  const type = Array.isArray(obj) ? 'array' : typeof obj;

  switch (type) {
    case 'string':
      return coerce(obj);
    case 'object':
      if (obj) {
        const props = Object.keys(obj);
        for (let i = 0, n = props.length; i < n; i++) {
          const key = props[i];
          obj[key] = coerceAll(obj[key]);
        }
      }
      break;
    case 'array':
      for (let i = 0, n = obj.length; i < n; i++) {
        coerceAll(obj[i]);
      }
      break;
  }

  return obj;
}

export default async function normalize (params, accepts, options = { delimiters: ',' }) {
  params = params || {};
  accepts = accepts || [];

  const buildAll = fp.flatMap(async (accept) => {
    const name = accept.arg || accept.name;
    let val = params[name];

    // Support array types, such as ['string']
    const isArrayType = Array.isArray(accept.type);
    let otype = isArrayType ? accept.type[0] : accept.type;
    otype = (typeof otype === 'string') && otype.toLowerCase();
    const isAny = !otype || otype === 'any';

    // Safe to coerce the contents of this
    if (typeof val === 'object' && (!isArrayType || isAny)) {
      val = coerceAll(val);
    }

    // If we expect an array type and we received a string, parse it with JSON.
    // If that fails, parse it with the delimiters option.
    if (val && typeof val === 'string' && isArrayType) {
      var parsed = false;
      if (val[0] === '[') {
        try {
          val = JSON.parse(val);
          parsed = true;
        } catch (e) {
          debug('Parse JSON as array error:', e);
        }
      }
      if (!parsed && options.delimiters) {
        val = fp.split(options.delimiters, val);
      }
    }

    // Coerce dynamic args when input is a string.
    if (isAny && typeof val === 'string') {
      val = coerceAll(val);
    }

    // If the input is not an array, but we were expecting one, create
    // an array. Create an empty array if input is empty.
    if (!Array.isArray(val) && isArrayType) {
      if (val !== undefined && val !== '') val = [val];
      else val = [];
    }

    // For boolean and number types, convert certain strings to that type.
    // The user can also define new dynamic types.
    if (fp.isNotNil(val) && Dynamic.canConvert(otype)) {
      val = dynamic(val, otype, params);
    }

    if (fp.isNil(val) && accept.hasOwnProperty('default')) {
      if (fp.isFunction(accept.default)) {
        try {
          val = await accept.default(params);
        } catch (e) {
          debug('Error: \'%s\' when calling default function of \'%s\'', e.message, name);
        }
      } else {
        val = accept.default;
      }
    }

    // set the params value
    params[name] = val;
  });
  await Promise.all(buildAll(accepts));

  return params;
}