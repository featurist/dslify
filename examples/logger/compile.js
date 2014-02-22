var dslify = require('../../index');
var fs = require('fs');
var abstract = fs.readFileSync('./abstract.js', 'utf-8');
var concrete = dslify.transformModule(abstract, './printer');
fs.writeFileSync('./concrete.js', concrete);

concrete = require('./concrete.js');
concrete.log('jibber jabber');