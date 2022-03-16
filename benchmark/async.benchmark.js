'use strict';
import jsperf from "../build/index.js";

jsperf.run('1sec', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
})

jsperf.run('2sec', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
})

jsperf.run('3sec', async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
})