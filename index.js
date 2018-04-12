require = require("esm")(module/*, options*/);
console.time('mostly-feathers-validate import');
module.exports = require('./src/validation').default;
console.timeEnd('mostly-feathers-validate import');
