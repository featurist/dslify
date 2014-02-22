escodegen = require 'escodegen'
esprima = require 'esprima'

transform (func, dsl name: '_dsl', as string: false) =
    parsed = esprima.parse "(#(func.to string()))"
    rewrite identifiers under (parsed, dsl name)
    if (as string)
        escodegen.generate(parsed).replace(r/(^\s*\(|\);\s*$)/g, '')
    else
        func expression = parsed.body.0.expression
        params = param names in (func expression)
        js = escodegen.generate(func expression.body).replace(r/(^\s*\{|\}\s*$)/g, '')
        Function.apply(null, [dsl name].concat(params).concat(js))

transform module (js string, dsl module path, dsl name: '_dsl') =
    function wrapper = "function(#(dsl name)) { #(js string) }"
    transformed = transform (function wrapper, dsl name: dsl name, as string: true).to string()
    "(#(transformed))(require('#(dsl module path)'))"

exports.transform = transform
exports.transform module = transform module

param names in (func expression) =
    [p.name, where: p <- func expression.params]

rewrite identifiers under (node, dsl name) =
    identifiers = identifiers under (node)
    for each @(identifier) in (identifiers)
        rewrite (identifier, dsl name)

identifiers under (node) =
    visit (node, scope) =
        if (node)
            visit node (node, scope)

    type visitors = {

        VariableDeclarator (node) =
            scope.(node.id.name) = true

        Identifier (node) =
            node._scope = scope
            identifiers.push(node)

        Property (node) =
             visit (node.value, scope)

    }

    visit node (node, scope) =
        add function arguments(node, scope)

        type visitor = type visitors.(node.type)

        if (type visitor)
            type visitor (node)
        else if (node :: Array)
            visit array (node, scope)
        else if (node :: Object)
            visit object (node, scope)

    visit array (node, scope) =
        for each @(item) in (node)
            visit (item, scope)

    visit object (node, scope) =
        for @(key) in (node)
            if ((key != 'params') && (key != 'property'))
                visit (node.(key), scope)

    scope = {}
    identifiers = []
    visit (node, scope)
    identifiers

rewrite (id, dsl name) =
    scope = id._scope
    delete (id._scope)

    if (scope.(id.name) || (id.name == 'module' || id.name == 'arguments'))
        return

    id.type = 'MemberExpression'
    id.computed = false
    id.object = {
        type = 'Identifier'
        name = dsl name
    }
    id.property = {
        type = 'Identifier'
        name = id.name
    }
    delete (id.name)

add function arguments (node, parent scope) =
    if (node.type == 'FunctionExpression')
        param names = param names in (node)
        for each @(name) in (param names)
            parent scope.(name) = true
