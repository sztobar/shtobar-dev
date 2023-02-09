---
layout: "../../layouts/BlogPost.astro"
title: Enumeration Classes in Unity
description: How good are enumeration classes in unity.
pubDate: '2022-11-17'
tag: gamedev
draft: true
---

Using enums (short for [Enumeration types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/enum)) in Unity is extremely useful. Enums are great when we want to have a type with limited pre-defined options. They are also serializable, by default, and they appear in Unity Editor as a select element.

![enums in editor](./enumeration-classes-in-unity/enums-in-editor.jpg)

They can be easily used as a control flag to tell the MonoBehaviour which function to invoke, and swap it in the runtime. This makes them a perfect toy for non-programmers to test and verify different behaviour which hels to decide which produces the best result.

In my gamedev adventures, one of the most common usages of them is the `Direction4` enum. In 2d platformer games, even when an object moves diagonally, I always split the movement into vertical and horizontal and resolve each individually.

```c#
```

The `Direction4` definiton is quite simple:
```c#
enum Direction4
{
  Up,
  Down,
  Left,
  Right
}
```
The pain point of enums is when they are meant to be used. They aren't classes, so they do not have any methods, and their usage require using switch statement. Let's create a static helper class that'll contain methods for dealing with direction values:
```c#
static class Direction4Helpers
{
  public static Vector2 ToVector2(Direction4 direction)
  {
    switch (direction)
    {
      case Direction4.Up:
        return Vector2.up;

      case Direction4.Down:
        return Vector2.down;

      case Direction4.Left:
        return Vector2.left;

      case Direction4.Right:
        return Vector2.right;

      default:
        throw new NotImplementedException($"Uknown {nameof(Direction4)} passed");
    }
  }
}
```
If we have use Unity with C# 8.0 support, we have access to (switch expressions)[https://learn.microsoft.com/en-US/dotnet/csharp/language-reference/operators/switch-expression], that can make above code shorter without sacrifising readability:
```c#
static class Direction4Helpers
{
  public static Vector2 ToVector2(Direction4 direction) => dir switch
  {
    Direction4.Up => Vector2.up,
    Direction4.Down => Vector2.down,
    Direction4.Right => Vector2.right,
    Direction4.Left => Vector2.left,
    _ => throw new NotImplementedException($"Uknown {nameof(Direction4)} passed"),
  };
}
```

Now that we have something that we can work with (`Vector2`), let's see how to make use of `Direction4`:
```c#
public void Move(Direction4 direction, float distance)
{
  rigidBody.MovePosition(Direction4Helpers.ToVector2(direction) * distance);
}
```
It's a little too verbose to write `Direction4Helpers` every time when we want to use `Direction4`. Fortunately, there's a smart feature inside C# that can make this code more consistent, it's called [Extension Methods](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods):
```diff
static class Direction4Helpers
{
-  public static Vector2 ToVector2(Direction4 direction) => dir switch
+  public static Vector2 ToVector2(this Direction4 direction) => dir switch
  {
    Direction4.Up => Vector2.up,
    Direction4.Down => Vector2.down,
    Direction4.Right => Vector2.right,
    Direction4.Left => Vector2.left,
    _ => throw new NotImplementedException($"Uknown {nameof(Direction4)} passed"),
  };
}

public void Move(Direction4 direction, float distance)
{
-  rigidBody.MovePosition(Direction4Helpers.ToVector2(direction) * distance);
+  rigidBody.MovePosition(direction.ToVector2() * distance);
}
```
Thanks to that each instance of `Direction4` can invoke methods from the helpers class. Yet again we managed to remove unnecesarry verbosity without losing readability. It's worth mentioning that Intellisense works flawlessy with extension methods ;).

Casting `Direction4` to `Vector2` to multiply it with float is so commonly used that I modified `ToVector2` method to make it possible to combine both things:
```c#
static class Direction4Helpers
{
  public static Vector2 ToVector2(this Direction4 direction, float value = 1) => dir switch
  {
    Direction4.Up => Vector2.up * value,
    Direction4.Down => Vector2.down * value,
    Direction4.Right => Vector2.right * value,
    Direction4.Left => Vector2.left * value,
    _ => throw new NotImplementedException($"Uknown {nameof(Direction4)} passed"),
  };
}

public void Move(Direction4 direction, float distance)
{
  rigidBody.MovePosition(direction.ToVector2(distance));
}
```
It's a little too tighly-coupled for my taste (onyl one operator is supported), but it works for majority of use cases.

I showed above code becuase there is one serious downside for writing extension methods for enums, we cannot make (overload operators)[https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/operator-overloading]. In a perfect world, I'd love to create arithmetic and (conversion)[https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/user-defined-conversion-operators] operators like this:
```c#
static class Direction4Helpers
{
  public static implicit operator Vector2(Direction4 direction) => direction.ToVector2();
  public static float operator *(Direction4 direction, float value) => direction.ToVector2() * value;
  public static float operator +(Direction4 direction, float value) => direction.ToVector2() + value;
}
```
And be able to use it like this:
```c#
public void Move(Direction4 direction, float distance)
{
  rigidBody.MovePosition(direction * distance);
}
```

This cannot be achieved when using enum, so we're doomed to always explicitly use method to cast our enums to different structures. I wrote at the beginning that I like to use `Direction4` quite frequently, so here's a list of some of the extension methods:
```c#
public static class Direction4Helpers
{
  public static Vector2 ToVector2(this Direction4 dir);
  public static Direction4 FromVector2(Vector2 vector2);
  public static Direction4 Negative(this Direction4 dir);
  public static Direction4 FromXFloat(float value);
  public static Direction4 FromYFloat(float value);
  public static float Sign(this Direction4 dir);
  public static Direction4 Clockwise(this Direction4 dir);
  public static Direction4 CounterClockwise(this Direction4 dir);
  public static float GetAngles(this Direction4 dir);
}
```
Of course almost each method needs `switch` usage. 

After searching for a solution to this, I stumbled upon a concept called (Enumeration classes)[https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/enumeration-classes-over-enum-types]. It's quite simple - it's a class with a private constructor and static instances that define the finite values. If I were to declare `Direction4` as a enumeration class it might look like this:
```c#
public class Direction4
{
  public static Direction4 Up = new Direction4(Vector2.up, nameof(Up));
  public static Direction4 Down = new Direction4(Vector2.down, nameof(Down));
  public static Direction4 Left = new Direction4(Vector2.left, nameof(Left));
  public static Direction4 Right = new Direction4(Vector2.right, nameof(Right));

  private readonly Vector2 vector;
  private readonly string identifier;

  private Direction4(Vector2 vector, string identifier) =>
    (this.vector2, this.identifier) = (vector, identifier);

  public override bool Equals(object obj) =>
    obj is Direction4 other &&
    (vector, identifier) == (other.vector, other.identifier);

  public override string ToString() => $"{nameof(Direction4)}.{identifier}";
  public override int GetHashCode() => HashCode.Combine(vector, identifier);
}
```
Because we're dealing with a class, we can have properties inside, a `Vector2` and a `string` identifier should be enough. The identifier is helpful for a lot of debugging scenarios. The unfortunate part is that we need to override three methods to make this class robust: `Equals`, `ToString` and `GetHashCode`. Luckily we can use `HashCode.Combine` for each hashCode generation, and we can compare tuples to get easy value equality check.

Now let's see how the methods of this class can look like:
```c#
public partial class Direction4
{
  public static implicit operator Vector2(Direction4 direction) => direction.vector;
  public static implicit operator float(Direction4 direction) =>
    direction.vector.x != 0 ? direction.vector.x : direction.vector.y;
  public static float Sign(Direction4 dir) => Mathf.Sign(direction);
}
```
The convertions to `float` or `Vector2` are super easy and straightforward, but there are methods that suddenly became uglier than before:
```c#
public partial class Direction4
{
  public static Direction4 operator -(Direction4 dir)
  {
    if (dir == Up) return Down;
    if (dir == Right) return Left;
    if (dir == Down) return Up;
    if (dir == Left) return Right;
    throw new NotImplementedException($"Uknown {nameof(Direction4)} passed");
  }
}
```
First of all, we cannot use `switch` with our class, that's becuase the static properties are not constants. In this method case we cannot simply reverse the vector inside our direction, because all the internals are `readonly` (as they should be, we don't want to mutate `vector` inside all instances of a specific direction).

Another change to `enum` is how classes are working in c#. With enums, we've declared 4 possible values, which means that a variable of type `enum Direction4` **always** have a value assigned. With enumeration class we could end up with `null` (unless we've enabled [nullable context](https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references#nullable-contexts)). Depending on our use-case this can be welcomed or not. With classes there's no way of forcing that `Direction4` must require a value (that's because Unity cannot be configured to explicitly anottate types as nullable). With enums, we can either introduce a fifth value:
```c#
enum Direction4
{
  Empty,
  Up,
  Down,
  Left,
  Right
}
```
Or create a struct that'll tell if it contains value or not:
```c#
[Serialiable]
struct Optional<T>
{
  [SerializeField] private bool hasValue;
  [SerializeField] private T value;

  public static implicit operator T(Optional<T> optional) => optional.value;
  public static implicit operator bool(Optional<T> optional) => optional.hasValue;
}
```
I got the idea behind `Optional` struct from an amazing [Unity Tip Youtube video](https://youtu.be/uZmWgQ7cLNI).

Basically