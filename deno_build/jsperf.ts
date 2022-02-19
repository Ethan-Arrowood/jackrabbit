import { FunctionWithContext } from "./utils.ts"

type HandlerList <Context> = FunctionWithContext<Context>[]
interface Handlers <Context> {
    beforeAll: HandlerList<Context>
    beforeEach:  HandlerList<Context>
    afterEach:  HandlerList<Context>
    afterAll:  HandlerList<Context>
}

export class JSPerf <Context> {
    private context: Context
    private runs: Map<string, FunctionWithContext<Context>>
    private handlers: Handlers<Context>
    private results: Map<string, PerformanceEntry>

    constructor () {
        this.context = {} as Context
        this.runs = new Map()

        this.handlers = {
            beforeAll: [],
            beforeEach: [],
            afterEach: [],
            afterAll: []
        }

        this.results = new Map()

        process.nextTick(() => {
            this.executeHandlers(this.handlers.beforeAll)
            Promise.all(
                [...this.runs.entries()].map(([key, func]) => {
                    this.executeHandlers(this.handlers.beforeEach)
                    performance.mark(`${key}-start`)
                    func(this.context)
                    performance.mark(`${key}-end`)
                    this.executeHandlers(this.handlers.afterEach)
                    performance.measure(
                        `${key}-measure`,
                        `${key}-start`,
                        `${key}-end`
                    )
                    this.results.set(key, performance.getEntriesByName(`${key}-measure`)[0])
                })
            ).then(() => {
                this.executeHandlers(this.handlers.afterAll)
            }).then(() => {
                console.table([...this.results.entries()].map(([key, performanceEntry]) => {
                    return {
                        Run: key,
                        'Time (ms)': performanceEntry.duration
                    }
                }))
            })
        })
    }

    beforeAll (func:  FunctionWithContext<Context>) {
        this.handlers.beforeAll.push(func)
    }
    beforeEach (func: FunctionWithContext<Context>) {
        this.handlers.beforeEach.push(func)
    }
    afterEach (func:  FunctionWithContext<Context>) {
        this.handlers.afterEach.push(func)
    }
    afterAll (func:  FunctionWithContext<Context>) {
        this.handlers.afterAll.push(func)
    }

    private executeHandlers (handlers: HandlerList<Context>) {
        for (const handler of handlers) {
            handler(this.context)
        }
    }

    run (id: string, func:  FunctionWithContext<Context>) {
        if (this.runs.has(id)) {
            throw new Error(`Run with id ${id} already exists.`)
        }
        this.runs.set(id, func)
    }
}
