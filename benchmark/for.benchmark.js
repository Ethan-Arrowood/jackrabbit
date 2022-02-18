'use strict';
const assert = require("assert")
const jsperf = require("../build").default

const createArray = (length) => Array.from({ length }, (_, i) => i)

const N = 10000

jsperf.beforeAll((context) => {
    Object.assign(context, {
        list: createArray(N),
        noop: (...args) => void args
    })
})

jsperf.beforeEach(({ list }) => {
    assert(list.length === N, `list has ${N} items`)
})

jsperf.afterEach(({ list }) => {
    assert(list.length === N, `list has ${N} items`)
})

jsperf.afterAll(() => {})

jsperf.run('for', ({ list, noop }) => {
    for (let i = 0; i < list.length; i++) {
        noop(list[i])
    }
})

jsperf.run('for..of', ({ list, noop }) => {
    for (const item of list) {
        noop(item)
    }
})

jsperf.run('forEach', ({ list, noop }) => {
    list.forEach(item => {
        noop(item)
    })
})

/**
 * node for.benchmark.js
 * 
 * | Run     | Time (ms) | Mem (gb) |
 * | ------- | --------- | -------- |
 * | for     |   0.56734 |  0.00057 |
 * | for..of |   0.78901 |  0.00011 | 
 * | forEach |   1.00234 |  0.00232 |
 */