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
    bar: "PLEASE"
};

// starts the chain with the data
// await is used here because pack returns a promise
const errors = await startChain(data)
    // starts check on foo
    .check("foo")
    // does some validation
    .validate((value) => value typeof "string", "Foo is not a string")
    .validate((value) => value.length >= 8, "Foo must be at least 8 characters")

    .check("bar")
    // makes bar lower case (modifies the object getting passed in) so bar is now please
    .sanitize((value) => value.toLowerCase())
    .validate((value) => value == "please")

    // make sure to call this!
    .pack();

// check to see if there are any errors
if (errors.length > 0)
    // there should only be one error
    console.error(errors)
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

Username, password example:

```js
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
    .ensureProperty("username", "Username is invalid")
    // checks password using asynchronous hashing algorithm
    .validate(async (value) => await hash.verify(value, user.password), "Password is incorrect")

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
    // property fails here because of the emoji
    .validate(validator.isAlphaNumeric, "Name must contain valid alpha-numeric characters")

    .pack();
```

## Development

Install packages first:

```sh
npm install
```

Do tests:

```sh
npm run test
```

Do linting:

```sh
npm run lint
```

Build:

```sh
npm run build
```
