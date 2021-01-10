# Validation Chainer

> A tool to validate your inputs in a visualy pleasing and flexible way.

## Install

---

```sh
npm install validation-chainer
```

## Usage

---

### Basic Usage:

```ts
import { startChain } from "validation-chainer";

// some psuedo data
const data = {
    foo: "123",
    bar: null,
    zee: "hello there"
};

// starts the chain with the data
const errors = await startChain(data)
    // starts check on foo
    .check("foo")
    // does some validation
    .validate((value) => value typeof "string", "Foo is not a string")
    .validate((value) => value.length >= 3, "Foo must be at least 3 characters")
    // makes foo lower case (modifies the actual data getting passed in)
    .sanitize((value) => value.toLowerCase())

    .check("bar")
    .validate((value) => bar != null, "Bar must not be empty")

    .check("zee")
    // ensures that bar is valid first
    .ensureProperty("bar", "Bar is invalid")
    .sanitize((value) => value.toUpperCase())

    // make sure to call this!
    .pack();

// check to see if there are any errors
if (errors.length > 0)
    return errors;
```

Returns:

```ts
[
    {
        property: "foo",
        message: "Foo is not a string",
    },
    {
        property: "bar",
        message: "Bar must not be empty",
    },
    {
        property: "zee",
        message: "Bar is invalid",
    },
];
```

---

### Works with promises.

```ts
const data = {
    username: "bob",
};

const errors = await startChain(data)
    .check("bob")
    // checks to see if the username is in the database
    .validate(
        async () => (await database.findOne({ username })) != null,
        "That username doesn't exist"
    )

    .pack();
```

---

### Works quite well with the [validator](https://www.npmjs.com/package/validator) library.

```ts
import { startChain } from "validation-chainer";
import validator from "validator";

const data = {
    name: "💩",
};

const errors = await startChain(data)
    .check("name") // fails on "Username must contain valid alpha-numeric characters"
    .sanitize(validator.stripLow)
    .sanitize(validator.trim)
    .validate(validator.isAlphaNumeric, "Name must contain valid alpha-numeric characters")

    .pack();
```
