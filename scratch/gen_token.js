const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: '69689eca561e97f5b4db2301' }, 'ThisKeyShouldBeSecret');
console.log(token);
