let finfo = require('./mkuir');
let fs = require('fs');
let present = [];
let pufhead = '';
let chead = '';
function interopImpureNaming(name) {
    return finfo.impureMap[name] || name;
}
function ctp(v) {
    if (v === 'undefined') return 'void';
    if (v === 'number') return 'number';
    if (v.startsWith('func(') && v.endsWith(')')) {
        let id = interopImpureNaming(v.slice(5, -1));
        let args = finfo.ftbl[id].argNames;
        if (finfo.ftbl[id].impure) return id + '_t';
        if (finfo.ftbl[id].abstract) return id + '_t';
        let idx = (present.findIndex(e => e === id));
        if (idx === -1) {
            present.push(id);
            let cx = finfo.ftbl[id].ctx.flatMap(e => finfo.cxit[e]);
            let xxpx = cx.map(e => `\n        ${e}: {},`).join('');
            chead += `
function invoke_d_${id}(self, ${args.map((e, i) => `arg${i}`)}) {
    return ${id}(${[...cx.map(e => `self.${e}`), ...finfo.ftbl[id].argNames.map((_e, i) => `arg${i}`)].join(', ')});
}
function create_d_${id}() {
    return {
        invoke: invoke_d_${id},
${xxpx}
    }
}
`;
        }
        return 'd_' + id;
    }
    return v;
}
let ctxdone = [];
function opp(o) {
    if (o.startsWith('i:')) return +o.slice(2);
    if (o.startsWith('s:')) return JSON.stringify(JSON.parse(o.slice(2)));
    return o + '.val';
}
//{ code, ctxset, argNames: argnm, typeTable: ptp };
function emitFn(func, name) {
    let glid = 0;
    if (func.abstract) return;
    for (let op of func.data) {
        console.log(op[0], ':=', op[2], op[1], ...op.slice(3))
    }
    if (func.data[0] && func.data[0][1] === 'PASTE') {
        pufhead += '\n' + func.data[0][2];
        return;
    }
    ctp(`func(${name})`);
    // Get argument info
    let argdata = func.ctxset.map(e => `${e}`);
    for (let a of func.argNames) {
        argdata.push(`p_${a}`);
    }
    let cl = [...func.ctxset].pop();
    let body = `\nfunction ${name}(${argdata.join(', ')}) {`;
    for (let v of func.temps) {
        body += `\n    var ${v} = {};`;
    }
    body += '\n    var curbr = 0;';
    body += '\n    var fallthrough_allow = false;';
    body += '\n    while (true) {';
    body += '\n        if (curbr === 0) {';
    let obrs = '0';
    for (let op of func.data) {
        body += '\n                ';
        switch (op[1]) {
            case 'u-':
                body += `${op[0]}.val = -(${opp(op[2])})`
                break
            case '()':
                body += `${op[0]}.val = (${opp(op[2])})`
                break;
            case 'LABEL':
                chead += `\nconst BR_${op[0]} = ${++glid};`;
                body = body.slice(0, -4) + `fallthrough_allow=curbr === ${obrs};}\n if (curbr === BR_${op[0]} || fallthrough_allow) {\ncurbr = BR_${op[0]};\nfallthrough_allow = false;`;
                obrs = 'BR_' + op[0];
                break;
            case 'JMP':
                body += `curbr = BR_${op[0]};`
                break;
            case 'JMPTRUE':
                body += `if ((${op[2]}).val) { curbr = BR_${op[0]}; }`
                break;
            case '.':
                body += `${op[0]}.val = (${opp(op[2])}.${op[3]}.val)`
                break;
            case 'FNCTX':
                let t = finfo.ftbl[op[2]].ctxset.slice(0, -1);
                body += `${op[0]}.val = create_d_${op[2]}()`
                for (let c of t) {
                    body += `;\n                ${op[0]}.val.${c} = ${c}`;
                }
                break;
            case 'PASTE':
                pufhead += '\n' + op[2];
                return;
            case 'CGLOB':
                chead += `\nlet ${op[0]};`;
                body += `${op[0]} = ${op[2]}`;
                break;
            case 'IMPORT':
                body += `${op[0]} = ${op[2]}`;
                break;
            case 'GSTUB':
                chead += `
let cache_${op[0]}_done = false;
function exec_${op[0]}() {
    if (cache_${op[0]}_done) return;
    cache_${op[0]}_done = true;
    let x = create_d_${name}();
    x.invoke(x);
}`;
                break;
            case 'RUN_XT':
                body += `${op[0]}()`;
                break;
            case '>=':
            case '<=':
            case '>':
            case '<':
            case '===':
            case '!===':
            case '+':
            case '-':
            case '/':
            case '*':
                body += `${op[0]}.val = (${opp(op[2])}) ${op[1]} (${opp(op[3])})`
                break;
            case 'RET':
                body += `return ${opp(op[2])}`;
                break;
            //v_10 := v_9 invoke s:"Hello, usIR!" ctx_0.p_c;
            case 'invoke':
                let p = `${op[0]}.val = `;
                body += `${p}${opp(op[2])}.invoke(${[`${opp(op[2])}`, ...op.slice(3).map(opp).map(e => `{ val: (${e}) }`)].join(', ')})`;
                break;
            default:
                body += '/' + '/! error UNK: ' + ['   ', op[0], ':=', op[2] || '', op[1], ...op.slice(3)].join(' ');
                break;
        }
        body += ';'
    }
    body += '\n                return;';
    body += '\n        }';
    body += '\n    }';
    body += '\n}';
    pufhead += body;
}
for (let k in finfo.ftbl) {
    finfo.ftbl[k].ctxset = finfo.ftbl[k].ctx.flatMap(e => finfo.cxit[e]);
    emitFn(finfo.ftbl[k], k);
}
fs.writeFileSync('out.js', chead + '\n' + pufhead);