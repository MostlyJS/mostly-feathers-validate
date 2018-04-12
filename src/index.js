import { BadRequest } from 'feathers-errors';

import sanitize from './hooks/sanitize';
import validate from './hooks/validate';
import Sanitization from './sanitization';
import Validation from './validation';
import * as helpers from './helpers';

export default { sanitize, validate, Sanitization, Validation, helpers };