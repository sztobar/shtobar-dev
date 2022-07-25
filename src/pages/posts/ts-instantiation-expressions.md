---
layout: "../../layouts/BlogPost.astro"
title: Instantiation Expression in Typescript 4.7
description: Use-cases for generic functions aliases
image: ts-instantiation-expressions.png
pubDate: '2022-06-01'
tag: webdev
---

Typescript version 4.7 introduces a feature that I missed for some time. It's called [Instantiation Expressions](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#instantiation-expressions) and it's a way of creating aliases for generic functions and classes. The feature seemed super promising at the beginning but soon I realized that it still missed some key features for me. Nonetheless, it's a useful addition and I want to share an interesting example where I thought it might be used.

I stumbled upon a type-aliasing issue in my work when I was creating a form component in React codebase. Each form has its own ValidationMap type that describes how to validate each field. The type looks as follows:

```tsx
type FormValues<FieldName extends string = string> = Map<FieldName, string>;

type FieldValidators<FieldName extends string = string> = {
  length?: number;
  pattern?: (value: string, formData: FormValues<FieldName>) => boolean
};

type ValidationMap<FieldName extends string = string> =
  Map<FieldName, FieldValidators<FieldName>>;
```

If you're wondering what does the type constraint `FieldName extends string = string` stands for, it's a nice way of declaring that this type can accept an enum (with strings as values) or a string literal type (f.e. `type SignupFormFields = 'email' | 'password' | 'rememberMe'`), but it can be completely skipped and any string will be accepted. That way I can create different `ValidationMap`s for forms with their own fields. Fields for each form can be a different enum, which gives me an additional way of protecting myself from typos. You can notice that `FieldName` appears twice in `ValidationMap`, once as a key in the map, and as a type passed to the value type. One of the things that bugs me in the type signature above is this `FieldName` duplication that I would love to avoid.

### The problem

Without Instantiation Expressions, the `ValidationMap` cannot be used as a constructor, we had to use `Map` and repeat both key and value types every time:
```tsx
const validationMap1 = new Map<SignupFields, FieldValidators<SignupFields>>([
  [SignupFields.Email, { length: 3 }],
  [SignupFields.Password, { length: 5 }],
]);
```

While I'm a big fan of writing verbose code and I try to avoid abbreviations, this way of creating a new `ValidationMap` has quickly become tedious and so I began to search for a way to create an alias and have a shorter way of creating and declaring validation maps.

We can use the `Map` constructor without type parameters, but we would need other means to annotate that we want a correct `ValidationMap` type. We can either annotate the variable or typecast the expression after the constructor:
```tsx
const validationMap2: ValidationMap<SignupFields> = new Map([
  [SignupFields.Email, { length: 3 }],
  [SignupFields.Password, { lenghth: 5 }],
]);

const validationMap3 = new Map([
  [SignupFields.Email, { lenght: 3 }],
  [SignupFields.Password, { lenghth: 5 }],
]) as ValidationMap<SignupFields>;
```

If you take a look at both of them you can notice that there's a typo in the password validator. I placed it there on purpose, and that's because both of them are ignored by the typescript compiler. So if we're not careful enough we might miss precious type system features and introduce an issue that might take a while to debug even if we have solid unit test coverage in the codebase. Take a look at the [TS playground](https://www.typescriptlang.org/play?useUnknownInCatchVariables=true#code/C4TwDgpgBAYg9gJwLYDUCGAbArhAzgHhgEsIMATAOTSWggA9gIA7M3KXYBIpgcygF52nbjwB8AqAFk0YQiXJUaAGiFdeogNwBYAFC7QkWPLLoMRMmmCICxUpWq0GzVqpESOasRIDeuqFAxmHmAACwB+AC4oJiwkACMIBG0dfzBLRgQmSKgACgA3TBwojxEVADNEJAARSzQo+GRTHBtjRQhRAEoBcTi4OEC0Jl0AX2T9cGhTc0siOCZpWVsFByh6RhY2Et53YXUJBbk7NpUlk0xpqwQWo4dRTV1dZlioAGURLDBTtl8UqABRJBoIgYCQAcgggOBoKUfigAAU0LhcAB3RBkMFpJGohBkUEjB46ADGcw4UAKZgswFm8xkAEYJEwIMipDJ8G9eB8vidjFNKdY2e9PsZcHccgBtWFi9k8TnCgB0AKBGBU3gCQVCUQAzFBhgBdGG-KWCr5yhFYtEqtW8EIaqAAVh1+t0uo6YyJJOAZPOlOpCwATFFeTM5gdpbK7CKGUyWWBxZKw0KIwrIcqoKrArxbdq9Qb-EaOYnyLhTYiURa01aeDaQlEHTnna6CcSmKTyRdfTJtYJGcyFnHDQmTYrgZaM1XgFrHbmoPmZYXWCXzTjR0Fq7Wpw2oIioEGqSHWYPhZogA) and see for yourself all 3 ways to create `ValidationMap`. Only `validationMap1` is raising an error (and can be declared a winner so far).

There's a fourth way, which is to create a generic function that accepts the same arguments as the map constructor and simply returns a new map.
```tsx
const createValidationMap = <FieldName extends string = string>
  (iterable?: Iterable<readonly [FieldName, FieldValidators<FieldName>]>) =>
    new Map<FieldName, FieldValidators<FieldName>>(iterable);

const validationMap4 = createValidationMap<SignupFields>([
  [SignupFields.Email, { length: 3 }],
  [SignupFields.Password, { length: 5 }],
]);
```
I omitted the typo here because it is correctly caught by the typescript compiler ([see here](https://www.typescriptlang.org/play?useUnknownInCatchVariables=true#code/C4TwDgpgBAYg9gJwLYDUCGAbArhAzgHhgEsIMATAOTSWggA9gIA7M3KXYBIpgcygF52nbjwB8AqAFk0YQiXJUaAGiFdeogNwBYAFC7QkWPLLoMRMmmCICxUpWq0GzVqpESOasRIDeuqFAxmHmAACwB+AC4oJiwkACMIBG0dfzBLRgQmSKgACgA3TBwojxEVADNEJAARSzQo+GRTHBtjRQhRAEoBcTi4OEC0Jl0AX2T9cGhTc0siOCZpWVsFByh6RhY2Et53YXUJBbk7NpUlk0xpqwQWo4dRTV1dZlioAGUiHhiwU7ZfFKgAUSQaCIGAkAHIIECQWClH4oAAFNC4XAAd0QZHBaWRaIQZDBIweOgAxnMOFAiQgIJYIFMLMBZvMZBJDssaKsnBtXNtBFsxDkiBk0HFAtkAJKC4UQfCUtBkOYYEBQADap2ORjstMs1hZ9hoogAup1unCmBAUVIZDq1adNZdrqz2qJ+RLAh0xsTScAoAUzHSGQsACwSClUxi2-2Wt4fLBfYy4J1KuFKqOfb4AOkBwIwKm8ASCoSiAGYoMN9bC-sn3qm42nEdj0Tm87wQgWoABWEtl3T6t1AA)). With this approach, we get a shorter syntax and reliable type system. Someone might argue that we're introducing unnecessary abstraction by having a function. When I asked the team about their opinion on the convention that we should follow in the project people were reluctant toward the function solution and the majority voted for `Map` constructor and typecast after it.

There's one more way how to tackle this issue, the most simple and obvious one. We could simply create a `ValidationMap` as a derived class:
```tsx
class ValidationMap<FieldName extends string = string> extends
  Map<FieldName, FieldValidators<FieldName>> {}

const validationMap5 = new ValidationMap<SignupFields>([
  [SignupFields.Email, { length: 3 }],
  [SignupFields.Password, { length: 5 }],
]);
```
At first sight, this one seems perfect. We can use `ValidationMap` as a type whenever we want, and we can use the constructor and pass only a `FieldName` to it. The compiler will also check for typos and any incorrect data shapes in the constructor's arguments. Having an empty class isn't an overhead neither on the code generated side nor on the runtime.

The only issue which we might encounter with this approach is if we're targetting ES5 (I bet there are still projects that need such support). That means, that Typescript will emit a polyfill for javascript classes which won't work with native `Map` objects. Otherwise, in the runtime, we will get an error like that:

`calling a builtin Map constructor without new is forbidden`

That means we need to add `Map` polyfill and have it enabled even for browsers that have support for it. Check [TS playground](https://www.typescriptlang.org/play?target=1&useUnknownInCatchVariables=true#code/PQgEB4CcFMDNpgOwMbVAGwJYCMC8AiaAZwCYAGARgFZ9gA+AWACgAXATwAc0AxAe0gC2ANQCG6AK7Fw3TNHQATAHIiBaaAA8W0RPKKgiLSJkQBzULn2HjJuudABZER2myFy1QBpLR03QDczMzsXKAycvKiWPIiLPxELuHuapraut7WdgY+NnYA3sygGNomLAAWAPwAXKCI4gLYCAFMhRwxWpCIVaAAFABuYpLVWdZesPwCACIxItV8gpGS8WFuKtB0AJTmtti8vOjQIojMAL5NzNp1oADKmCa1HMtp+c2gAKICIpjodgDk0B9fH4eAqgAAKIiIRAA7vx5L9WpCYZB5D8ToEmMh0BC9JFMNEWJheIhHM5HklQBotDo9MNTJkrL4KSlqSCSQkVp5Qq4ImI8TE4uylKs6LZcsd0cgiQZQP0ojFCcSnFQ7IhoFDQLj8Qq2Tc7uIHtyiHRugBtEEm3X3R5EAB070+6C8uSKpjK1QAzKBjgBdYEvC23K2Gm3gxGwp0ukqlarKn1+73rPxAA) and click "run" there if you want to check the runtime issue for yourself.

### Enter Instantation expression

With Instantiation Expressions I can create an alias for a `Map`, and then simply use its constructor. Unforutalnely, it's not working in a way that I wanted it to. Here's how I imagined the usage will look like:

```tsx
const ValidationMap<FieldName extends string = string> =
  Map<FieldName, FieldValidators<FieldName>>;

const validationMap6 = new ValidationMap<SignupFields>([
  [SignupFields.Email, { length: 3 }],
  [SignupFields.Password, { length: 5 }],
]);
```

First of all, the instantation expressions cannot be generics, they must be a specific type, so instantiation expression `ValidationMap` is invalid syntax for typescript compiler. That means that I have to create it using a `Map` and specifying the FieldName:

```tsx
const SignupValidationMap = Map<SignupFields, FieldValidators<SignupFields>>;

const validationMap7 = new SignupValidationMap([
  [SignupFields.Email, { length: 3 }],
  [SignupFields.Password, { length: 5 }],
]);
```
There's another downside that doesn't seem obvious. The result of instantation expression is a value and it cannot be used as type, unless we use it with `typeof` operator.

I you want to see them for yourself check the [TS Playground](https://www.typescriptlang.org/play?useUnknownInCatchVariables=true#code/C4TwDgpgBAYg9gJwLYDUCGAbArhAzgHhgEsIMATAOTSWggA9gIA7M3KXYBIpgcygF52nbjwB8AqAFk0YQiXJUaAGiFdeogNwBYAFC7QkWPLLoMRMmmCICxUpWq0GzVqpESOasRIDeuqFAxmHmAACwB+AC4oJiwkACMIBG0dfzBLRgQmSKgACgA3TBwojxEVADNEJAARSzQo+GRTHBtjRQhRAEoBcTi4OEC0Jl0AX2TdAHpxqABGADooAHVoAGNBpjhgKGWECEtobg5B4CJLIjgmKHowHdxcM6Y2NDYeZkSiZdwJqYABYFwAWiuEGWwEBCAQiF0y3OHCgpnMp3O0lktgUDkuThYbBKvHcwnUEmRcjsbRUqJMmARVgQLRJDlEml0umYsSgAGUiDwYmByWxfCkoABRJBoIgYCQAcggIrFEqUfigAAUnrgAO6IMiStK3dUIMgSkZMnSTKC-AFAkFgiEIZl0MCITbQh6bDlcrBgeEWY5ImQST2IphE13c3mMvTGn5-QF24GgxLWqEwzYFMxe+7IgBsEiYEFVcMpaZ9smD7tDOQA2gryyWecZcLNhaKMCpvAEgqEogBmKDDAC68oF1c5Ibrs2VOo1LbbvBCHagAFYe73dL2OmMdE7YTX-d7AzIAEyEmT4Gu8snGHfWE-D0t1hnrzfJgsB5EAdmzufZN49z93yP3FZVqeo6NmKU6BLwc7dn2A7+CaZrRpAlrxpCg7AXY9bjmqk5QK2EE8LOIRRIufYrmuRrcBkZRoMs0A1gAwnASD2jmTCbPycFTPu8xLFsawbFAWC4PszpHCcu4YtceB3DCUBPHJUAGBACrwVGFpxuCqH+CmVLpjIUTbr+elgPu66cVAIQ0QA1iAUARDkCo6YWe4mVESlwGUX5uj+qYvgeyTDLoQA) to see my failed experiments with Instantiation Expressions.

### Summary

When I first read about instantiation expressions I thought that they are exactly the answer to the problem I described at the beginning. Sadly they were created to solve different issues, and while I felt disappointed I'm looking forward to seeing how the Typescript team will expand this feature further. They keep amazing me with each version with new ways of writing even more declarable and readable types.

Which solution do I like the most? If the target is at least `ES2015` I would go with simple inheritance, otherwise creating a simple function seems the best approach to me.