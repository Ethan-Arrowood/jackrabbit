import assert from "assert"
import { benchmark } from "../src"

const createArray = (length: number) => Array.from({ length }, (_, i) => i)

const result = benchmark({
    context: {
        list: createArray(1000),
        noop: (...args: any) => void args
    },
    handlers: {
        beforeEach: ({ list }) => {
            assert(list.length === 1000)
        },
        beforeAll: () => {
            console.log('beforeAll')
        },
        afterEach: ({ list }) => {
            assert(list.length === 1000)
        },
        afterAll: () => {
            console.log('afterAll')
        }
    },
    runs: [
        {
            key: 'for',
            func: ({ list, noop }) => {
                for (let i = 0; i < list.length; i++) {
                    noop(list[i])
                }
            }
        },
        {
            key: 'for..of',
            func: ({ list, noop }) => {
                for (const item of list) {
                    noop(item)
                }
            }
        },
        {
            key: 'forEach',
            func: ({ list, noop }) => {
                list.forEach(item => {
                    noop(item)
                })
            }
        }
    ]
})