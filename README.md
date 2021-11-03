# Validation Chainer

A tool to validate your inputs in a visualy pleasing and flexible way.

[![npm](https://img.shields.io/npm/v/validation-chainer.svg)](https://www.npmjs.com/package/validation-chainer)

## Install

With npm:

```sh
npm install validation-chainer
```

With yarn:

```sh
yarn add validation-chainer
```

## Usage

Basic Usage:

```js
import { startChain } from "validation-chainer";

const data = {
    foo: "yes",
    bar: "PLEASE",
};

// starts the chain with the data
// await is used here because pack returns a promise
const errors = await startChain(data)
    // starts check on foo
    .check("foo")
    // does some validation with the property foo (foo's value is used as an argument)
    .validate((foo) => foo typeof "string", "Foo is not a string")
    .validate((foo) => foo.length >= 8, "Foo must be at least 8 characters")

    .check("bar")
    // makes bar lower case (modifies the object getting passed in) so bar is now please
    .sanitize((bar) => bar.toLowerCase())
    .validate((bar) => bar == "please")

    // make sure to call this!
    .pack();

// check to see if there are any errors
if (errors.length > 0)
    // there should only be one error
    console.error(errors);
```

Logs in console:

```js
[
    {
        property: "foo",
        message: "Foo must be at least 8 characters",
    },
];
```

---

Login verify example:

```js
import { startChain } from "validation-chainer";
import argon2 from "argon2";

const data = {
    username: "bob",
    password: "very strong password",
};

const user = await database.findOne({ username: data.username });

const errors = await startChain(data)
    .check("username")
    .validate(() => user != null, "Username doesn't exist")

    .check("password")
    // makes sure username is valid first
    .ensure("username", "Username is invalid")
    // checks password using asynchronous hashing algorithm
    .validate(
        async (storedPass) => await argon2.verify(storedPass, user.password),
        "Password is incorrect"
    )

    .pack();
```

---

Using the [validator](https://www.npmjs.com/package/validator) library:

```js
import { startChain } from "validation-chainer";
import validator from "validator";

const data = {
    name: "                 💩      ",
};

const errors = await startChain(data)
    .check("name")
    // removes whitespace at the beggining and end of name so it's now just "💩"
    .sanitize(validator.stripLow)
    .sanitize(validator.trim)
    // property fails here because of the 💩
    .validate(validator.isAlphaNumeric, "Name must contain valid alpha-numeric characters")

    .pack();
```

---

Using TypeScript:

```ts
import { startChain } from "validation-chainer";

const data = {
    status: "sad",
};

// starts chain that's specialized with data
const errors = await startChain(data)
    // intilisense info on object
    .check("status")
    // optional type generics on function (default is any)
    .validate<string>((status) => status === "happy", "Why are you not happy")
    .sanitize<string>((status) => status.toUpperCase())

    .pack();
```

### Documentation

The documentation is in the source code written in jsdoc (with typescript).
IDE's like vscode will be able to show it while developing.
There might be plans to convert it into markdown or html in the future.

## Development

Install packages first: (using yarn)

```sh
pnpm install
```

Change Code.

Do tests:

```sh
pnpm test
```

Do linting:

```sh
pnpm lint
```

Build:

```sh
pnpm build
```

Profit! All of this will also be automatically ran with github actions.
