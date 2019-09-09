const osUtil= require('node-os-utils');
const si = require('systeminformation');
const axios = require('axios');
const dbUrl = process.env.NODE_ENV === 'prod' ?'https://server-mon.herokuapp.com/data/':'http://localhost:3000/data' ;
const fetchData = async function() {
    const memData = await si.mem().catch(() => ' Memory Usage Not Available');
    const cpuData = await osUtil.cpu.usage().catch(() => 'CPU Usage Not Available');
    const hostName = await si.osInfo().catch(() => 'Hostname Not Available');
    axios.post(dbUrl,
        {
            hostName:{hostname:'Server2'},
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

