# dslify

Rewrites a JavaScript function or module, such that any global property access
is transformed to call a member of a new _dsl_ argument. Use dslify to interpret
domain-specific languages without messing around in global scope.

[![Build Status](https://secure.travis-ci.org/featurist/dslify.png?branch=master)](http://travis-ci.org/featurist/dslify)

[![Dependency status](https://david-dm.org/featurist/dslify.png)](https://david-dm.org/featurist/dslify)

### Install

    npm install dslify

### Rewriting Functions

```js
var dslify = require('dslify')

var script = function() {
  return addHorn(addLegs(makeAnimal()))
}

var shouter = dslify.transform(fn)

var dsl = {
  makeAnimal() {
    return {}
  },
  addLegs(animal) {
    animal.legs = 4
    return animal
  },
  addHorn(animal) {
    animal.horns = 1
    return animal
  }
}

factory(dsl) // => { legs: 4, horns: 1 }
```

Sometimes you might want to operate with strings instead of JavaScript functions. For
example if you are generating templates or want to send JavaScript to the client.

```js
var dslify = require('dslify')

var input = "function(input) { return shout(input, globalValue) }"
var output = dslify.transform(input, { asString: true })

output // => function(input) { return shout(input, _dsl.globalValue) }
```

### Rewriting Modules

By rewriting an entire module in terms of another 'dsl' interpreter module, you
can make slightly larger DSLs:

```js
// abstract.js
module.exports = {
  log: function(message) {
    print(message);
  }
};

// printer.js
module.exports = {
  print: function(message) {
    console.log(message + '!')
  }
};

// compile.js
var dslify = require('dslify');
var abstract = require('fs').readFileSync('./abstract.js', 'utf-8');
var concrete = dslify.transformModule(abstract, './printer');
fs.writeFileSync('./concrete.js', concrete);

// then...
var concrete = require('./concrete.js');
concrete.log('jibber jabber'); // -> jibber jabber!
```

### How?
dslify parses JavaScript using [esprima](https://github.com/ariya/esprima), rewriting it as new JavaScript using  [escodegen](https://github.com/Constellation/escodegen).

### Hold on, isn't this just a long-winded JavaScript 'with'?
Yes. But 'with' is [leaky and dangerous](http://www.yuiblog.com/blog/2006/04/11/with-statement-considered-harmful/), wheras dslify is like a sandbox because it rewrites access to global scope, e.g:

```js
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
```

### Isn't it hard to debug dynamically-generated functions?
Yes. And dynamically generating functions is relatively slow, compared to calling
functions. Therefore consider transforming functions at build time instead of run time.

### License
BSD
