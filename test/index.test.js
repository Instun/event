const { test, describe } = require('node:test');
const assert = require('node:assert');
const createEvent = require('../lib/index.js');

describe('Event Library Tests', async () => {
    test('should resolve immediately if state is already set', async () => {
        const event = createEvent();
        event.set();
        await event.wait();
    });

    test('should wait until state is set', async () => {
        const event = createEvent();
        setTimeout(() => event.set(), 100);
        await event.wait();
    });

    test('should handle multiple concurrent waiters', async () => {
        const event = createEvent();
        const waiterCount = 10;
        const waiters = Array(waiterCount).fill(0).map(() => event.wait());

        setTimeout(() => event.set(), 100);
        await Promise.all(waiters);

        const state = event.getState();
        assert.strictEqual(state.waitCount, 0);
        assert.strictEqual(state.completed, true);
    });

    test('should handle rapid set/reset cycles', async () => {
        const event = createEvent();
        const cycles = 5;

        for (let i = 0; i < cycles; i++) {
            event.set();
            await event.wait();
            event.reset();
            const waitPromise = event.wait();
            event.set();
            await waitPromise;
            event.reset();
        }

        const state = event.getState();
        assert.strictEqual(state.completed, false);
        assert.strictEqual(state.waitCount, 0);
    });

    test('should provide correct state information', async () => {
        const event = createEvent();
        let state = event.getState();
        assert.strictEqual(state.completed, false);
        assert.strictEqual(state.waitCount, 0);

        event.wait();
        state = event.getState();
        assert.strictEqual(state.waitCount, 1);

        event.set();
        state = event.getState();
        assert.strictEqual(state.completed, true);
        assert.strictEqual(state.waitCount, 0);
    });

    test('should handle multiple resets correctly', async () => {
        const event = createEvent();
        event.set();
        event.reset();
        event.reset(); // Multiple resets should be safe

        const waitPromise = event.wait();
        event.set();
        await waitPromise;

        const state = event.getState();
        assert.strictEqual(state.completed, true);
        assert.strictEqual(state.waitCount, 0);
    });

    test('should handle set calls when already set', async () => {
        const event = createEvent();
        event.set();
        event.set(); // Multiple sets should be safe

        await event.wait();
        event.set(); // Set after wait should be safe

        const state = event.getState();
        assert.strictEqual(state.completed, true);
        assert.strictEqual(state.waitCount, 0);
    });

    test('should handle interleaved wait calls', async () => {
        const event = createEvent();
        const wait1 = event.wait();
        const wait2 = event.wait();
        event.set();

        await Promise.all([wait1, wait2]);
        const wait3 = event.wait(); // New wait after set
        await wait3;

        const state = event.getState();
        assert.strictEqual(state.completed, true);
        assert.strictEqual(state.waitCount, 0);
    });

    test('should maintain state consistency under load', async () => {
        const event = createEvent();
        const operations = [];

        // Add multiple concurrent operations
        for (let i = 0; i < 5; i++) {
            operations.push(event.wait());
            if (i % 2 === 0) {
                event.reset();
            }
        }

        setTimeout(() => event.set(), 100);
        await Promise.all(operations);

        const state = event.getState();
        assert.strictEqual(state.completed, true);
        assert.strictEqual(state.waitCount, 0);
    });

    test('should handle reset during pending waits', async () => {
        const event = createEvent();
        const wait1 = event.wait();
        event.reset();
        const wait2 = event.wait();

        // Both waits should still be pending
        const state = event.getState();
        assert.strictEqual(state.completed, false);
        assert.strictEqual(state.waitCount, 2);

        // Resolve both waits
        setTimeout(() => event.set(), 100);
        await Promise.all([wait1, wait2]);

        const finalState = event.getState();
        assert.strictEqual(finalState.completed, true);
        assert.strictEqual(finalState.waitCount, 0);
    });

    test('should keep waiters after reset', async () => {
        const event = createEvent();
        const wait1 = event.wait();
        const wait2 = event.wait();
        
        event.reset();
        const state = event.getState();
        assert.strictEqual(state.waitCount, 2);
        
        event.set();
        await Promise.all([wait1, wait2]);
    });

    test('should handle set-reset-set sequence with waiters', async () => {
        const event = createEvent();
        const promises = [];
        
        // First batch of waiters
        promises.push(event.wait());
        promises.push(event.wait());
        
        event.set();
        event.reset();
        
        // Second batch of waiters
        promises.push(event.wait());
        promises.push(event.wait());
        
        event.set();
        await Promise.all(promises);
        
        const state = event.getState();
        assert.strictEqual(state.completed, true);
        assert.strictEqual(state.waitCount, 0);
    });

    test('should maintain waiter order after reset', async () => {
        const event = createEvent();
        const order = [];
        
        const wait1 = event.wait().then(() => order.push(1));
        const wait2 = event.wait().then(() => order.push(2));
        
        event.reset();
        const wait3 = event.wait().then(() => order.push(3));
        
        event.set();
        await Promise.all([wait1, wait2, wait3]);
        
        assert.deepEqual(order, [1, 2, 3]);
    });

    test('should handle multiple resets with continuous waiters', async () => {
        const event = createEvent();
        const results = [];
        
        // Start first waiter
        const wait1 = event.wait().then(() => results.push('wait1'));
        
        // Reset and add more waiters
        event.reset();
        const wait2 = event.wait().then(() => results.push('wait2'));
        
        event.reset();
        const wait3 = event.wait().then(() => results.push('wait3'));
        
        // All waiters should still be pending
        const state = event.getState();
        assert.strictEqual(state.waitCount, 3);
        
        // Resolve all waiters
        event.set();
        await Promise.all([wait1, wait2, wait3]);
        
        assert.deepEqual(results, ['wait1', 'wait2', 'wait3']);
        assert.strictEqual(event.getState().waitCount, 0);
    });
});
