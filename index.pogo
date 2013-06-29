escodegen = require 'escodegen'
esprima = require 'esprima'

transform (func, dsl name: '_dsl') =
    parsed = esprima.parse "(#(func.to string()))"
    rewrite identifiers under (parsed, dsl name)
    func expression = parsed.body.0.expression
    params = param names in (func expression)
    js = escodegen.generate(func expression.body).replace(r/(^\s*\{|\}\s*$)/g, '')
    Function.apply(null, [dsl name].concat(params).concat(js))

exports.transform = transform

param names in (func expression) =
    params = []
    for each @(item) in (func expression.params)
        params.push (item.name)
    
    params

rewrite identifiers under (node, dsl name) =
    identifiers = identifiers under (node)
    for each @(identifier) in (identifiers)
        rewrite (identifier, dsl name)

identifiers under (node) =
    visit (node, scope) =
        if (!node)
            return
        else
            scope := scope under (node, scope)
            if (node.type == 'Identifier')
                node._scope = scope
                identifiers.push(node)
            else if (node :: Array)
                visit array (node, scope)
            else if (node :: Object)
                visit object (node, scope)
    
    visit array (node, scope) =
        for each @(item) in (node)
            visit (item, scope)
    
    visit object (node, scope) =
        for each @(key) in (Object.keys(node))
            if ((key != 'params') && (key != 'property'))
                visit (node.(key), scope)        
    
    scope = {}
    identifiers = []
    visit (node, scope)
    identifiers

rewrite (identifier, dsl name) =
    scope = identifier._scope
    delete (identifier._scope)
    
    if (scope.(identifier.name))
        return

    identifier.type = 'MemberExpression'
    identifier.computed = false
    identifier.object = {
        type = 'Identifier'
        name = dsl name
    }
    identifier.property = {
        type = 'Identifier'
        name = identifier.name
    }
    delete (identifier.name)

scope under (node, parent scope) =
    if (node.type == 'FunctionExpression')
        new scope = {}
        for each @(key) in (Object.keys(parent scope))
            new scope.(key) = parent scope.(key)
            
        param names = param names in (node)
        for each @(name) in (param names)
            new scope.(name) = true
        
        new scope
    else
        parent scope
