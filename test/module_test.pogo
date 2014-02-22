dslify = require '../index'
fs = require 'fs'
pogo = require 'pogo'

describe 'dslify.transform module()'

    before
        pogo module = fs.read file sync './test/modules/component.pogo' 'utf-8'
        js module = pogo.compile (pogo module, in scope: true)
        transformed = dslify.transform module (js module, './dsl')
        fs.write file sync './test/modules/component.js' (transformed)

    it 'rewrites the module to depend on an external dsl'
        component = require './modules/component.js'
        printer = { print (time) = "#(time)!" }
        component.print the time (printer).should.equal "The time is 1999!"

    it 'safely rewrites pogo async functions'
        component = require './modules/component.js'
        printer = { print (time) = "#(time)?" }
        component.print the time soon! (printer).should.equal "The time is soon?"
