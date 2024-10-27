# @instun/event

A async event module for fibjs, nodejs, browser, and react native.

## Installation

You can install this package using npm:

```sh
npm install @instun/event
```

## Usage

Here is an example of how to use this module:

```js
const createEvent = require('@instun/event');

const event = createEvent();

await event.wait();

// Trigger the event
event.set();
```

## API

### `createEvent()`

Creates a new event object.

#### Methods

- `wait()`: Returns a promise that resolves when the event is triggered.
- `set()`: Triggers the event, resolving all promises returned by `wait()`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Repository

You can find the repository [here](https://github.com/Instun/event).