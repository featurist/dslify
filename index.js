(function() {
    var self = this;
    var escodegen, esprima, transform, paramNamesIn, rewriteIdentifiersUnder, identifiersUnder, rewrite, scopeUnder, variableNamesIn;
    escodegen = require("escodegen");
    esprima = require("esprima");
    transform = function(func, gen1_options) {
        var dslName;
        dslName = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "dslName") && gen1_options.dslName !== void 0 ? gen1_options.dslName : "_dsl";
        var parsed, funcExpression, js;
        parsed = esprima.parse("(" + func.toString() + ")");
        rewriteIdentifiersUnder(parsed, dslName);
        funcExpression = parsed.body[0].expression;
        funcExpression.params = [ {
            type: "Identifier",
            name: dslName
        } ].concat(funcExpression.params);
        js = escodegen.generate(funcExpression.body).replace(/(^\s*\{|\}\s*$)/g, "");
        return Function.apply(null, paramNamesIn(funcExpression).concat(js));
    };
    exports.transform = transform;
    paramNamesIn = function(funcExpression) {
        var params, gen2_items, gen3_i, item;
        params = [];
        gen2_items = funcExpression.params;
        for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
            item = gen2_items[gen3_i];
            params.push(item.name);
        }
        return params;
    };
    rewriteIdentifiersUnder = function(node, dslName) {
        var identifiers, gen4_items, gen5_i, identifier;
        identifiers = identifiersUnder(node);
        gen4_items = identifiers;
        for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
            identifier = gen4_items[gen5_i];
            rewrite(identifier, dslName);
        }
        return void 0;
    };
    identifiersUnder = function(node) {
        var visit, visitArray, visitObject, scope, identifiers, variables;
        visit = function(node, scope) {
            if (!node || node.type === "Property") {
                return;
            } else {
                scope = scopeUnder(node, scope);
                if (node.type === "VariableDeclaration") {
                    return variables = variables.concat(variableNamesIn(node.declarations));
                } else if (node.type === "Identifier" && variables.indexOf(node.name) === -1) {
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
            var gen6_items, gen7_i, item;
            gen6_items = node;
            for (gen7_i = 0; gen7_i < gen6_items.length; ++gen7_i) {
                item = gen6_items[gen7_i];
                visit(item, scope);
            }
            return void 0;
        };
        visitObject = function(node, scope) {
            var key;
            for (key in node) {
                (function(key) {
                    if (key !== "params" && key !== "property") {
                        visit(node[key], scope);
                    }
                })(key);
            }
            return void 0;
        };
        scope = {};
        identifiers = [];
        variables = [];
        visit(node, scope);
        return identifiers;
    };
    rewrite = function(identifier, dslName) {
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
            name: dslName
        };
        identifier.property = {
            type: "Identifier",
            name: identifier.name
        };
        return delete identifier.name;
    };
    scopeUnder = function(node, parentScope) {
        var newScope, gen8_items, gen9_i, key, paramNames, gen10_items, gen11_i, name;
        if (node.type === "FunctionExpression") {
            newScope = {};
            gen8_items = Object.keys(parentScope);
            for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
                key = gen8_items[gen9_i];
                newScope[key] = parentScope[key];
            }
            paramNames = paramNamesIn(node);
            gen10_items = paramNames;
            for (gen11_i = 0; gen11_i < gen10_items.length; ++gen11_i) {
                name = gen10_items[gen11_i];
                newScope[name] = true;
            }
            return newScope;
        } else {
            return parentScope;
        }
    };
    variableNamesIn = function(declarations) {
        var names, gen12_items, gen13_i, declaration;
        names = [];
        gen12_items = declarations;
        for (gen13_i = 0; gen13_i < gen12_items.length; ++gen13_i) {
            declaration = gen12_items[gen13_i];
            names.push(declaration.id.name);
        }
        return names;
    };
}).call(this);