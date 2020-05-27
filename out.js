let p_console = {}
function invoke_d_v_0(self, arg0) {
    return v_0(self.p_x, self.p_gh, self.p_g, self.p_a, self.p_b, self.p_c, arg0);
}
function create_d_v_0() {
    return {
        invoke: invoke_d_v_0,

        p_x: {},
        p_gh: {},
        p_g: {},
        p_a: {},
        p_b: {},
        p_c: {},
    }
}

function invoke_d___usermode_start(self,) {
    return __usermode_start(self.p_x, self.p_gh, self.p_g, self.p_a, self.p_b, self.p_c);
}
function create_d___usermode_start() {
    return {
        invoke: invoke_d___usermode_start,

        p_x: {},
        p_gh: {},
        p_g: {},
        p_a: {},
        p_b: {},
        p_c: {},
    }
}

let cache__dot__entry_dotjs_done = false;
function exec__dot__entry_dotjs() {
    if (cache__dot__entry_dotjs_done) return;
    cache__dot__entry_dotjs_done = true;
    let x = create_d___usermode_start();
    x.invoke(x);
}
const BR_v_6 = 1;
const BR_v_7 = 2;
const BR_v_13 = 3;
function invoke_d_v_14(self,) {
    return v_14(self.p_x);
}
function create_d_v_14() {
    return {
        invoke: invoke_d_v_14,

        p_x: {},
    }
}

let cache__dot__module_x_dotjs_done = false;
function exec__dot__module_x_dotjs() {
    if (cache__dot__module_x_dotjs_done) return;
    cache__dot__module_x_dotjs_done = true;
    let x = create_d_v_14();
    x.invoke(x);
}
let _dot__module_x_dotjs___x;

function v_0(p_x, p_gh, p_g, p_a, p_b, p_c, p_af) {
    var v_1 = {};
    var v_2 = {};
    var curbr = 0;
    var fallthrough_allow = false;
    while (true) {
        if (curbr === 0) {
            v_1.val = (7) + (p_af.val);
            v_2.val = (v_1.val) + (p_gh.val);
            return v_2.val;
            return;
        }
    }
}
function __usermode_start(p_x, p_gh, p_g, p_a, p_b, p_c) {
    var v_3 = {};
    var v_4 = {};
    var v_5 = {};
    var v_6 = {};
    var v_7 = {};
    var v_8 = {};
    var v_9 = {};
    var v_10 = {};
    var v_11 = {};
    var vcp_v_11 = {};
    var v_12 = {};
    var v_13 = {};
    var v_14 = {};
    var curbr = 0;
    var fallthrough_allow = false;
    while (true) {
        if (curbr === 0) {
            ;
            exec__dot__module_x_dotjs();
            p_x = _dot__module_x_dotjs___x;
            v_3.val = (p_x.val) - (4);
            p_gh.val = (v_3.val);
            p_g.val = create_d_v_0();
            p_g.val.p_x = p_x;
            p_g.val.p_gh = p_gh;
            p_g.val.p_g = p_g;
            p_g.val.p_a = p_a;
            p_g.val.p_b = p_b;
            v_4.val = -(2);
            v_5.val = p_g.val.invoke(p_g.val, { val: (v_4.val) });
            p_a.val = (v_5.val);
            curbr = BR_v_7;;
            fallthrough_allow = curbr === 0;
        }
        if (curbr === BR_v_6 || fallthrough_allow) {
            curbr = BR_v_6;
            fallthrough_allow = false;;
            p_b.val = (p_a.val);
            p_c.val = ("ABCD");
            v_8.val = (p_console.val.p_log.val);
            v_9.val = v_8.val.invoke(v_8.val, { val: ("Hello, usIR!") }, { val: (p_c.val) });
            v_10.val = (p_b.val) - (1);
            vcp_v_11.val = (v_10.val);
            p_a.val = (vcp_v_11.val);
            fallthrough_allow = curbr === BR_v_6;
        }
        if (curbr === BR_v_7 || fallthrough_allow) {
            curbr = BR_v_7;
            fallthrough_allow = false;;
            v_12.val = (p_a.val) > (0);
            if ((v_12).val) { curbr = BR_v_6; };
            fallthrough_allow = curbr === BR_v_7;
        }
        if (curbr === BR_v_13 || fallthrough_allow) {
            curbr = BR_v_13;
            fallthrough_allow = false;;
            return;
        }
    }
}
function v_14(p_x) {
    var curbr = 0;
    var fallthrough_allow = false;
    while (true) {
        if (curbr === 0) {
            ;
            p_x.val = (3);
            _dot__module_x_dotjs___x = p_x;
            return;
        }
    }
}
// A minimal runtime header for this thing.
p_console.val = {}
p_console.val.p_log = {}
p_console.val.p_log.val = {}
p_console.val.p_log.val.invoke = doLogging;
function doLogging(_p1, p2, p3) {
    console.log(p2.val, p3.val);
}
function invokeMain() {
    let ums = create_d___usermode_start();
    ums.invoke(ums);
}
invokeMain();