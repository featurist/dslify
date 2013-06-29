(function() {
    var self = this;
    var escodegen, esprima, transform, paramNamesIn, rewriteIdentifiersUnder, identifiersUnder, rewrite, scopeUnder;
    escodegen = require("escodegen");
    esprima = require("esprima");
    transform = function(func) {
        var parsed, funcExpression, params, js;
        parsed = esprima.parse("(" + func.toString() + ")");
        rewriteIdentifiersUnder(parsed);
        funcExpression = parsed.body[0].expression;
        params = paramNamesIn(funcExpression);
        js = escodegen.generate(funcExpression.body).replace(/(^\s*\{|\}\s*$)/g, "");
        return Function.apply(null, [ "_dsl" ].concat(params).concat(js));
    };
    exports.transform = transform;
    paramNamesIn = function(funcExpression) {
        var params, gen1_items, gen2_i, item;
        params = [];
        gen1_items = funcExpression.params;
        for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
            item = gen1_items[gen2_i];
            params.push(item.name);
        }
        return params;
    };
    rewriteIdentifiersUnder = function(node) {
        var identifiers, gen3_items, gen4_i, identifier;
        identifiers = identifiersUnder(node);
        gen3_items = identifiers;
        for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
            identifier = gen3_items[gen4_i];
            rewrite(identifier);
        }
        return void 0;
    };
    identifiersUnder = function(node) {
        var visit, visitArray, visitObject, scope, identifiers;
        visit = function(node, scope) {
            if (!node) {
                return;
            } else {
                scope = scopeUnder(node, scope);
                if (node.type === "Identifier") {
                    node._scope = scope;
                    return identifiers.push(node);
                } else if (node instanceof Array) {
                    return visitArray(node, scope);
                } else if (node instanceof Object) {
                    return visitObject(node, scope);
                }
            }
        };
        visitArray = function(node, scope) {
            var gen5_items, gen6_i, item;
            gen5_items = node;
            for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                item = gen5_items[gen6_i];
                visit(item, scope);
            }
            return void 0;
        };
        visitObject = function(node, scope) {
            var gen7_items, gen8_i, key;
            gen7_items = Object.keys(node);
            for (gen8_i = 0; gen8_i < gen7_items.length; ++gen8_i) {
                key = gen7_items[gen8_i];
                if (key !== "params" && key !== "property") {
                    visit(node[key], scope);
                }
            }
            return void 0;
        };
        scope = {};
        identifiers = [];
        visit(node, scope);
        return identifiers;
    };
    rewrite = function(identifier) {
        var scope;
        scope = identifier._scope;
        delete identifier._scope;
        if (scope[identifier.name]) {
            return;
        }
        identifier.type = "MemberExpression";
        identifier.computed = false;
        identifier.object = {
            type: "Identifier",
            name: "_dsl"
        };
        identifier.property = {
            type: "Identifier",
            name: identifier.name
        };
        return delete identifier.name;
    };
    scopeUnder = function(node, parentScope) {
        var newScope, gen9_items, gen10_i, key, paramNames, gen11_items, gen12_i, name;
        if (node.type === "FunctionExpression") {
            newScope = {};
            gen9_items = Object.keys(parentScope);
            for (gen10_i = 0; gen10_i < gen9_items.length; ++gen10_i) {
                key = gen9_items[gen10_i];
                newScope[key] = parentScope[key];
            }
            paramNames = paramNamesIn(node);
            gen11_items = paramNames;
            for (gen12_i = 0; gen12_i < gen11_items.length; ++gen12_i) {
                name = gen11_items[gen12_i];
                newScope[name] = true;
            }
            return newScope;
        } else {
            return parentScope;
        }
    };
}).call(this);