module.exports.UNITS= {
    MEM_UNITS: 'gb',
     TIMEOUT : 60000,
    HUNDRED_PERCENTAGE :100
};

module.exports.DB_URL= process.env.NODE_ENV === 'prod' ? 'mongodb+srv://danielShely:Maayan26@appcluster-ztphv.mongodb.net/' +
    'DEV_DB?retryWrites=true&w=majority': 'mongodb://localhost/serverDB';
