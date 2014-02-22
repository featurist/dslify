(function (_dsl) {
    module.exports = {
        log: function (message) {
            _dsl.print(message);
        }
    };
})(require('./printer'))