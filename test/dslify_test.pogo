dslify = require '../index'
escodegen = require 'escodegen'
esprima = require 'esprima'

(actual) rewrites as (expected) =
    normalise (dslify.transform (actual)).should.equal (normalise(expected))

normalise (fn) =
    parsed = esprima.parse "(#(fn.to string()))".body.0
    escodegen.generate (parsed).replace "function anonymous(" "function ("

describe 'dslify'

    it 'rewrites a function so global variables become DSL accessors'
        dsl = {
            scream (word) = "#(word)!!"
            nice word = "unicorns"
        }
        scream it () =
            scream (nice word)
        
        transformed = dslify.transform(scream it)
        transformed(dsl).should.equal "unicorns!!"
    
    it 'preserves any existing function parameters'
        dsl = {
            scream (word1, word2) = "#(word1)!! #(word2)!!"
        }
        scream them (a, b) =
            scream (a, b)
    
        transformed = dslify.transform(scream them)
        transformed(dsl, "lasers", "sharks").should.equal "lasers!! sharks!!"

    it 'rewrites a function with global variables bound to a new _dsl argument'
        @{
            x + y
        } rewrites as @(_dsl)
            _dsl.x + _dsl.y

    it 'prepends the _dsl argument to any existing arguments'
        @(a, b) @{
            a + b + x
        } rewrites as @(_dsl, a, b) @{
            a + b + _dsl.x
        }

    it 'does not bind property accessors'
        @{
            window.foo.bar
        } rewrites as @(_dsl)
            _dsl.window.foo.bar

    it 'does not overwrite nested function parameters'
        fn (x) =
            foo (a, b) @(c, d)
                x.bar(baz(a, b, c, d))
                bar (c) @(x)
                    c + x
        
        (fn) rewrites as @(_dsl, x)
            _dsl.foo (_dsl.a, _dsl.b) @(c, d)
                x.bar(_dsl.baz(_dsl.a, _dsl.b, c, d))
                _dsl.bar (c) @(x)
                    c + x