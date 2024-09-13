module.exports = function () {
    var resolvers = [];
    var state = false;

    return {
        wait: function () {
            var promise = new Promise((resolve, reject) => {
                if (state)
                    resolve();
                else
                    resolvers.push(resolve);
            });

            return promise;
        },
        set: function () {
            state = true;
            resolvers.forEach(resolve => resolve());
        }
    };
}
