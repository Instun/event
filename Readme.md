# @instun/event

A lightweight Promise-based event implementation.

## Features

- Promise-based API
- Simple event state management
- No external dependencies
- Works in fibjs, Node.js, browsers, and React Native

## Installation

```bash
fibjs --install @instun/event
```

## Usage

```javascript
const createEvent = require('@instun/event');

// Create a new event instance
const event = createEvent();

// Wait for the event
event.wait().then(() => {
    console.log('Event was set!');
});

// Set the event
event.set();  // All waiters will be notified

// Reset the event
event.reset();  // Event returns to non-signaled state

// Check event state
const state = event.getState();
console.log(state);  // { completed: false, waitCount: 0 }
```

## API

### createEvent()

Creates a new event instance.

### Methods

#### wait()

- Returns: `Promise<void>`
- Waits for the event to be set
- If the event is already set, resolves immediately
- If the event is not set, adds the waiter to the queue

#### set()

- Sets the event to completed state
- Resolves all pending waiters
- Future wait() calls will resolve immediately until reset() is called

#### reset()

- Sets the event back to initial state
- Does not affect existing waiters
- Future wait() calls will queue until the next set()

#### getState()

- Returns: `{ completed: boolean, waitCount: number }`
- `completed`: Whether the event is currently set
- `waitCount`: Number of pending waiters

## Behavior

1. When created, the event starts in initial state
2. set() changes the event to completed state and resolves all waiters
3. reset() returns the event to initial state without affecting waiters
4. Multiple set() calls while already set have no additional effect
5. Multiple reset() calls while already reset have no additional effect

## Examples

### Basic Usage

```javascript
const event = createEvent();

// Start some waiters
event.wait().then(() => console.log('Waiter 1'));
event.wait().then(() => console.log('Waiter 2'));

// Set the event - both waiters will be notified
event.set();

// This will resolve immediately
event.wait().then(() => console.log('Immediate'));

// Reset the event
event.reset();

// This will wait for the next set()
event.wait().then(() => console.log('Will wait'));
```

### With Async/Await

```javascript
async function example() {
    const event = createEvent();
    
    // Start waiting in background
    const promise = event.wait();
    
    // Set the event after 1 second
    setTimeout(() => event.set(), 1000);
    
    // Wait for it
    await promise;
    console.log('Event was set!');
}
```

## License

MIT