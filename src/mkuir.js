let parse = require('@babel/parser');
let g = require('@babel/generator');
let fs = require('fs');
function cleanup_tree(node) {
    if (node instanceof Array) node.forEach(cleanup_tree);
    delete node.loc;
    delete node.start;
    delete node.end;
    delete node.extra;
    delete node.interpreter;
    for (let k in node) if (node[k] && typeof node[k] == 'object') cleanup_tree(node[k]);
}
let tbl = [];
let cxit = {
    nullctx: []
};
let impureMap = {};

function emit(s) {
    tbl.push(s);
}
let vid = 0;
function tv() {
    return 'v_' + (vid++).toString();
}
let vardata = [[]], varmap = {}, uvarmap = {};
function ctxflush() {
    let gt = vardata.flatMap(e => e);
    let done = {};
    [...vardata.slice(0, -1)].flatMap(e => e).reverse().forEach(e => {
        if (done[e]) return;
        let o = e;
        while (!e.startsWith('p') && !done[e] && uvarmap[e]) {
            done[e] = true;
            e = uvarmap[e];
        }
        done[o] = true;
        done[e] = true;
        emit([e, '()', o]);
    })
    gt.reverse().forEach(e => {
        if (done[e]) return;
        let o = e;
        while (!e.startsWith('p') && !done[e] && uvarmap[e]) {
            done[e] = true;
            e = uvarmap[e];
        }
        if (done[e]) return;
        done[e] = true;
        done[o] = true;
        emit([e, '()', o]);
    })
    vardata[vardata.left - 1] = [];
}
let ccnm = '';
let stbl = {
    File(node) {
        return node.program;
    },
    Program(node) {
        return node.body.join('\n')
    },
    ExpressionStatement(_node) {
        return;
    },
    CallExpression(node) {
        let v = tv();
        ctxflush();
        emit([v, 'invoke', node.callee, ...node.arguments]);
        return v;
    },
    MemberExpression(node) {
        if (node.computed) {
            console.error('ERROR: Computed memberexpression!');
            fs.writeFileSync('cur.json', JSON.stringify(cg, null, '\t'));
            process.exit();
        }
        let v = tv();
        emit([v, '.', node.object, node.property]);
        return v;
    },
    Identifier(node) {
        let nm = `p_${node.name}`;
        while (varmap[nm]) nm = varmap[nm];
        return nm;
    },
    StringLiteral(node) {
        return 's:' + JSON.stringify(node.value);
    },
    NumericLiteral(node) {
        return 'i:' + JSON.stringify(node.value);
    },
    VariableDeclaration(_node) {
        return '';
    },
    VariableDeclarator(node) {
        cxit[ccnm].push(node.id);
        if (node.init) {
            emit([node.id, '()', node.init])
        } else {
            emit([node.id, '', 'null']);
        }
    },
    AssignmentExpression(node) {
        if (node.left.startsWith('p') || node.left.startsWith('vcp')) {
            let t = ('vcp_' + tv());
            uvarmap[t] = node.left;
            varmap[node.left] = t;
            vardata[vardata.length - 1].push(t);
            emit([t, '()', node.right]);
            return t;
        } else {
            emit([node.left, '()', node.right]);
            return node.right;
        }
    },
    WhileStatement(_node, [lbrback, lend, t]) {
        let gt = vardata.slice(0, -1).flatMap(e => e);
        let done = {};
        vardata.pop().reverse().forEach(e => {
            if (done[e]) return;
            let o = e;
            while (!e.startsWith('p') && !done[e] && !gt.includes(e) && uvarmap[e]) {
                done[e] = true;
                e = uvarmap[e];
            }
            delete varmap[e];
            done[o] = true;
            emit([e, '()', o]);
        })
        emit([lend, 'LABEL']);
        emit([lbrback, 'JMPTRUE', compileAll(t)]);

    },
    WhileStatement_pre(node) {
        let lbrback = tv();
        let lend = tv();
        emit([lend, 'JMP', '']);
        emit([lbrback, 'LABEL']);
        let t = node.test;
        delete node.test;
        vardata.push([]);
        return [lbrback, lend, t];
    },
    BinaryExpression(node) {
        let v = tv();
        emit([v, node.operator, node.left, node.right]);
        return v;
    },
    BlockStatement(_node) {
        return ''
    },
    FunctionDeclaration() { },
    FunctionDeclaration_pre(node) {
        cxit[ccnm].push('p_' + node.id.name);
        emit(['p_' + node.id.name, 'FNCTX', node.fnid])
    },
    ReturnStatement(node) {
        ctxflush();
        emit(['retval', 'RET', node.argument])
    },
    UnaryExpression(node) {
        let v = tv();
        emit([v, 'u' + node.operator, node.argument]);
        return v;
    },
    CommentLine(node) {
        if (node.done) return;
        node.done = true;
    }
}
function compileAll(node) {
    if (node instanceof Array) {
        return node.map(compileAll);
    }
    if (!stbl[node.type]) {
        console.error('ERROR: node type unknown: ' + node.type);
        fs.writeFileSync('cur.json', JSON.stringify(node, null, '\t'));
        process.exit(1);
    }
    let pass = null;
    if (stbl[node.type + '_pre']) {
        pass = stbl[node.type + '_pre'](node);
    }
    if (node.type == 'FunctionDeclaration') return;
    for (let k in node) if (node[k] && typeof node[k] == 'object') {
        node[k] = compileAll(node[k]);
    }
    return stbl[node.type](node, pass);
}
let cxid = 0;
function cx() {
    let nm = 'ctx_' + (cxid++).toString();
    cxit[nm] = [];
    return nm;
}
let ftbl = {};
function visitFn(node, cxs = [], forcename = false) {
    if (node instanceof Array) {
        node.forEach(e => visitFn(e, cxs, forcename));
    }
    if (!node) return;
    if (node.v) return;
    node.v = true;

    let cctx = cxs;
    let opts = {
        COMP_MODE: 'FULL_COMP',
        RETURN_TYPE: 'void'
    };;
    if (node.type == 'FunctionDeclaration') {
        opts.NAME = forcename || tv();
        cctx = [...cxs];
        cctx.push(cx())
    }
    if (node.leadingComments) {
        // Oooh, comments. Let's parse them!
        for (let { value } of node.leadingComments) {
            value = value.trim();
            let res;
            if (res = /MICROSCRIPT\((?<str>([A-Za-z0-9_]+=[A-Za-z0-9_]+(,|\)))+)/.exec(value)) {
                // Hooray! MicroScript Config!
                let s = res.groups.str;
                if (!s.slice(-1)[0] == ')') continue;
                let opt = Object.fromEntries(s.slice(0, -1).split(',').map(e => {
                    return e.split('=')
                }));
                let orgNm = opts.NAME;
                Object.assign(opts, opt);
                if (orgNm != opts.NAME) {
                    impureMap[orgNm] = opts.NAME;
                }
            }
        }
    }
    if (node.type == 'FunctionDeclaration') forcename = false;
    if (opts.COMP_MODE == 'FULL_COMP') for (let k in node) if (node[k] && typeof node[k] == 'object') {
        visitFn(node[k], cctx, forcename);
    }
    if (node.type == 'FunctionDeclaration' || opts.COMP_MODE == 'PURE_COPY_PASTE') {
        if (opts.COMP_MODE == 'FULL_COMP') {
            tbl = [];
            ccnm = cctx.slice(-1)[0];
            node.fnid = opts.NAME;
            compileAll(node.body);
            ftbl[opts.NAME] = { data: tbl, ctx: [...cctx], argNames: node.params.map(e => e.name), id: opts.NAME };
        } else if (opts.COMP_MODE == 'PURE_COPY_PASTE') {
            delete node.trailingComments;
            delete node.leadingComments;
            ftbl[opts.NAME] = {
                RETURN: opts.RETURN,
                data: [
                    ['retval', 'PASTE', g.default(node).code]
                ], ctx: ['null_ctx'], argNames: [], id: tv()
            };
        } else if (opts.COMP_MODE == 'COPY_PASTE') {
            node.id.name = opts.NAME;
            delete node.trailingComments;
            delete node.leadingComments;
            ftbl[opts.NAME] = {
                RETURN: opts.RETURN,
                data: [
                    ['retval', 'PASTE', g.default(node).code]
                ], ctx: ['null_ctx'], argNames: node.params.map(e => e.name), id: opts.NAME
            };
        } else if (opts.COMP_MODE == 'CLOSURE_COPY_PASTE') {
            delete node.trailingComments;
            delete node.leadingComments;
            node.id.name = '__' + opts.NAME + '_truefn';
            ftbl[opts.NAME] = {
                RETURN: opts.RETURN,
                data: [
                    ['retval', 'PASTE', g.default({
                        type: 'BlockStatement',
                        body: [node, {
                            type: 'VariableDeclaration',
                            declarations: [{
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: opts.NAME
                                },
                                init: {
                                    type: 'CallExpression',
                                    callee: {
                                        type: 'Identifier',
                                        name: '__' + opts.NAME + '_truefn'
                                    },
                                    arguments: []
                                }
                            }],
                            kind: 'let'
                        }]
                    }).code.trim().slice(1, -1).trim()]
                ], ctx: ['null_ctx'], argNames: node.params.map(e => e.name), id: opts.NAME
            };
        }
    }
}
function doFile(f, isInternals = false, isRoot = false) {
    let code = fs.readFileSync(f).toString();
    let forcename = false;
    if (!isInternals) {
        let fname = f.replace(/[\.\/]/g, '__');
        if (isRoot) {
            fname = '__usermode_start';
            forcename = fname;
        }
        code = `function ${fname}() {\n${code}\n}`;
    }
    let cg = parse.parse(code, {
        plugins: ['typescript'],
        sourceType: 'module'
    });
    cleanup_tree(cg);
    visitFn(cg, [], forcename);
}
doFile('code.js', false, true);
doFile('stdlib/internals.ts', true);
module.exports = { ftbl, cxit, impureMap };