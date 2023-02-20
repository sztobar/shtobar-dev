---
layout: '../../layouts/BlogPost.astro'
title: How not to DRY
description: Flag Argument and making more code for less mistakes
image: how-not-to-dry.png
pubDate: '2023-02-01'
tag: webdev
draft: true
---

DRY is short for don't-repeat-yourself and it's a widely known concept in software engineering, but it can cause harm if we're trying too hard to squeeze and extract every possible code repetition. Nowadays more and more developers agree that "good repetition is better than weak abstraction". In this post I want to write a common problem that I see quite frequently when it comes to applying the DRY rule.

## FlagArgument and DRY
To describe the problem with DRY I want to write a little about a FlagArgument, which is a well known code-smell. It's a boolean argument that changes the way function works. It can make the code really hard to read when we have something like this:

```tsx
const address = getAddress(data, false);
```

I like when the code is honest and here the `getAddress` function is making some shady stuff with the second argument. One of the most common advices to make such cases more readable is creating two separate functions:

```tsx
const address = getAddress(data);

const guestAddress = getGuestAddress(data);
```

Much better! Not only the function is more clear in what it does, the variable to which we assign the result of function is also named in a more explicit way. We can understand by looking at two function what the false meant in the first example.

Let's assume that there are more than one FlagArgument (introducing `isBillingAddress`), if we were to split our functions into separate one we would get:

```tsx
const billingAddress = getBillingAddress(data);
const shipppingAddress = getShippingAddress(data);

const guestBillingAddress = getGuestBillingAddress(data);
const guestShippingAddress = getGuestShippingAddress(data);
```

It's still pretty maintainable, but as the application grow and we got more and more requirements to handle, it might quickly become a nightmare to have even more functions - one for each variation. That's why it's common to see `options` argument that's easier to expand:

```tsx
const billingAddress = getAddress(data, { type: AddressType.Billing });
const shipppingAddress = getAddress(data, { type: AddressType.Shipping });

const guestBillingAddress = getAddress(data, { type: AddressType.Billing, isGuest: true });
const guestShippingAddress = getAddress(data, , { type: AddressType.Shipping, isGuest: true });
```

We have one function, and the second argument can be easily expanded and modified to change the function behaviour. Of course we can still keep the separate function for each variation if the implementation varies that much. And even if we have only a single function exposed inside it we might still call a function for dedicated set of options:

```tsx
const getAddress = (data, { type, isGuest }) => {
  if (type === AddressType.Billing) {
    if (isGuest) {
      return getGuestBillingAddress(data);      
    }
    return getGuestShippingAddress(data);
  }
  if (isGuest) {
    return getBillingAddress(data);      
  }
  return getShippingAddress(data);
}
```

There are a lot of conditions in one function, but it doesn't harm the readability of the function. `getAddress` is only responsible for choosing the right version based on the options.

> Having `AddressType` enum even only with two values seems to me more readable than passing `isBilling` as true or false becuase it might not be clear what is the address type if its not billing. When it comes to `isGuest` it's intuitive that the address belongs to a user by default and `isGuest` is a special use-case.

The `options` argument gives us opportunity to describe the function interface as we see fit, to make the outcome obvious from looking at it's execution.

There's certain danger to `options` argument, specifically when we declare them at the root of our functions and pass them down everywhere. If we're not careful and we add a new option as the project grows, we might end up creating something like this:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/images/posts/how-not-to-dry/functions-tree-options-dark.drawio.svg">
  <img alt="functions call tree with options passed down" src="/images/posts/how-not-to-dry/functions-tree-options-light.drawio.svg">
</picture>

Passing `option` to every function makes it hard to read, maintain and extend the functions.

## Flag Argument in UI codebase

As I write mostly UI code I see such problem occuring there rather frequently. It feels "easy" to pass an extra `prop` which only slightly changes how we render stuff, but it affects so many things we need to carry it around and each little component ends up with few conditional properties:

```tsx
interface FooLabelProps {
  isInline?: boolean;
  image?: string;
  href?: string;
  text: string
}
const FooLabel = ({ isInline, image, href, text }: FooLabelProps) => (
  <Label
    {...(isInline && { display: 'inline-block', fontSize: '14px' })}
    {...(!!image ? { padding: '8px' } : { padding: '2px' })}
  >
    {!!image ? <Image alt={text} src={image}>}
    <Span {...(href && { href, as: 'a' })} marginBottom={!!image & '5px'} >{text}</Span>
  </Label>
)
```

It's only a simple functional component, but there are so many conditions that it is hard to follow and modify this component. Even without a single `if` statement, we got ourselves a lot of ternary operators and `&&` operator that make the code hard to read.

It's a made up component, inspired by the code that I have encountered in my work. As I tried to refactor it I learned that was mutually exclusive for `Label` to either have an image and `isInline` flag. So naturally it was much easier to rewrite it into 3 different components:

```tsx
const SmallLabel = ({children}) => (<Label padding="2px">{children}</Label>)

interface SpanOrAnchorProps {
  href?: string;
  children: ReactNode
}
const SpanOrAnchor = ({children, href}: SpanOrAnchorProps) => (
  <Span {...(href && { href, as: 'a' })} >{children}</Span>
);

interface TextLabelProps {
  href?: string;
  text: string
}
const TextLabel = ({ href, text }: TextLabelProps) => (
  <SmallLabel>
    <SpanOrAnchor href={href}>{text}</SpanOrAnchor>
  </SmallLabel>
)

interface ImageLabelProps extends TextLabelProps {
  image: string;
}
const ImageLabel = ({ image, href, text }: ImageLabelProps) => (
  <Label padding="8px">
    <Image alt={text} src={image}/>
    <SpanOrAnchor href={href} marginBottom="5px">{text}</SpanOrAnchor>
  </Label>
)

const InlineLabel = ({ href, text }: TextLabelProps) => (
  <SmallLabel
    display="inline-block"
    fontSize="14px"
  >
    <SpanOrAnchor>{text}</SpanOrAnchor>
  </SmallLabel>
)
```
We got ourselves much more code, but it's much more clean what each part is reponsbile for and how each component will be styled. As an addition I've extracted `SmallLabel` and `SpanOrAnchor` because their logic would end up repeated. There's still repetition in the code, because we have 2 places where we render `SmallLabel` and 3 where we render `SpanOrAnchor` but it's good kind of repetition. If we would try to "make it more dry" we might easily get back to the `FooLabel` situtation with too many conditions in a small piece of code.

Similar as with addresses, at certain places in our codebase we might not know which variation to use so we stil might need a generic component that will decide which version to render:
```tsx
interface InlineLabelProps extends TextLabelProps {
  isInline: boolean
};
type FooLabelProps = ImageLabelProps | TextLabelProps | InlineLabelProps;

const FooLabel = ({ isInline, image, href, text }: FooLabelProps) => {
  if (image) {
    return <ImageLabel href={href} text={text}/>
  }
  if (isInline) {
    return <InlineLabel href={href} text={text}/>
  }
  return <TextLabel href={href} text={text}/>
}
```

As an extra thing I declared FooLabelProps as a type union to make it even more clear that inline and image variants are mutually exclusive. Having one interface with a lot of optional props might indicate that it's possible to have all of them at once which should affect the result and it's the opposite.

## V2 Prop

In my opinion having a lot of specific code is better than short code with a ton of conditionals inside. This leads me to a pattern that I don't have a specific name for but because of the situations where I encountered it, I name it a `v2` prop antipattern.

Let's say we have a pretty complex component, not something simple as a label, but rather a global page `Header` component. Now let's assume that a requirement appears that a component needs to be reworked but it's not clear if the change is positive so an AB-test is started. This means we need to extend our component and maintain both versions simultaneously. A new version should be rendered if `v2={true}` prop is passed.

Depending on the component complexity and the scope of differences between `v1` and `v2` it might be temping to simply pass `v2` to each subcomponent that should be rendered differently or have a different behaviour. This can lead to the similar situation like with `FooLabel`:

```tsx
const Header = ({v2, ...props}) => {
  const search = useSearch(props, v2);
  const events = useEvents(v2);

  return (
    <>
      <Navigation v2={v2} events={events}/>
      <Search v2={v2} search={seach}/>
      <SideBar v2={v2}/>
      <Promo v2={v2}/>
    </>
  )
}
```

`v2` might need to be passed quite far down, but it's not a problem of passing the prop on it's own. Normally we might use context for such problem, it's so common that even React Docs have an article about it and names it [props drooling](https://beta.reactjs.org/learn/passing-data-deeply-with-context#the-problem-with-passing-props).

The problem is how `v2` might introduce a lot of small style (and other) changes:
```tsx
const LinkSection = ({v2...props}) => {
  const title = useTitle(props, v2);

  return (
    <Container {...(v2 && margin: '8px')}>
      {!v2 && <Tooltip text={title}/>}
      <Label title={title} onClick={v2 && props.onClick}/>
    </Container>
  )
}
```
Don't mind the ugly code, it's only there to show how a single `FlagArgument` can introduce a lot of noise, and if many components have similar `v2` usage we end up with something like this:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/images/posts/how-not-to-dry/component-tree-with-v2-dark.drawio.svg">
  <img alt="functions call tree with options passed down" src="/images/posts/how-not-to-dry/component-tree-with-v2-light.drawio.svg">
</picture>

This will be hard to code review, maintain and later clear when we decide to stick only with a single version. But there's no repetiton, right?

What I want to suggest is repeat a lot of code and create a v2 version of each component that have a difference, and extract parts that are common for `v1` and `v2`:
```tsx
const RootHeader = ({v2, ...props}) => (
  v2 ? <HeaderV2 {...props}/> : <Header {...props}/>
)

const LinkSection = ({...props}) => {
  const title = useTitle(props);

  return (
    <Container>
      <Tooltip text={title}/>
      <Label title={title}/>
    </Container>
  )
}

const LinkSectionV2 = ({ ...props}) => {
  const title = useTitleV2(props);

  return (
    <Container margin="8px">
      <Label title={title} onClick={props.onClick}/>
    </Container>
  )
}
```

Again, we got a more code, and we would split it across many files but there's only a single condition at the very top, and lower we got a small dedicated components and functions that are clear to read.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/images/posts/how-not-to-dry/component-tree-with-v2-fixed-dark.drawio.svg">
  <img alt="functions call tree with options passed down" src="/images/posts/how-not-to-dry/component-tree-with-v2-fixed-light.drawio.svg">
</picture>

At first, it may seem that we've got a lot more complex code. While it's true that there's more of it, and popular belief is less code leads to less room for mistakes. But here we've got ourselves more code to hide all conditionals, and end up with only one - at the very root level.

What are the benefits of writing the components this way:
1. Despite more code to read, it's easy to know what part is responsible for what, and what will be specific function/component return value
2. If we want to get rid of one version it will be super easy
3. The PR that introduced this change this should be easier for reviewer

## Summary

I want to make it clear for myself and the other developer, the points that I describe above are not only applicable to UI development:

* The FlagArgument can be harmful even if it's name and purpose is clear.
* conditions are making the code harder to read, but well structured `if` statements can make a much more readable code than a lot of ternary and `&&` operators
* more code with clear separation of responsibility and purpose are better than squezing too many inside smaller codebase