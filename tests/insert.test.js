const memLog = require('../routes/data.js').memLog;

//test
test('doc inserted',()=>{
   expect(memLog({used:100,total:100})).
   toBe(1);
});