let p = require('@babel/parser');
let fs = require('fs');
let ast = p.parse(fs.readFileSync('stdlib/x.d.ts').toString(), {
    plugins: ['typescript'],
    sourceType: 'module'
});
let types = {};
let funcs = {};
let id = 0;
let globals = {};
function tv() {
    return '_dts_func_' + (id++).toString(16);
}
function strtype(n, thisType) {
    let { typeAnnotation } = n;
    if (typeAnnotation.type == 'TSNumberKeyword') return 'number';
    if (typeAnnotation.type == 'TSStringKeyword') return 'string';
    if (typeAnnotation.type == 'TSBooleanKeyword') return 'boolean';
    if (typeAnnotation.type == 'TSSymbolKeyword') return 'symbol';
    if (typeAnnotation.type == 'TSVoidKeyword') return 'void';
    if (typeAnnotation.type == 'TSUndefinedKeyword') return 'void';
    if (typeAnnotation.type == 'TSThisType') return thisType;
    if (typeAnnotation.type == 'TSNullKeyword') return 'null';
    if (typeAnnotation.type == 'TSTypeReference') {
        return typeAnnotation.typeName.name;
    }
    if (typeAnnotation.type == 'TSFunctionType') return 'func(__internal_anyfunc)';
    if (typeAnnotation.type == 'TSTypePredicate') return 'typeeval(object)';
    if (typeAnnotation.type == 'TSAnyKeyword') return '__internal_anyval';
    if (typeAnnotation.type == 'TSLiteralType') return typeAnnotation.literal.type.split('Literal')[0].toLowerCase();
    if (typeAnnotation.type == 'TSUnionType') return strtype({ typeAnnotation: typeAnnotation.types.slice(-1)[0] })
    if (typeAnnotation.type == 'TSArrayType') return strtype({ typeAnnotation: typeAnnotation.elementType }, thisType);
    console.log(n)
}
function traverse(node, ns) {
    if (node instanceof Array) return node.forEach(e => traverse(e, ns));
    if (node.type == 'ClassDeclaration' || node.type == 'TSInterfaceDeclaration') {
        let nm = node.id.name;
        ns[nm] = {};
        for (let e of node.body.body) {
            switch (e.type) {
                case 'ClassProperty':
                    ns[nm][e.key.name] = strtype(e.typeAnnotation, nm);
                    break;
                case 'TSDeclareMethod':
                    let fnType = tv();
                    ns[nm][e.key.name] = `func(${fnType})`
                    funcs[fnType] = {
                        paramTypes: e.params.map(f => strtype(f.typeAnnotation, nm)),
                        paramNames: e.params.map(f => f.name),
                        retval: strtype(e.returnType || { typeAnnotation: { type: 'TSVoidKeyword' } }, nm)
                    };
                    break;
                case 'TSCallSignatureDeclaration':
                    break;
                case 'TSMethodSignature':
                    {
                        let fnType = tv();
                        ns[nm][e.key.name] = `func(${fnType})`
                        funcs[fnType] = {
                            paramTypes: e.parameters.map(f => strtype(f.typeAnnotation, nm)),
                            paramNames: e.parameters.map(f => f.name),
                            retval: strtype(e.typeAnnotation || { typeAnnotation: { type: 'TSVoidKeyword' } }, nm)
                        };
                    }
                    break;
                case 'TSIndexSignature':
                    ns[nm].__indexType = strtype(e.typeAnnotation);
                    break;
                case 'TSPropertySignature':
                    ns[nm][e.key.name] = strtype(e.typeAnnotation);
                    break;
                default:
                    console.log(e)
                    break;
            }
        }
        return;
    }
    if (node.type == 'TSDeclareFunction') {
        let retype = strtype(node.returnType, null);
        if (retype == '__internal_anyval') {
            return;
        }
        let fnType = tv();
        ns[node.id.name] = `func(${fnType})`
        funcs[fnType] = {
            paramTypes: node.params.map(f => strtype(f.typeAnnotation, false)),
            paramNames: node.params.map(e => e.name),
            retval: strtype(node.returnType || { typeAnnotation: { type: 'TSVoidKeyword' } }, null)
        };
        return;
    }
    if (node.type == 'TSModuleDeclaration') {
        let typeName = tv();
        ns[typeName] = {};
        traverse(node.body.body, ns[typeName]);
        return;
    }
    if (node.type == 'ExportNamedDeclaration') {
        let id = ((node.declaration.id) || (node.declaration.declarations[0].id)).name;
        ns[id] = {};
        traverse(node.declaration, ns[id]);
        return;
    }
    if (node.type == 'VariableDeclaration') {
        traverse(node.declarations, ns);
        return;
    }
    if (node.type == 'VariableDeclarator') {
        ns[node.id.name] = strtype(node.id.typeAnnotation);
        return;
    }
    console.log(node);
}
traverse(ast.program.body, types)
//console.log(types, funcs);