import assert from "assert";
import _jsperf, { JSPerf } from "../src";

interface Context {
    list: number[],
    noop: (...args: any) => undefined
}

const jsperf = _jsperf as JSPerf<Context>

const createArray = (length: number) => Array.from({ length }, (_, i) => i)

jsperf.beforeEach(({ list }) => {
    assert(list.length === 1000)
})

jsperf.beforeAll((context) => {
    context = {
        list: createArray(1000),
        noop: (...args) => void args
    }
})

jsperf.afterEach(({ list }) => {
    assert(list.length === 1000)
})

jsperf.afterAll(() => {
    console.log('afterAll')
})

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
 * ts-node for.benchmark.ts
 * 
 * | Run     | Time (ms) | Mem (gb) |
 * | ------- | --------- | -------- |
 * | for     |   0.56734 |  0.00057 |
 * | for..of |   0.78901 |  0.00011 | 
 * | forEach |   1.00234 |  0.00232 |
 */