/**
 * Create an event waiting instance
 * @returns {Object} Event waiting instance
 */
module.exports = function () {
    let resolvers = [];
    let state = false;

    return {
        /**
         * Wait for the event
         * @returns {Promise} Waiting Promise
         */
        wait() {
            return new Promise((resolve) => {
                if (state) {
                    resolve();
                } else {
                    resolvers.push(resolve);
                }
            });
        },

        /**
         * Set the event as completed
         */
        set() {
            state = true;
            resolvers.forEach(resolve => resolve());
            resolvers = [];
        },

        /**
         * Reset the event state
         */
        reset() {
            state = false;
        },

        /**
         * Get current state
         * @returns {Object} Current state object
         */
        getState() {
            return {
                completed: state,
                waitCount: resolvers.length
            };
        }
    };
}
