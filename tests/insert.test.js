const util = require('../routes/data.js');

//test
test('doc inserted',()=> {
   expect(util.memLog({used: 100000000000, total: 100000000000})).toBe(1);
});
