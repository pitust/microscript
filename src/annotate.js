let { ftbl: functionCode, cxit: contextInfo, impureMap } = require('./mkuir');
let gti = {};

let typeInfo = {
    'console_t': {
        'p_log': 'func(console_log)'
    }
}
let funcIDToSig = {
    console_log: 'undefined'
}
let ptypes = {
    'console_log': ['string', 'string'],
};
let res = {
    // Console.log must be here so that next stage can resolve it properly. but it doesn't have to emit it correctly, so just a dummy context set and typeTable with a retval=undefined
    'console_log': {
        typeTable: {
            retval: 'undefined'
        },
        ctxset: [],
        argNames: ['a', 'b'],
        abstract: true
    }
};
function walkFn(fn, argTypes, npwalk = false) {
    let ctxset = fn.ctx;
    let code = fn.data;
    let argnm = fn.argNames;
    let id = fn.id;
    let ptp = {};
    if (code[0] && code[0][1] == 'PASTE') {
        let q = {
            code,
            ctxset: ['nullctx'],
            argNames: argnm,
            typeTable: {
                retval: fn.RETURN||'void'
            },
            impure: true
        }
        res[id] = q;
        return q;
    }
    ptp = {
        v_0: 'func(v_0)',
        p_console: 'console_t'
    }
    ptypes[id] = [...argTypes];
    if (ctxset.length > 1 && npwalk) return false;
    for (let e of argnm) {
        if (npwalk) return false;
        ptp['p_' + e] = argTypes.pop();
    }
    function resolveCtx(varNm) {
        let v = ctxset.find((nm) => {
            let vars = contextInfo[nm];
            return vars.findIndex(v => v == varNm) != -1;
        });
        if (!v) throw new ReferenceError('(in UIR) ' + varNm + ' is not defined');
        return v;
    }
    function tryResolveCtx(varNm) {
        let v = ctxset.find((nm) => {
            let vars = contextInfo[nm];
            return vars.findIndex(v => v == varNm) != -1;
        });
        return v;
    }
    function resolveTypeInfo(varNm) {
        let ctx = resolveCtx(varNm);
        let v = gti[ctx];
        ptp[varNm] = v;
        return v;
    }
    function resolveParamType(param) {
        if (param.startsWith('i:')) return 'number';
        if (param.startsWith('s:')) return 'string';
        return ptp[param] || resolveTypeInfo(param);
    }
    function resolveOP(op) {
        if (op[1] == 'JMP' || op[1] == 'JMPTRUE' || op[1] == 'LABEL') {
            return '__internal_marker_';
        }
        if (op[1] == 'RET') {
            return resolveParamType(op[2])
        }
        if (op[1] == '()') {
            return resolveParamType(op[2]);
        }
        if (op[1] == 'FNCTX') {
            return `func(${op[2]})`
        }
        if (op[1] == '-') {
            return 'number';
        }
        if (op[1] == 'u-') {
            return 'number';
        }
        if (op[1] == '+') {
            let p1 = resolveParamType(op[2]);
            let p2 = resolveParamType(op[3]);
            return (p1 == 'string' || p2 == 'string') ? 'string' : 'number';
        }
        if (op[1] == '>=') {
            return 'boolean';
        }
        if (op[1] == '>') {
            return 'boolean';
        }
        if (op[1] == '<=') {
            return 'boolean';
        }
        if (op[1] == '<') {
            return 'boolean';
        }

        if (op[1] == '==') {
            return 'boolean';
        }
        if (op[1] == '!=') {
            return 'boolean';
        }
        if (op[1] == 'invoke') {
            let argTs = op.slice(3).map(resolveParamType);
            let fun = resolveParamType(op[2]);
            if (!(fun.startsWith('func(') && fun.endsWith(')'))) {
                throw new TypeError('(in UIR) expected function but found ' + fun);
            }
            fun = fun.slice(5, -1);
            if (funcIDToSig[fun]) return funcIDToSig[fun];
            return walkFn(functionCode[fun], argTs).typeTable.retval;
        }
        if (op[1] == '.') {
            let p1 = resolveParamType(op[2]);
            return typeInfo[p1][op[3]];
        }
    }
    for (let op of code) {
        let nv = resolveOP(op);
        if (ptp[op[0]]) {
            if (nv != ptp[op[0]]) {
                throw new TypeError("(in UIR) Type mismatch, found " + nv + " expected " + ptp[op[0]]);
            }
        }
        ptp[op[0]] = nv;
        op.forEach((v, i) => {
            let octx = tryResolveCtx(v);
            if (octx) {
                op[i] = octx + '.' + v;
            }
        })
    }
    let q = { code, ctxset, argNames: argnm, typeTable: ptp };
    res[id] = q;
    return q;
}
for (let f in functionCode) {
    walkFn(functionCode[f], [], true);
}
module.exports = { code: res, ptypes, contextInfo, impureMap };