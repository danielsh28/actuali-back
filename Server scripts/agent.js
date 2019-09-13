const osUtil= require('node-os-utils');
const si = require('systeminformation');
const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const dbUrl = process.env.NODE_ENV === 'prod' ?'https://server-mon.herokuapp.com/data/':'http://localhost:3000/data' ;
const fetchData = async function() {
    const memData = await si.mem().catch(() => ' Memory Usage Not Available');
    const cpuData = await osUtil.cpu.usage().catch(() => 'CPU Usage Not Available');
    const info = await si.osInfo().catch(() => 'Hostname Not Available');
    axios.post(dbUrl,
        {
            hostName:argv._[0]?argv._[0]:info.hostname,
            cpuData,
            memData,
            time: new Date()
        }
    ).catch(err => {
        console.log('Error!');
    })
};
setInterval(fetchData,5000);


/*
const interval = setInterval(fetchData,2000);
*/

