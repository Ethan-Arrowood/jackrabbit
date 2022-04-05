# ⚠️ This repo has been archived in favor of: https://github.com/jsperfdev/jsperf.dev ⚠️

# jackrabbit

Idea 💡: 
- a tap like interface for defining a benchmark suite. 
- the api will have methods for adding lifecycle handlers such as `beforeEach`, `beforeAll`, `afterEach`, and `afterAll`.
- the api will have a command for _queueing_ benchmark runs (essentially the equivalent to `tap.test()`)
- the api should be executable using `node`
- a "suite" is defined by a single `.benchmark.(j|t)s` file
- a suite should output results to `stdout` by default
- each run should be profiled for time of execution (in milliseconds) as well as memory usage
- handlers and runs can be sync or async
- handlers and runs should have a `context` argument
