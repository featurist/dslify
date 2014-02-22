(function (_dsl) {
    module.exports = {
        printTheTime: function (printer) {
            var self = this;
            var now;
            now = _dsl.clock.tellTheTime();
            return printer.print('The time is ' + now);
        }
    };
})(require('./dsl'))