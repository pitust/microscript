// @ts-nocheck ts(1206)
// MICROSCRIPT(TARGET=ts)
// MICROSCRIPT(COMP_MODE=PURE_COPY_PASTE,NAME=console_log_t)
class console_log_t {
    invoke(s1: string, s2: string): void {
        this.buf += s1 + ' ' + s2 + '\n';
    }
    buf: string;
}
// MICROSCRIPT(COMP_MODE=PURE_COPY_PASTE,NAME=p_console_t)
class p_console_t {
    constructor() {
        this.p_log = new console_log_t();
    }
    p_log: console_log_t;
}
// MICROSCRIPT(COMP_MODE=CLOSURE_COPY_PASTE,NAME=p_console)
function impl_console_object(): p_console_t {
    return new p_console_t();
}
declare var p_console: p_console_t;
declare class d___usermode_start { invoke(): void; };

// MICROSCRIPT(COMP_MODE=CLOSURE_COPY_PASTE,NAME=_start)
function _start(): number {
    p_console.p_log.buf = '';
    let pureCodeStart = new d___usermode_start();
    pureCodeStart.invoke();
    return 0;
}
// MICROSCRIPT(COMP_MODE=PURE_COPY_PASTE,NAME=getBufLen)
export function getBufLen(): u32 {
    return p_console.p_log.buf.length;
}
// MICROSCRIPT(COMP_MODE=PURE_COPY_PASTE,NAME=getBufChar)
export function getBufChar(chr: u32): u32 {
    return p_console.p_log.buf.charCodeAt(chr);
}