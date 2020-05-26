// A minimal runtime header for this thing.
let p_console = {}
p_console.val = {}
p_console.val.p_log = {}
p_console.val.p_log.val = {}
p_console.val.p_log.val.invoke = (...x) => console.log(...x.map(v => v.val));
let ums = new d___usermode_start()
ums.invoke();