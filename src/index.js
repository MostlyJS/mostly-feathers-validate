import { BadRequest } from 'feathers-errors';

import validate from './hooks/validate';
import Validation from './validation';

export default { validate, Validation };