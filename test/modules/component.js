(function (_dsl) {
    (function () {
        var self = this;
        module.exports = {
            printTheTime: function (printer) {
                var self = this;
                var now;
                now = _dsl.clock.tellTheTime();
                return printer.print('The time is ' + now);
            },
            printTheTimeSoon: function (printer) {
                var self = this;
                var gen1_asyncResult, now;
                return new _dsl.Promise(function (gen2_onFulfilled) {
                    gen2_onFulfilled(_dsl.Promise.resolve(_dsl.clock.tellTheTimeAsync).then(function (gen1_asyncResult) {
                        now = gen1_asyncResult;
                        return printer.print('The time is ' + now);
                    }));
                });
            }
        };
    }.call(this));
})(require('./dsl'))