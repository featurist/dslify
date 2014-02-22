(function() {
    var self = this;
    var escodegen, esprima, transform, transformModule, paramNamesIn, rewriteIdentifiersUnder, identifiersUnder, rewrite, addFunctionArguments;
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
    transformModule = function(jsString, dslModulePath, gen2_options) {
        var dslName;
        dslName = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "dslName") && gen2_options.dslName !== void 0 ? gen2_options.dslName : "_dsl";
        var functionWrapper, transformed;
        functionWrapper = "function(" + dslName + ") { " + jsString + " }";
        transformed = transform(functionWrapper, {
            dslName: dslName,
            asString: true
        }).toString();
        return "(" + transformed + ")(require('" + dslModulePath + "'))";
    };
    exports.transform = transform;
    exports.transformModule = transformModule;
    paramNamesIn = function(funcExpression) {
        return function() {
            var gen3_results, gen4_items, gen5_i, p;
            gen3_results = [];
            gen4_items = funcExpression.params;
            for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                p = gen4_items[gen5_i];
                gen3_results.push(p.name);
            }
            return gen3_results;
        }();
    };
    rewriteIdentifiersUnder = function(node, dslName) {
        var identifiers, gen6_items, gen7_i, identifier;
        identifiers = identifiersUnder(node);
        gen6_items = identifiers;
        for (gen7_i = 0; gen7_i < gen6_items.length; ++gen7_i) {
            identifier = gen6_items[gen7_i];
            rewrite(identifier, dslName);
        }
        return void 0;
    };
    identifiersUnder = function(node) {
        var visit, typeVisitors, visitNode, visitArray, visitObject, scope, identifiers;
        visit = function(node, scope) {
            if (node) {
                return visitNode(node, scope);
            }
        };
        typeVisitors = {
            VariableDeclarator: function(node) {
                var self = this;
                return scope[node.id.name] = true;
            },
            Identifier: function(node) {
                var self = this;
                node._scope = scope;
                return identifiers.push(node);
            },
            Property: function(node) {
                var self = this;
                return visit(node.value, scope);
            }
        };
        visitNode = function(node, scope) {
            var typeVisitor;
            addFunctionArguments(node, scope);
            typeVisitor = typeVisitors[node.type];
            if (typeVisitor) {
                return typeVisitor(node);
            } else if (node instanceof Array) {
                return visitArray(node, scope);
            } else if (node instanceof Object) {
                return visitObject(node, scope);
            }
        };
        visitArray = function(node, scope) {
            var gen8_items, gen9_i, item;
            gen8_items = node;
            for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
                item = gen8_items[gen9_i];
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
        visit(node, scope);
        return identifiers;
    };
    rewrite = function(id, dslName) {
        var scope;
        scope = id._scope;
        delete id._scope;
        if (scope[id.name] || id.name === "module" || id.name === "arguments") {
            return;
        }
        id.type = "MemberExpression";
        id.computed = false;
        id.object = {
            type: "Identifier",
            name: dslName
        };
        id.property = {
            type: "Identifier",
            name: id.name
        };
        return delete id.name;
    };
    addFunctionArguments = function(node, parentScope) {
        var paramNames, gen10_items, gen11_i, name;
        if (node.type === "FunctionExpression") {
            paramNames = paramNamesIn(node);
            gen10_items = paramNames;
            for (gen11_i = 0; gen11_i < gen10_items.length; ++gen11_i) {
                name = gen10_items[gen11_i];
                parentScope[name] = true;
            }
            return void 0;
        }
    };
}).call(this);