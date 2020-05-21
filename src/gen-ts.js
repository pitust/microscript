let finfo = require('./annotate');
let fs = require('fs');
let present = [];
let pufhead = '';
let chead = '';
function interopImpureNaming(name) {
    return finfo.impureMap[name] || name;
}
function ctp(v) {
    if (v == 'undefined') return 'void';
    if (v == 'number') return 'number';
    if (v.startsWith('func(') && v.endsWith(')')) {
        let id = interopImpureNaming(v.slice(5, -1));
        let args = finfo.ptypes[id];
        if (finfo.code[id].impure) return id + '_t';
        if (finfo.code[id].abstract) return id + '_t';
        let ret = finfo.code[id].typeTable.retval;
        let idx = (present.findIndex(e => e == id));
        if (idx == -1) {
            present.push(id);
            let xxpx = finfo.code[id].ctxset.slice(0, -1).map(e => `\n    ${e}: ${e}_t;`).join('');
            chead += `\nclass d_${id} {\n    invoke(${args.map((e, i) => `arg${i}: ${e}`)}): ${ctp(ret || 'void')} {\n        ${ret ? 'return ' : ''}${id}(${[...finfo.code[id].ctxset.slice(0, -1).map(e => `this.${e}`), ...finfo.code[id].argNames.map((e, i) => `arg${i}`)].join(', ')});\n    }${xxpx}\n}`;
        }
        return 'd_' + id;
    }
    return v;
}
let ctxdone = [];
function emit_ctx_types(func) {
    cloop: for (let t of func.ctxset) {
        if (ctxdone.includes(t)) continue;
        let cache = '';
        cache += `\nclass ${t}_t {`;
        for (let varNm of finfo.contextInfo[t]) {
            if (!func.typeTable[varNm]) {
                continue cloop;
            }
            cache += `\n    ${varNm}: ${ctp(func.typeTable[varNm])};`;
        }
        cache += '\n}';
        chead += cache;
        ctxdone.push(t);
    }
}
function opp(o) {
    if (o.startsWith('i:')) return +o.slice(2);
    if (o.startsWith('s:')) return JSON.stringify(JSON.parse(o.slice(2)));
    return o;
}
//{ code, ctxset, argNames: argnm, typeTable: ptp };
function emitFn(func, name) {
    let glid = 0;
    if (func.abstract) return;
    if (func.code[0] && func.code[0][1] == 'PASTE') {
        pufhead += '\n' + func.code[0][2];
        return;
    }
    emit_ctx_types(func);
    ctp(`func(${name})`);
    // Get return value
    let retval = ctp(func.typeTable.retval || 'void');
    // Get argument info
    let argdata = func.ctxset.slice(0, -1).map(e => `${e}: ${e}_t`);
    for (let a of func.argNames) {
        argdata.push(`p_${a}: ${ctp(func.typeTable['p_' + a])}`);
    }
    let cl = [...func.ctxset].pop();
    let body = `\nfunction ${name}(${argdata.join(', ')}): ${retval} {`;
    body += `\n    var ${cl}: ${cl}_t = new ${cl}_t();`;
    for (let v in func.typeTable) {
        if (!v.startsWith('v')) {
            continue;
        }
        if (func.typeTable[v] == '__internal_marker_' || func.typeTable[v] == 'undefined') continue;
        if (func.typeTable[v] == 'number') {
            body += `\n    var ${v}: ${func.typeTable[v]} = 0;`;
        } else if (func.typeTable[v] == 'boolean') {
            body += `\n    var ${v}: ${func.typeTable[v]} = false;`;
        } else {
            body += `\n    var ${v}: ${ctp(func.typeTable[v])} | null = null;`;
        }
    }
    body += '\n    var curbr: u32 = 0;';
    body += '\n    while (true) {';
    body += '\n        switch (curbr) {';
    body += '\n        case 0:';
    for (let op of func.code) {
        body += '\n                ';
        switch (op[1]) {
            case 'u-':
                body += `${op[0]} = -(${opp(op[2])})`
                break
            case '()':
                body += `${op[0]} = (${opp(op[2])})`
                break;
            case 'LABEL':
                chead += `\nconst BR_${op[0]} = ${++glid};`;
                body = body.slice(0, -4) + `case BR_${op[0]}:`
                break;
            case 'JMP':
                body += `curbr = BR_${op[0]}; continue;`
                break;
            case 'JMPTRUE':
                body += `if (${op[2]}) { curbr = BR_${op[0]}; continue; }`
                break;
            case '.':
                body += `${op[0]} = (${opp(op[2])}.${op[3]})`
                break;
            case 'FNCTX':
                let t = finfo.code[interopImpureNaming(op[2])].ctxset.slice(0, -1);
                let cpl = op[0].split('.').slice(-1)[0];
                body += `${op[0]} = new ${ctp(func.typeTable[cpl])}()`
                for (let c of t) {
                    body += `;\n                ${op[0]}.${c} = ${c}`;
                }
                break;
            case 'PASTE':
                pufhead += '\n' + op[2];
                return;
            case '>=':
            case '<=':
            case '>':
            case '<':
            case '==':
            case '!==':
            case '+':
            case '-':
            case '/':
            case '*':
                body += `${op[0]} = (${opp(op[2])}) ${op[1]} (${opp(op[3])})`
                break;
            case 'RET':
                body += `return ${opp(op[2])}`;
                break;
            //v_10 := v_9 invoke s:"Hello, usIR!" ctx_0.p_c;
            case 'invoke':
                let p = `${op[0]} = `;
                if (func.typeTable[op[0]] == 'undefined')p='';
                body += `${p}${opp(op[2])}.invoke(${op.slice(3).map(opp).join(', ')})`;
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
for (let k in finfo.code) emitFn(finfo.code[k], k);
fs.writeFileSync('out.ts', chead + '\n' + pufhead);