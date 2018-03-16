const rename = require('./rename');
const path = require('path');

console.log('processing', path.join(__dirname), '/hello');
console.log('processing', process.cwd(), '/hello');
module.exports = rename;
