# Validation Chainer

> A visualy pleasing way to validate your inputs

## Install

```sh
npm install validation-chainer
```

## Usage

Basic Usage:

```ts
import { startChain } from "validation-chainer";

// some psuedo data
const data = {
    foo: "123",
    bar: null,
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

    // make sure to call this!
    .pack();

// check to see if there are any errors
if (errors.length > 0)
    console.error(errors);
```

Logs in console:

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
];
```
