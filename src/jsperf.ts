import { FunctionWithContext, __dirname, JSONStringify, JSONParse } from "./utils.js";
import path from "path";
import { Worker } from "worker_threads";

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

        queueMicrotask(() => {
            this.executeRuns()
        })
    }

    async executeRuns () {
        await this.executeHandlers(this.handlers.beforeAll)

        const runs = this.buildRuns()

        await Promise.all(runs)

        await this.executeHandlers(this.handlers.afterAll)

        console.log(this.results)
        console.table(Array.from(this.results).map(([key, performanceEntry]) => {
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
        return Array.from(this.runs).map(async run => {
            await this.executeHandlers(this.handlers.beforeEach);

            const workerResultRaw = await this.executeRun(run) as {
                id: string,
                result: unknown,
                measure: PerformanceEntry
            };

            const workerResult = JSONParse(workerResultRaw)

            await this.executeHandlers(this.handlers.afterEach, workerResult.result);

            this.results.set(workerResult.id, workerResult.measure)
        });
    }

    private executeRun ([id, func]: [id: string, func: FunctionWithContext<Context>]) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(path.join(__dirname, './worker.js'), {
                workerData: {
                    id,
                    func: func.toString(),
                    context: JSONStringify(this.context)
                }
            })
            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', code => {
                if (code !== 0)
                    reject(new Error(`Worker stopped with exit code ${code}`));
            })
        })
    }

    run (id: string, func: FunctionWithContext<Context>) {
        if (this.runs.has(id)) {
            throw new Error(`Run with id ${id} already exists.`)
        }
        this.runs.set(id, func)
    }
}
