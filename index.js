(function() {
    var self = this;
    var escodegen, esprima, transform, paramNamesIn, rewriteIdentifiersUnder, identifiersUnder, rewrite, scopeUnder, variableNamesIn;
    escodegen = require("escodegen");
    esprima = require("esprima");
    transform = function(func, gen1_options) {
        var dslName;
        dslName = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "dslName") && gen1_options.dslName !== void 0 ? gen1_options.dslName : "_dsl";
        var parsed, funcExpression, js, params;
        parsed = esprima.parse("(" + func.toString() + ")");
        rewriteIdentifiersUnder(parsed, dslName);
        funcExpression = parsed.body[0].expression;
        funcExpression.params = [ {
            type: "Identifier",
            name: dslName
        } ].concat(funcExpression.params);
        js = escodegen.generate(funcExpression.body).replace(/(^\s*\{|\}\s*$)/g, "");
        params = paramNamesIn(funcExpression);
        return Function.apply(null, params.concat(js));
    };
    exports.transform = transform;
    paramNamesIn = function(funcExpression) {
        return function() {
            var gen2_results, gen3_items, gen4_i, p;
            gen2_results = [];
            gen3_items = funcExpression.params;
            for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                p = gen3_items[gen4_i];
                gen2_results.push(p.name);
            }
            return gen2_results;
        }();
    };
    rewriteIdentifiersUnder = function(node, dslName) {
        var identifiers, gen5_items, gen6_i, identifier;
        identifiers = identifiersUnder(node);
        gen5_items = identifiers;
        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
            identifier = gen5_items[gen6_i];
            rewrite(identifier, dslName);
        }
        return void 0;
    };
    identifiersUnder = function(node) {
        var visit, descend, visitArray, visitObject, scope, identifiers, variables;
        visit = function(node, scope) {
            if (!node || node.type === "Property") {
                return;
            } else {
                return descend(node, scope);
            }
        };
        descend = function(node, scope) {
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
        };
        visitArray = function(node, scope) {
            var gen7_items, gen8_i, item;
            gen7_items = node;
            for (gen8_i = 0; gen8_i < gen7_items.length; ++gen8_i) {
                item = gen7_items[gen8_i];
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
    variableNamesIn = function(declarations) {
        return function() {
            var gen13_results, gen14_items, gen15_i, d;
            gen13_results = [];
            gen14_items = declarations;
            for (gen15_i = 0; gen15_i < gen14_items.length; ++gen15_i) {
                d = gen14_items[gen15_i];
                gen13_results.push(d.id.name);
            }
            return gen13_results;
        }();
    };
}).call(this);