import { fileURLToPath } from 'url'
import { dirname } from 'path'
export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)

export const JSONStringify = (value: any) => {
    return JSON.stringify(value, (key, value) => {
        return typeof value === 'function'
            ? `function-${value.toString()}`
            : value
    })
}

export const JSONParse = (value: any) => {
    return JSON.parse(value, (key, value) => {
        if (typeof value !== 'string') return value;
        return value.substring(0,9) === 'function-'
            ? eval(`(${value.substring(9)})`)
            : value
    })
}

export interface Configuration <Context> {
    context: Context,
    handlers?: {
        beforeEach?: FunctionWithContext<Context>,
        beforeAll?: FunctionWithContext<Context>,
        afterEach?: FunctionWithContext<Context>,
        afterAll?: FunctionWithContext<Context>
    },
    runs: {
        key: string,
        func: FunctionWithContext<Context>
    }[]
}

export type BeforeAll<Context> = () => Context
export type FunctionWithContext <Context> = (context: Context, ...extraArgs: any[]) => void | Promise<void>