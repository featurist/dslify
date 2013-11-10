# dslify

Rewrites a JavaScript function, such that any global property access is transformed to call a member of a new _dsl_ argument. Use dslify to interpret domain-specific languages without messing about in global scope.

### Install

    npm install dslify

### Example

    var dslify = require('dslify');

    var leaky = function() { return say(word); };
    var shout = dslify.transform(leaky);

    console.log(shout.toString())
    //-> function anonymous(_dsl) { return _dsl.say(_dsl.word); }

    var dsl = {
        say: function(it) { return it + "!!"; },
        word: "unicorns"
    };
    console.log(shout(dsl));
    //-> unicorns!!

### How?
dslify parses functions using [esprima](https://github.com/ariya/esprima), rewriting them as new functions using  [escodegen](https://github.com/Constellation/escodegen).

### Hold on, isn't this just a long-winded JavaScript 'with'?
Yes. But 'with' is [leaky and dangerous](http://www.yuiblog.com/blog/2006/04/11/with-statement-considered-harmful/), wheras dslify is like a sandbox because it rewrites access to global scope, e.g:

    var dslify = require('dslify');

    var dsl = {};

    var withWith = function(dsl) {
        with (dsl) {
            y = 'leaks into global!';
        }
    };
    var withDslify = dslify.transform(function() {
        z = 'global is safe!';
    });

    withWith(dsl);
    withDslify(dsl);

    console.log(global.y);  // leaks into global!
    console.log(global.z);  // undefined
    console.log(dsl.z);     // global is safe!

### Isn't it hard to debug dynamically-generated functions?
Yes. And dynamically generating functions is relatively slow, compared to calling functions. Therefore consider transforming functions at build time instead of run time.

### License
BSD
