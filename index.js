(function() {
    var self = this;
    var escodegen, esprima, transform, paramNamesIn, rewriteIdentifiersUnder, identifiersUnder, rewrite, addFunctionArguments;
    escodegen = require("escodegen");
    esprima = require("esprima");
    transform = function(func, gen1_options) {
        var dslName, asString;
        dslName = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "dslName") && gen1_options.dslName !== void 0 ? gen1_options.dslName : "_dsl";
        asString = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "asString") && gen1_options.asString !== void 0 ? gen1_options.asString : false;
        var parsed, funcExpression, params, js;
        parsed = esprima.parse("(" + func.toString() + ")");
        rewriteIdentifiersUnder(parsed, dslName);
        if (asString) {
            return escodegen.generate(parsed).replace(/(^\s*\(|\);\s*$)/g, "");
        } else {
            funcExpression = parsed.body[0].expression;
            params = paramNamesIn(funcExpression);
            js = escodegen.generate(funcExpression.body).replace(/(^\s*\{|\}\s*$)/g, "");
            return Function.apply(null, [ dslName ].concat(params).concat(js));
        }
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
        var visit, visitArray, visitObject, scope, identifiers, variables;
        visit = function(node, scope) {
            if (!node || node.type === "Property" || node === "VariableDeclaration") {
                return;
            } else {
                addFunctionArguments(node, scope);
                if (node.type === "VariableDeclarator") {
                    return scope[node.id.name] = true;
                } else if (node.type === "Identifier") {
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
    addFunctionArguments = function(node, parentScope) {
        var paramNames, gen9_items, gen10_i, name;
        if (node.type === "FunctionExpression") {
            paramNames = paramNamesIn(node);
            gen9_items = paramNames;
            for (gen10_i = 0; gen10_i < gen9_items.length; ++gen10_i) {
                name = gen9_items[gen10_i];
                parentScope[name] = true;
            }
            return void 0;
        }
    };
}).call(this);