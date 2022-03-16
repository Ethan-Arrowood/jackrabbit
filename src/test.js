'use strict';
const async_hooks = require('async_hooks');
const { appendFileSync } = require('fs');
const {
  performance,
  PerformanceObserver
} = require('perf_hooks');


const set = new Set();
const hook = async_hooks.createHook({
  init(id, type) {
      appendFileSync('./log.out', `${id} - ${type}\n`)
    if (type === 'Run') {
        performance.mark(`${id}-Init`);
        set.add(id);
    }
  },
  destroy(id) {
    if (set.has(id)) {
      set.delete(id);
      performance.mark(`${id}-Destroy`);
      performance.measure(`${id}`,
                          `${id}-Init`,
                          `${id}-Destroy`);
    }
  }
});
hook.enable();

const obs = new PerformanceObserver((list, observer) => {
  console.log(list.getEntries());
  performance.clearMarks();
  performance.clearMeasures();
  observer.disconnect();
});
obs.observe({ entryTypes: ['measure'], buffered: true });

class Run extends async_hooks.AsyncResource {
    constructor (f) {
        super('Run');
        this.f = f
    }

    execute () {
        return this.runInAsyncScope(this.f)
    }

    destroy () {
        this.emitDestroy();
    }
}

const r1 = new Run(async () => { console.log('foo'); return 'foo'; })
const r2 = new Run(async () => { console.log('bar'); return 'bar'; })

r1.execute().then(console.log)
r2.execute().then(console.log)

r1.destroy()
r2.destroy()

// const ar = new async_hooks.AsyncResource(
//     'Run', { requireManualDestroy: false }
// )

// ar.runInAsyncScope(() => console.log('foo'), null)
// ar.runInAsyncScope(() => console.log('bar'), null)
// ar.emitDestroy()