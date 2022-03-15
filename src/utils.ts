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