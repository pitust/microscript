
function invoke_d_v_0(self, arg0) {
    return v_0(self.p_gh, self.p_g, self.p_a, self.p_b, self.p_c, arg0);
}
function create_d_v_0() {
    return {
        invoke: invoke_d_v_0,

        p_gh: {},
        p_g: {},
        p_a: {},
        p_b: {},
        p_c: {},
    }
}

function invoke_d___usermode_start(self, ) {
    return __usermode_start(self.p_gh, self.p_g, self.p_a, self.p_b, self.p_c);
}
function create_d___usermode_start() {
    return {
        invoke: invoke_d___usermode_start,

        p_gh: {},
        p_g: {},
        p_a: {},
        p_b: {},
        p_c: {},
    }
}

const BR_v_6 = 1;
const BR_v_7 = 2;

function v_0(p_gh, p_g, p_a, p_b, p_c, p_af) {
    var v_1 = {};
    var v_2 = {};
    var curbr = 0;
    while (true) {
        switch (curbr) {
        case 0:
                v_1.val = (7) + (p_af.val);
                v_2.val = (v_1.val) + (p_gh.val);
                return v_2.val;
                return;
        }
    }
}
function __usermode_start(p_gh, p_g, p_a, p_b, p_c) {
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
    var curbr = 0;
    while (true) {
        switch (curbr) {
        case 0:
                v_3.val = -(1);
                p_gh.val = (v_3.val);
                p_g.val = create_d_v_0();
                p_g.val.p_gh = p_gh;
                p_g.val.p_g = p_g;
                p_g.val.p_a = p_a;
                p_g.val.p_b = p_b;
                v_4.val = -(2);
                v_5.val = p_g.val.invoke(p_g.val, { val: (v_4.val) });
                p_a.val = (v_5.val);
                curbr = BR_v_7; continue;;
            case BR_v_6:;
                p_b.val = (p_a.val);
                p_c.val = ("ABCD");
                v_8.val = (p_console.val.p_log.val);
                v_9.val = v_8.val.invoke(v_8.val, { val: ("Hello, usIR!") }, { val: (p_c.val) });
                v_10.val = (p_b.val) - (1);
                vcp_v_11.val = (v_10.val);
                p_a.val = (vcp_v_11.val);
            case BR_v_7:;
                v_12.val = (p_a.val) > (0);
                if ((v_12).val) { curbr = BR_v_6; continue; };
                return;
        }
    }
}