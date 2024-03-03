# Type Challenge Easy 1

---

date: 12/02/2024
topics: typescript

---

## Pick - 004

we need to implement the built-in `Pick<T, K>` without using it.

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyPick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};
```

Here is my ans:

[Typescript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAsiAKBLAxgawDwBUA0UDSUEAHsBAHYAmAzlKhCAPYBmUmAfFALxQDeAUFCgBtJGggU89KIjL4AugC5WIlHQn05Abj4BfbXxmkATkwCGyaJgYUGvAVGCJgAGwhKqwIzIDm2wRQgqZC8wRwYyd08fPyhkBgBbMFdSCiUAIwYGV1MybR0+PlBIVmsGeCMIADdECAB3LlgEVSxS3AAiRxcINqgAHyg2uMTk8Ta2fTiyDwdSpSsbcqqa+u5+QU7XJTaAYWzZI0z4tux7IaSIFKUzZyoIE70+IA)

```ts
type MyPick<T, K extends keyof T> = {
  [PickedKey in K]: T[PickedKey];
};
```

There are few main point:

1. use `K extends keyof T` to make sure K must be the subset of key of T. (I original use `K extends number | string | symbol`, so that I can iterate, but I need to add conditional and make the other key become `never`...)
2. use of `in` allow use to iterate every possible type (e.g. `type name = number | age`)

Exmaple:

[Reference from github](https://github.com/type-challenges/type-challenges/issues/13427)

```ts
const getValue: <T extends Object, K extends keyof T>(
  obj: T,
  key: K,
) => T[K] = (obj, key) => {
  return obj[key];
};
```

---

## Readonly - 007

```ts
interface Todo {
  title: string;
  description: string;
}

const todo: MyReadonly<Todo> = {
  title: "Hey",
  description: "foobar",
};

todo.title = "Hello"; // Error: cannot reassign a readonly property
todo.description = "barFoo"; // Error: cannot reassign a readonly property
```

Here is my ans (this is too easy so no explaination and playground):

```ts
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};
```

---

## Tuple to Object - 011

```ts
const tuple = ["tesla", "model 3", "model X", "model Y"] as const;

type result = TupleToObject<typeof tuple>; // expected { 'tesla': 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}
```

Here is my ans:

[Typescript Playground](https://www.typescriptlang.org/play?#code/C4TwDgpgBAKgrmANhGB7A8gIwFYQMbAA8MUEAHsBAHYAmAzlAE4QCGNqViIUACo6pEagA0hBABtALoA+KAF4oAbwBQUKOICSUAJZVY4qnAC2mCI0mSAXFA0BuZQF97yvBzrAoDBQGUQJ1IgAFACMAJQubh4s8mriwQA0UADkAExJiQDMiXSSEVTuUJjW8EgoGDj4RKCQqABmUCyyCipqwdYJqslp1qnpnRnWWZ101nTxjkA)

```ts
type TupleToObject<T extends readonly PropertyKey[]> = {
  [I in T[number]]: I;
};
```

There are few main points:

1. use `T[number]` for array can get all the type of its element. Same as `T[keyof T]` when T is object, it return all the type of its value.
2. `PropertyKey` is equivalent to `number | string | symbol` which are types that allow for key. (As will are going to convert to an object, we need value key)
3. `keyof any` is also equivalent to `number | string | symbol`

---

## First of Array - 014

```ts
type arr1 = ["a", "b", "c"];
type arr2 = [3, 2, 1];

type head1 = First<arr1>; // expected to be 'a'
type head2 = First<arr2>; // expected to be 3
```

Here are answers from communite (cuz he provide three ans):

[Link to Ans](https://github.com/type-challenges/type-c:wwwhallenges/issues/16315)

```ts
//answer1
type First<T extends any[]> = T extends [] ? never : T[0];

//answer2
type First<T extends any[]> = T["length"] extends 0 ? never : T[0];

//answer3
type First<T extends any[]> = T extends [infer A, ...infer rest] ? A : never;
```

Here is the explaination for each answer:

1. It use `T extends [] ? never : T[0]`, which check if `T` is an empty array and assign `never` if yes and `T[0]` return the first element if no
2. It use `T[length] extends 0 ? never : T[0]`, similiar to ans1 but instand it change the conditional by checking the `T[length] extends 0`. As length is one of the property of Array so `T[length]` will work.
3. It use `T extends [infer A, ...infer rest] ? A : never`, also similiar to ans1 but use `infer` which it check if `A` exist and return if yes otherwise return `never`

Extra reading about `infer`:

It usually used after `extends` or after `?` like this above case. Most of the time it is used to determine if some value exist.

[Example of getting the last element](https://gist.github.com/chentsulin/dae5f2da512091dbb90f65ab897c2ae9#file-last-array-element-ts)

```ts
export type LastArrayElement<ValueType extends readonly unknown[]> =
  ValueType extends [infer ElementType] // <- check if ValueType is array with length 1 e.g. ['1']
    ? ElementType // <- return if yes
    : ValueType extends [infer _, ...infer Tail] // <- extract the rest as Tail
      ? LastArrayElement<Tail> // <- if ValueType is array with length > 1, resursively do the extraction
      : never; // <- else it means it is an empty array which can return never
```

[Implement of ReturnType in Typescript Handbook](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#type-inference-in-conditional-types)

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

[Example of union to intersection](https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type)

```ts
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

// Example
type Weird = UnionToIntersection<string | number | boolean>;
type Weird = string & number & true & false; // <- this shows boolean = true | false, and become never after TS3.6+

// Explaination
// This true every into an Function return void
type Unpacker1<U> = U extends any ? (x: U) => void : never;
const demo1: Unpacker1<"a" | "b"> = (x: "a") => {};

// Multiple candidates for the same type variable in contra-variant positions causes an intersection type to be inferred(copy from Typescript Handbook)
type Unpacker2<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;
const demo2: Unpacker2<{ a: 1 } | { b: 2 }> = { a: 1, b: 2 };
```

---

## Length of Tuple - 018

```ts
type tesla = ["tesla", "model 3", "model X", "model Y"];
type spaceX = [
  "FALCON 9",
  "FALCON HEAVY",
  "DRAGON",
  "STARSHIP",
  "HUMAN SPACEFLIGHT",
];

type teslaLength = Length<tesla>; // expected 4
type spaceXLength = Length<spaceX>; // expected 5
```

Here is my ans (this is too easy so no explaination and playground):

```ts
type Length<T extends ReadonlyArray<any>> = T["length"];
```

---

## Exclude - 043

```ts
type Result = MyExclude<"a" | "b" | "c", "a">; // 'b' | 'c'
```

Here is my ans (this is too easy so no explaination and playground):

```ts
type MyExclude<T, U> = T extends U ? never : T;
```

---

## Awaited - 189

```ts
type ExampleType = Promise<string>;

type Result = MyAwaited<ExampleType>; // string
```

Here is my ans:

[Link to Ans](https://www.typescriptlang.org/play?#code/C4TwDgpgBAsiAKAnA9gWwJYGcIB4AqAfFALxQDeUwAFhAHYBcUAFMrQGYCuANm+l1xAAmjJgENEAc0Z4AlCSKjaIOcQVKoAXwDcAKB2hIsEAEEA7qPTAh+KBAAeV2oMxGkaLLkUgCRUnlsOdM6uKBjYOOjsEIhQAEoEOlBQAPxxAY7BcG5huJFs0VAA8glJSalwZhZWgjjxiaWMsfWMtBAAbtG6OgDGrJjAUKIkUK2mUNkeTEyIEJjIXB2IADRQMwBWEN3AKkRk9djAeOioEMgcwFM7q7Pzi0wA5IIQqMj3MisAjAAMPzI6Gn8DNBoigYqQKuZLNYgcg2IMCFogA)

```ts
type MyPromise<T> = { then: (onfulfilled: (arg: T) => any) => any };

type MyAwaited<T extends MyPromise<any>> = T extends MyPromise<infer R>
  ? R extends MyPromise<infer O>
    ? MyAwaited<R>
    : R
  : never;
```

There are few main points:

1. since from the last test case `type T = { then: (onfulfilled: (arg: number) => any) => any };`, which show all the type fullfilled this type is allowed so we need to redefined a new Promise type.
2. we need to detect if the value inside is also a `Promise`, and use recursion to extract the return value.
3. actucally, `PromiseLike<T>` can do similar thing as `MyPromise<T>`, here is the definition of `PromiseLike<T>`:
   ```ts
   interface PromiseLike<T> {
     /**
      * Attaches callbacks for the resolution and/or rejection of the Promise.
      * @param onfulfilled The callback to execute when the Promise is resolved.
      * @param onrejected The callback to execute when the Promise is rejected.
      * @returns A Promise for the completion of which ever callback is executed.
      */
     then<TResult1 = T, TResult2 = never>(
       onfulfilled?:
         | ((value: T) => TResult1 | PromiseLike<TResult1>)
         | undefined
         | null,
       onrejected?:
         | ((reason: any) => TResult2 | PromiseLike<TResult2>)
         | undefined
         | null,
     ): PromiseLike<TResult1 | TResult2>;
   }
   ```
