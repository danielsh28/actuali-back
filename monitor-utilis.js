const units = require('./monitor-constants').UNITS.MEM_UNITS;

const  unitsMap = {
        kb: {
            name: 'KB',
            conversation: 0.001
        },
        mb: {
            name: 'MB',
            conversation: 0.000001
        },
        gb: {
            name: 'GB',
            conversation: 0.000000001
        }
    };



 function convertToDisplyedUnites (mem) {
    return mem * unitsMap[units].conversation;
};



 module.exports.unitsMap = unitsMap;
 module.exports.convertToDisplyedUnites= convertToDisplyedUnites;
