import { FunctionWithContext } from "./utils";
import async_hooks, { AsyncResource } from "async_hooks";
import { performance, PerformanceObserver } from "perf_hooks";

type HandlerList <Context> = FunctionWithContext<Context>[]

interface Handlers <Context> {
    beforeAll: HandlerList<Context>
    beforeEach:  HandlerList<Context>
    afterEach:  HandlerList<Context>
    afterAll:  HandlerList<Context>
}

class Run <Context> extends AsyncResource {
    func: FunctionWithContext<Context>;
    constructor (func: FunctionWithContext<Context>) {
        super('Run');
        this.func = func;
    }
    execute () {
        this.runInAsyncScope(this.func, null)
    }
}

export class JSPerf <Context> {
    private context: Context
    private runs: Map<string, FunctionWithContext<Context>>
    private handlers: Handlers<Context>
    private results: Map<string, PerformanceEntry>
    private asyncHookSet: Set<number>;
    private hook: async_hooks.AsyncHook;
    obs: PerformanceObserver;

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

        queueMicrotask(() => {
            this.execute()
        })

        this.asyncHookSet = new Set();
        this.hook = async_hooks.createHook({
            init: (id, type) => {
                console.log(id, type);
                performance.mark(`${id}-Init`)
                this.asyncHookSet.add(id);
            },
            destroy: (id) => {
                if (this.asyncHookSet.has(id)) {
                    this.asyncHookSet.delete(id);
                    performance.mark(`${id}-Destroy`)
                    performance.measure(`${id}`, `${id}-Init`, `${id}-Destroy`)
                }
            }
        });
        this.hook.enable();

        this.obs = new PerformanceObserver((list, observer) => {
            console.log(list.getEntries())
            performance.clearMarks();
            // @ts-ignore
            performance.clearMeasures();
            observer.disconnect()
        });
        this.obs.observe({ entryTypes: ['measure'], buffered: true })
    }

    async execute () {
        await this.executeHandlers(this.handlers.beforeAll)

        const runs = this.buildRuns()

        await Promise.all(runs)

        await this.executeHandlers(this.handlers.afterAll)

        console.log(this.results)
        console.table([...this.results.entries()].map(([key, performanceEntry]) => {
            return {
                Run: key,
                'Time (ms)': performanceEntry.duration
            }
        }))
    }

    beforeAll (func: FunctionWithContext<Context>) {
        this.handlers.beforeAll.push(func)
    }

    beforeEach (func: FunctionWithContext<Context>) {
        this.handlers.beforeEach.push(func)
    }

    afterEach (func: FunctionWithContext<Context>) {
        this.handlers.afterEach.push(func)
    }

    afterAll (func: FunctionWithContext<Context>) {
        this.handlers.afterAll.push(func)
    }

    private executeHandlers (handlers: HandlerList<Context>, data?: unknown) {
        return Promise.all(handlers.map(handler => handler(this.context, data)))
    }

    private buildRuns () {
        return Array.from(this.runs).map(async ([key, func]) => {
            await this.executeHandlers(this.handlers.beforeEach)

            const runResult = await func(this.context)

            await this.executeHandlers(this.handlers.afterEach, runResult)
        })
    }

    run (id: string, func: FunctionWithContext<Context>) {
        if (this.runs.has(id)) {
            throw new Error(`Run with id ${id} already exists.`)
        }
        this.runs.set(id, func)
    }
}
