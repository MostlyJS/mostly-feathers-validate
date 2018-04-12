import makeDebug from 'debug';
import fp from 'mostly-func';
import __validator__ from 'validator';
import util from 'util';

const debug = makeDebug('mostly:feathers-validate:validate');

/**
 * A collection of validators
 */
function Validator () {}

// Validators from `__validator__`
[
  'contains',
  'equals',
  'isAfter',
  'isAlpha',
  'isAlphanumeric',
  'isAscii',
  'isBase64',
  'isBefore',
  'isBoolean',
  'isByteLength',
  'isCreditCard',
  'isCurrency',
  'isDate',
  'isDivisibleBy',
  'isEmail',
  'isFQDN',
  'isFloat',
  'isFullWidth',
  'isHalfWidth',
  'isHexColor',
  'isHexadecimal',
  'isIP',
  'isISBN',
  'isISIN',
  'isIn',
  'isInt',
  'isJSON',
  'isLength',
  'isLowercase',
  'isMobilePhone',
  'isMongoId',
  'isMultibyte',
  'isNull',
  'isNumeric',
  'isSurrogatePair',
  'isURL',
  'isUUID',
  'isUppercase',
  'isVariableWidth',
  'matches'
].forEach(function (name) {
  if (typeof __validator__[name] === 'function') {
    Validator[name] = async function () {
      return __validator__[name].apply(__validator__, arguments);
    };
  }
});

/**
 * A wrapper to collect validation errors
 * @class
 */
class ValidationError {
  constructor () {
    this._errors = {};
  }

  /**
   * add a new validation error
   * {
   *   email: { isEmail: 'not a valid email' }
   * }
   */
  add (name, validatorName, msg) {
    msg = msg || this.defaultMessage(name, validatorName);
    let obj = this._errors[name] || {};
    obj[validatorName] = msg;
    this._errors[name] = obj;
  }


  /**
   * To human readable format
   *   example:  email is not a valid; name is required
   */
  toHuman () {
    return this.flatten().join('; ');
  }

  /**
   * Flatten Error Message
   *   example:  ['email is not a valid', 'name is required']
   */
  flatten () {
    const messages = fp.flatMap(([name, obj]) => {
      return fp.map(([validatorName, msg]) => {
        return msg && msg.toString() || this.defaultMessage(name, validatorName);
      }, fp.toPairs(obj));
    }, fp.toPairs(this._errors));
    return messages;
  }

  /**
   * To JSON  format
   */
  asJSON () {
    return this._errors;
  }

  /**
   * Default message format
   */
  defaultMessage (name, validatorName) {
    return util.format('%s: \'%s\' validation failed', name, validatorName);
  }

  /**
   * Check if there exists any error
   */
  any () {
    return !fp.isEmpty(this._errors);
  }

}

/**
 * Validate all params with its corresponding validators
 *
 * A collection of validators from chriso's [validator.js](https://github.com/chriso/validator.js)
 *
 * All built-in validators are listed below:
 *
 * - contains(str, seed) - check if the string contains the seed.
 * - equals(str, comparison) - check if the string matches the comparison.
 * - isAfter(str [, date]) - check if the string is a date that's after the specified date (defaults to now).
 * - isAlpha(str) - check if the string contains only letters (a-zA-Z).
 * - isAlphanumeric(str) - check if the string contains only letters and numbers.
 * - isAscii(str) - check if the string contains ASCII chars only.
 * - isBase64(str) - check if a string is base64 encoded.
 * - isBefore(str [, date]) - check if the string is a date that's before the specified date.
 * - isBoolean(str) - check if a string is a boolean.
 * - isByteLength(str, min [, max]) - check if the string's length (in bytes) falls in a range.
 * - isCreditCard(str) - check if the string is a credit card.
 * - isCurrency(str, options) - check if the string is a valid currency amount. `options` is an object which defaults to `{symbol: '$', require_symbol: false, allow_space_after_symbol: false, symbol_after_digits: false, allow_negatives: true, parens_for_negatives: false, negative_sign_before_digits: false, negative_sign_after_digits: false, allow_negative_sign_placeholder: false, thousands_separator: ',', decimal_separator: '.', allow_space_after_digits: false }`.
 * - isDate(str) - check if the string is a date.
 * - isDivisibleBy(str, number) - check if the string is a number that's divisible by another.
 * - isEmail(str [, options]) - check if the string is an email. `options` is an object which defaults to `{ allow_display_name: false, allow_utf8_local_part: true, require_tld: true }`. If `allow_display_name` is set to true, the validator will also match `Display Name <email-address>`. If `allow_utf8_local_part` is set to false, the validator will not allow any non-English UTF8 character in email address' local part. If `require_tld` is set to false, e-mail addresses without having TLD in their domain will also be matched.
 * - isFQDN(str [, options]) - check if the string is a fully qualified domain name (e.g. domain.com). `options` is an object which defaults to `{ require_tld: true, allow_underscores: false, allow_trailing_dot: false }`.
 * - isFloat(str [, options]) - check if the string is a float. `options` is an object which can contain the keys `min` and/or `max` to validate the float is within boundaries (e.g. `{ min: 7.22, max: 9.55 }`).
 * - isFullWidth(str) - check if the string contains any full-width chars.
 * - isHalfWidth(str) - check if the string contains any half-width chars.
 * - isHexColor(str) - check if the string is a hexadecimal color.
 * - isHexadecimal(str) - check if the string is a hexadecimal number.
 * - isIP(str [, version]) - check if the string is an IP (version 4 or 6).
 * - isISBN(str [, version]) - check if the string is an ISBN (version 10 or 13).
 * - isISIN(str) - check if the string is an [ISIN][ISIN] (stock/security identifier).
 * - isIn(str, values) - check if the string is in a array of allowed values.
 * - isInt(str [, options]) - check if the string is an integer. `options` is an object which can contain the keys `min` and/or `max` to check the integer is within boundaries (e.g. `{ min: 10, max: 99 }`).
 * - isJSON(str) - check if the string is valid JSON (note: uses JSON.parse).
 * - isLength(str, min [, max]) - check if the string's length falls in a range. Note: this function takes into account surrogate pairs.
 * - isLowercase(str) - check if the string is lowercase.
 * - isMobilePhone(str, locale) - check if the string is a mobile phone number, (locale is one of `['zh-CN', 'en-ZA', 'en-AU', 'en-HK', 'pt-PT', 'fr-FR', 'el-GR', 'en-GB', 'en-US', 'en-ZM', 'ru-RU']`).
 * - isMongoId(str) - check if the string is a valid hex-encoded representation of a [MongoDB ObjectId][mongoid].
 * - isMultibyte(str) - check if the string contains one or more multibyte chars.
 * - isNull(str) - check if the string is null.
 * - isNumeric(str) - check if the string contains only numbers.
 * - isSurrogatePair(str) - check if the string contains any surrogate pairs chars.
 * - isURL(str [, options]) - check if the string is an URL. `options` is an object which defaults to `{ protocols: ['http','https','ftp'], require_tld: true, require_protocol: false, allow_underscores: false, host_whitelist: false, host_blacklist: false, allow_trailing_dot: false, allow_protocol_relative_urls: false }`.
 * - isUUID(str [, version]) - check if the string is a UUID (version 3, 4 or 5).
 * - isUppercase(str) - check if the string is uppercase.
 * - isVariableWidth(str) - check if the string contains a mixture of full and half-width chars.
 * - matches(str, pattern [, modifiers]) - check if string matches the pattern. Either `matches('foo', /foo/i)` or `matches('foo', 'foo', 'i')`.
 *
 * ValidationError will be returned if there is any validators failed
 *
 * @param {Object} params
 * Parameters about to validating
 *
 * Example:
 *
 * ``` javascript
 * {
 *  name: 'Dummy',
 *  age: 25,
 *  email: 'dummy@gmail.com'
 * }
 * ```
 *
 * @param {Object} accepts
 * Conditions that define which parameter can be accepted
 *
 * Example:
 *
 * ``` javascript
 * [
 *   { arg: 'name', validates: { required: true } },
 *   { arg: 'age', validates: { required: true, isInt: true }
 *   { arg: 'email', validates: { isEmail: true }
 * ]
 * ```
 */
export default async function Validation (params, accepts) {

  let validationError = new ValidationError();
  params = params || {};
  accepts = accepts || [];

  const performValidator = async function (name, val, validatorName, validatorOpts) {
    if (!validatorOpts) return;

    // if validator is a custom function, then execute it
    if (fp.isFunction(validatorOpts)) {
      try {
        const result = await validatorOpts(val, params);
        if (result) {
          validationError.add(name, validatorName, result);
        }
      } catch (e) {
        debug('Error: \'%s\' when calling function \'%s\'', e.message, validatorName);
      }
    }
    // else find cooresponding validator in built in Validator
    else {
      const validator = Validator[validatorName];
      let args = [val];

      const message = fp.is(String, validatorOpts)? validatorOpts : validatorOpts.message;

      // build arguments for validator
      if (validatorOpts && validatorOpts.args) {
        args.push(validatorOpts.args);
        args = fp.flatten(args);
      }

      if (validator && fp.isFunction(validator)) {
        // if validation failed, then add error message
        if (!validator.apply(Validator, args)) {
          validationError.add(name, validatorName, message);
        }
      } else {
        debug('Validator \'%s\' is not defined', validatorName);
      }
    }
  };

  const validateAll = fp.flatMap((accept) => {
    const name = accept.arg || accept.name;
    const val = params[name];

    const validators = fp.assign({}, accept.validates);

    // copy `required` from accept to validators
    if (accept.hasOwnProperty('required')) {
      validators.required = accept.required;
    }

    if (validators && fp.isPlainObject(validators)) {
      if (fp.isNil(val)) {
        // check if value exists, if not, then check whether the value is required
        if (validators.hasOwnProperty('required')) {
          return performValidator(name, val, 'required', validators.required);
        }
      } else {
        // delete `required` validator for latter iteration
        delete validators.required;
        return fp.map(([validatorName, validatorOpts]) => {
          return performValidator(name, val, validatorName, validatorOpts);
        }, fp.toPairs(validators));
      }
    } else {
      debug(' ** invalid validators', validators);
    }
  });
  await Promise.all(validateAll(accepts));

  return validationError;
}

/**
 * Port to add new validation func without violate __validator__
 *
 * Example:
 *
 * ``` javascript
 * Validate.extend('atLeastOneExists', function() {
 *   let args = [].slice(arguments);
 *   let result = false;
 *   args.forEach(function(arg) {
 *     if (arg) {
 *       result = true;
 *     }
 *   });
 *   return result;
 * });
 * ```
 */
Validation.extend = function (name, fn) {
  Validator[name] = async function () {
    let args = Array.prototype.slice.call(arguments);
    args[0] = __validator__.toString(args[0]);
    return fn.apply(Validator, args);
  };
};

/*!
 * For test usage, get method from Validator
 *
 * Example:
 *
 * ``` javascript
 * Validate.method('contains');
 * ```
 */
Validation.method = function (name) {
  return Validator[name];
};


/*!
 * Add default validator `required`
 */
Validation.extend('required', function (val) {
  return fp.isValid(val);
});