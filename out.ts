
class ctx_1_t {
}
class d_v_0 {
  invoke(arg0: number): number {
    return v_0(this.ctx_0, arg0);
  }
  ctx_0: ctx_0_t;
}
class ctx_0_t {
  p_gh: number;
  p_g: d_v_0;
  p_a: number;
  p_b: number;
  p_c: string;
}
class d___usermode_start {
  invoke(): void {
    __usermode_start();
  }
}
const BR_v_6 = 1;
const BR_v_7 = 2;

function v_0(ctx_0: ctx_0_t, p_af: number): number {
  var ctx_1: ctx_1_t = new ctx_1_t();
  var v_0: d_v_0 | null = null;
  var v_1: number = 0;
  var v_2: number = 0;
  var curbr: u32 = 0;
  while (true) {
    switch (curbr) {
      case 0:
        v_1 = (7) + (p_af);
        v_2 = (v_1) + (ctx_0.p_gh);
        return v_2;
        return;
    }
  }
}
function __usermode_start(): void {
  var ctx_0: ctx_0_t = new ctx_0_t();
  var v_0: d_v_0 | null = null;
  var v_3: number = 0;
  var v_4: number = 0;
  var v_5: number = 0;
  var v_8: console_log_t | null = null;
  var v_10: number = 0;
  var vcp_v_11: number = 0;
  var v_12: boolean = false;
  var curbr: u32 = 0;
  while (true) {
    switch (curbr) {
      case 0:
        v_3 = -(1);
        ctx_0.p_gh = (v_3);
        ctx_0.p_g = new d_v_0();
        ctx_0.p_g.ctx_0 = ctx_0;
        v_4 = -(2);
        v_5 = ctx_0.p_g.invoke(v_4);
        ctx_0.p_a = (v_5);
        curbr = BR_v_7; continue;;
      case BR_v_6: ;
        ctx_0.p_b = (ctx_0.p_a);
        ctx_0.p_c = ("ABCD");
        v_8 = (p_console.p_log);
        v_8.invoke("Hello, usIR!", ctx_0.p_c);
        v_10 = (ctx_0.p_b) - (1);
        vcp_v_11 = (v_10);
        ctx_0.p_a = (vcp_v_11);
      case BR_v_7: ;
        v_12 = (ctx_0.p_a) > (0);
        if (v_12) { curbr = BR_v_6; continue; };
        return;
    }
  }
}
class console_log_t {
  invoke(s1: string, s2: string): void {
    this.buf += s1 + " " + s2 + "\n";
  }

  buf: string;
}
class p_console_t {
  constructor() {
    this.p_log = new console_log_t();
  }

  p_log: console_log_t;
}
function __p_console_truefn(): p_console_t {
  return new p_console_t();
}

let p_console = __p_console_truefn();
function ___start_truefn(): number {
  p_console.p_log.buf = "";
  let pureCodeStart = new d___usermode_start();
  pureCodeStart.invoke();
  return 0;
}

let _start = ___start_truefn();
export function getBufLen(): u32 {
  return p_console.p_log.buf.length;
}
export function getBufChar(chr: u32): u32 {
  return p_console.p_log.buf.charCodeAt(chr);
}