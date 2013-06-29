# dslify

Rewrites a JavaScript function, such that any global property access is transformed to call a member of a _dsl_ argument. Use dslify to build small domain-specific languages and configuration utilities.

### Install

    npm install dslify

### Example

    var dslify = require('dslify');
    
    var fn = function() { return shout(word); };
    var shouter = dslify.transform(fn);
    
    var dsl = {
        shout: function(something) {
            return something + "!!";
        },
        word: "unicorns"
    };
    shouter(dsl); // unicorns!!

### How?
dslify parses functions using [esprima](https://github.com/ariya/esprima), rewriting them as new functions using  [escodegen](https://github.com/Constellation/escodegen).

### Is this wise?

Maybe, maybe not. You decide.

### License

BSD