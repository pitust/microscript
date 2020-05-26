// A minimal runtime header for this thing.
let p_console = {}
p_console.val = {}
p_console.val.p_log = {}
p_console.val.p_log.val = {}
p_console.val.p_log.val.invoke = (...x) => console.log(...x.slice(1).map(v => v.val));
let ums = create_d___usermode_start();
ums.invoke(ums);