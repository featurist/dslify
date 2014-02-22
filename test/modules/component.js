(function (_dsl) {
    (function () {
        var gen1_rethrowErrors = function (continuation, block) {
            return function (error, result) {
                if (error) {
                    return continuation(error);
                } else {
                    try {
                        return block(result);
                    } catch (ex) {
                        return continuation(ex);
                    }
                }
            };
        };
        var gen2_continuationOrDefault = function (args) {
            var c = args[args.length - 1];
            if (c instanceof Function) {
                return c;
            } else {
                return function (error, result) {
                    if (error) {
                        throw error;
                    } else {
                        return result;
                    }
                };
            }
        };
        var self = this;
        module.exports = {
            printTheTime: function (printer) {
                var self = this;
                var now;
                now = _dsl.clock.tellTheTime();
                return printer.print('The time is ' + now);
            },
            printTheTimeSoon: function (printer, continuation) {
                var self = this;
                var gen3_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                continuation = gen2_continuationOrDefault(arguments);
                printer = gen3_arguments[0];
                return _dsl.clock.tellTheTimeAsync(gen1_rethrowErrors(continuation, function (gen4_asyncResult) {
                    var now;
                    now = gen4_asyncResult;
                    return continuation(void 0, printer.print('The time is ' + now));
                }));
            }
        };
    }.call(this));
})(require('./dsl'))