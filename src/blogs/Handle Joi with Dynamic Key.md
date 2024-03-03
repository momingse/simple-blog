# Joi with Dynamic Key

---

date: 12/02/2024
topics: javascript joi

---

## Problem

You want to validate an object with a dynamic key. For example, the key is dependent on the database or the user input.

## Solution

### 1. use `Joi.object().pattern()` to validate an object with a dynamic key.

When the key is dynamic but in a certain pattern, you can use `Joi.object().pattern()` to validate the object.

```js
const scheme = Joi.object().pattern(
  Joi.string(),
  Joi.object({
    subject: Joi.string(),
  }),
);
```

`object.pattern(pattern, schema, [options])`

- pattern - a `Joi` schema object or a regex for the validation of the keys against.
- schema - a `Joi` schema object to validate the values against.

### 2. use `object.keys()`

When the key is can be get from the database or other function which is fixed and not with any pattern.

```js
const dynamicKey = getDynamicKey(); // which is an array of string
const scheme = Joi.object({
  somefixedKey: Joi.number(),
});
const dynamicKeyScheme = dynamicKey.reduce((acc, key) => {
  return acc.keys({
    [key]: Joi.string(),
  });
}, scheme);
```

`object.keys([schema])`

- schema - optional object schema to validate keys against

Since `Joi.object()` actucally is returning a extended `Joi.object().keys()` so `Joi.object()` will inherit all the methods from `Joi.object().keys()` which also include `keys()`.

```js
method(schema) {

    assert(schema === undefined || typeof schema === 'object', 'Object schema must be a valid object');
    assert(!Common.isSchema(schema), 'Object schema cannot be a joi schema');

    const obj = this.clone();

    if (!schema) {                                      // Allow all
        obj.$_terms.keys = null;
    }
    else if (!Object.keys(schema).length) {             // Allow none
        obj.$_terms.keys = new internals.Keys();
    }
    else {
        obj.$_terms.keys = obj.$_terms.keys ? obj.$_terms.keys.filter((child) => !schema.hasOwnProperty(child.key)) : new internals.Keys();
        for (const key in schema) {
            Common.tryWithPath(() => obj.$_terms.keys.push({ key, schema: this.$_compile(schema[key]) }), key);
        }
    }

    return obj.$_mutateRebuild();
}
```

Here is the source code of `Joi.object().keys()` which return a method that return `obj.$_mutateRebuild()`.

The first two line is checking if schema is valid, then clone itself. And the rest of the code is adding the scheme. The first two is checking if the schema is null, if yes, then allow all. If the schema is empty object, then allow none. If the schema is not empty, then add the schema to the `obj.$_terms.keys` using push. Therefore, we can use `Joi.object().keys()` to add the dynamic key to the schema.

But since each time we add a key to the schema, we need to clone the schema and add the key to the new schema which can impact the performance. The pros of this solution is it maintain the schema structure.

### 3. use destructuring

Which is similar to the second solution, but using destructuring to add the dynamic key to the schema.

```js
const dynamicKey = getDynamicKey(); // which is an array of string
const scheme = Joi.object({
  somefixedKey: Joi.number(),
  ...dynamicKey.reduce((acc, key) => {
    return {
      ...acc,
      [key]: Joi.string(),
    };
  }, {}),
});
```

This solution prevent the performance issue of the second solution, but it have the chance to break the schema structure.

### 4. use `Joi.alternatives().try()`

if there is only few like 1-3 schema, you can use `Joi.alternatives().try()` to validate the object.

```js
const scheme = Joi.alternatives().try({
  possible1: Joi.string(),
  possible2: Joi.string(),
  possible3: Joi.string(),
});
```

### 5. use `Joi.object().unknown()`

When it is not predictable what the key will be, you can use `Joi.object().unknown()` to validate the object.

```js
const scheme = Joi.object().unknown(true);
```
