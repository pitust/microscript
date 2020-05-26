// A minimal runtime header for this thing.
let p_console = {}
p_console.val = {}
p_console.val.p_log = {}
p_console.val.p_log.val = {}
p_console.val.p_log.val.invoke = doLogging;
function doLogging(_p1, p2, p3) {
    console.log(p2, p3);
}
let ums = create_d___usermode_start();
ums.invoke(ums);