# Deep Copy and Shadow Copy in Javascript

---

date: 14/03/2024
topics: javascript copy

---

## Shadow Copy

Shadow copy is a shallow copy of an object. It means it only copies the first level of the object. If the object has nested objects, then the nested objects are shared between the original and the copy.

### Example of reference copy

The following example shows that the original object and the copy are sharing the same reference. If you change the original object, then the copy will also change.

```javascript
const demo = { a: 1, b: 2 };
const clone = demo;

demo.a = 2;
console.log(demo); // { a: 2, b: 2 }
console.log(clone); // { a: 2, b: 2 }
```

### Example of Shadow Copy

To prevent the above problem, we may construct a new object and copy the properties of the original object to the new object. This is called shadow copy.

```javascript
const demo = { a: 1, b: 2 };
const clone1 = { ...demo };
const clone2 = Object.assign({}, demo);

demo.a = 2;
console.log(demo); // { a: 2, b: 2 }
console.log(clone1); // { a: 1, b: 2 }
console.log(clone2); // { a: 1, b: 2 }
```

### Problems with Shadow Copy

The problem with shadow copy is that if the original object has nested objects or array, then the nested objects are shared between the original and the copy. If you change the nested object in the original object, then the nested object in the copy will also change.

```javascript
const demo = { a: 1, b: 2, c: { d: 3 }, e: [1, 2] };
const clone1 = { ...demo };
const clone2 = Object.assign({}, demo);

demo.c.d = 4;
demo.e[0] = 5;
console.log(demo); // { a: 1, b: 2, c: { d: 4 }, e: [ 5, 2 ] }
console.log(clone1); // { a: 1, b: 2, c: { d: 4 }, e: [ 5, 2 ] }
console.log(clone2); // { a: 1, b: 2, c: { d: 4 }, e: [ 5, 2 ] }
```

## Deep Copy

To solve the problem of shadow copy, we may need to perfrom deep copy. In JavaScript, ther are few ways to perform deep copy.

### Using JSON.parse and JSON.stringify

The easiest way to perform deep copy is to use `JSON.parse` and `JSON.stringify`.

```javascript
const demo = { a: 1, b: 2, c: { d: 3 }, e: [1, 2] };
const clone = JSON.parse(JSON.stringify(demo));

demo.c.d = 4;
demo.e[0] = 5;
console.log(demo); // { a: 1, b: 2, c: { d: 4 }, e: [ 5, 2 ] }
console.log(clone); // { a: 1, b: 2, c: { d: 3 }, e: [ 1, 2 ] }
```

However, this method can only be used to copy simple objects like string, number, boolean, array, and object. It cannot be used to copy functions, RegExp, and other special objects. All the class instances will be converted to an empty object.

```javascript
const demo = {
	a: 1,
	b: 2,
	c: function () {
		console.log('hello');
	},
	d: new RegExp(),
};
const clone = JSON.parse(JSON.stringify(demo));

console.log(demo); // { a: 1, b: 2, c: [Function: c] }
console.log(clone); // { a: 1, b: 2 }
```

### Using Lodash

Another way to perform deep copy is to use `lodash` library. Lodash has a method called `cloneDeep` which can be used to perform deep copy.

```javascript
const _ = require('lodash');

function g(value) {
	this.value = value;
}

const demo = {
	a: 1,
	b: 2,
	c: { d: 3 },
	e: [5, 2],
	f: function () {
		console.log('f');
	},
	g: new g(2),
};
const clone = _.cloneDeep(demo);

demo.c.d = 4;
demo.e[0] = 3;
demo.g.value = 10;
console.log(demo);
// a: 1
// b: 2
// c:(1) {d: 4}
// e:(2) [3, 2]
// f:ƒ f()
// g: g {value: 10}
console.log(clone);
// a: 1
// b: 2
// c:(1) {d: 3}
// e:(2) [5, 2]
// f:ƒ f()
// g: g {value: 2}
```

### Using custom function (simple way)

we can refer to the [source code](https://github.com/lodash/lodash/blob/main/src/.internal/baseClone.ts#L157) of `lodash` and write our own function to perform deep copy.

The basice concept is:

1. check if object or array -> if not, return the value
2. create a new object or array
3. loop through the properties of the original object or array
4. call the function recursively to copy the properties

The following is reference to [JavaScript】面试手撕深拷贝](https://juejin.cn/post/7345105799864221737)

```javascript
const _ = require('lodash');

const deepClone = (value, hashmap = new WeakMap()) => {
	if (typeof value !== 'object') return value;
	// if the value is already cloned, return the cloned value -> prevent infinite loop by circular reference
	if (hashmap.has(value)) return value;

	let clone = value instanceof Array ? [] : {};
	hashmap.set(value, clone);

	for (let key in value) {
		if (value.hasOwnProperty(key)) {
			const temp = deepClone(value[key], hashmap);
			clone[key] = temp;
		}
	}

	return clone;
};

const demo = { a: 1, b: 2, c: { d: 3 }, e: [5, 2] };
demo.f = demo;
const clone1 = _.cloneDeep(demo);
const clone2 = deepClone(demo);

console.log(clone1);
// <ref *1> {
//   a: 1,
//   b: 2,
//   c: { d: 3 },
//   e: [ 5, 2 ],
//   f: [Circular *1]
// }
console.log(clone2);
// {
//   a: 1,
//   b: 2,
//   c: { d: 3 },
//   e: [ 5, 2 ],
//   f: <ref *1> {
//     a: 1,
//     b: 2,
//     c: { d: 3 },
//     e: [ 5, 2 ],
//     f: [Circular *1]
//   }
// }

console.log(_.isEqual(demo, clone1));
console.log(_.isEqual(demo, clone2));
```

However, this method can only handle simple objects which cannot handle object like `Function`, `RegExp`, and `Date`, etc. 

### Using custom function (advanced way)

To handle more complex objects, we need to write a more complex function. We can refer to the [source code](https://github.com/lodash/lodash/blob/main/src/.internal/baseClone.ts#L157) of `lodash` and try to understand how it works with different types of objects.

```javascript
const getAllKeys = (value) => {
	// use Object.getOwnPropertySymbols to get all the symbols of the object
	// use propertyIsEnumerable to check if the symbol is enumerable (only save the enumerable symbols)
	const allSymbols = Object.getOwnPropertySymbols(value).filter((symbol) => value.propertyIsEnumerable(symbol));
	let allKeys = [];
	if (value !== null && typeof value !== 'function' && typeof value.length === 'number' && value.length >= 0 && value.length % 1 === 0 && value.length < 9007199254740991) {
		// if the value is an array like stuff
		for (let key in value) {
			if (value.hasOwnProperty(key)) {
				allKeys.push(key);
			}
		}
	} else {
		// if the value is an object
		allKeys = Object.keys(value);
	}

	return allKeys.concat(allSymbols);
}

const deepClone = (value, hashmap = new WeakMap()) => {
	if (typeof value !== 'object') return value;
	const tag = Object.prototype.toString.call(value);
	// if the value is already cloned, return the cloned value -> prevent infinite loop by circular reference
	if (hashmap.has(value)) return hashmap.get(value);

	let clone;

  if (Buffer.isBuffer(value)) {
    return value.slice()
  }

  // init clone
  if (Array.isArray(value)) {
    clone = [];
  } else if (tag === '[object Object]' || tag === '[object Arguments]' || typeof value === 'function') {
	// check if the value is a prototype
    const isPrototype = value === (value.constructor.prototype || Object.prototype);
    clone = (typeof value.constructor === 'function' && !isPrototype) ? Object.create(Object.getPrototypeOf(value)) : {};
  } else {
    // handle type like Date, RegExp, Error, Map, Set, TypedArray
    switch (tag) {
      case '[object Date]':
        return new Date(value);
      case '[object RegExp]':
        return new RegExp(value.source, value.flags);
      case '[object Error]':
        return new Error(value.message);
      case '[object Map]':
        clone = new Map();
        break;
      case '[object Set]':
        clone = new Set();
        break;
      default:
        return value;
    }
  }

	hashmap.set(value, clone);
	// handle Map
	if (tag === '[object Map]') {
		value.forEach((val, key) => {
			clone.set(key, deepClone(val, hashmap));
		});
		return clone;
	}

	// handle Set
	if (tag === '[object Set]') {
		value.forEach((val) => {
			clone.add(deepClone(val, hashmap));
		});
		return clone;
	}

	// check if the value is TypedArray
	if (ArrayBuffer.isView(value)) {
		// using value.buffer.slice(0) to create a new buffer and then create a new TypedArray
		clone = new value.constructor(value.buffer.slice(0));
		return clone;
	}

	const allKeys = getAllKeys(value);
	allKeys.forEach((key) => {
		clone[key] = deepClone(value[key], hashmap);
	});
	return clone;
};
```

This example is a simplified version of the `lodash` source code. The actual source code is more complex and handles more edge cases. For some type lile `TypedArray`, which is not included in the above example, but can be added when in the initializtion of the `clone` object.

References:

- [【JavaScript】面试手撕深拷贝](https://juejin.cn/post/7345105799864221737)
- [Lodash source code](https://github.com/lodash/lodash)
