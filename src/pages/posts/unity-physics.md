---
layout: "../../layouts/BlogPost.astro"
title: 2d platformer movement in Unity part 1
description: Writing reliable movement in Unity for 2d tile based games
pubDate: '2024-08-01'
tag: gamedev
---

# 1. Preface
When I first started playing out with `Unity` I quickly noticed how frustating moving `Rigidbody2D` and depending on its collisions were. I wanted my characters to move with specific velocity, have precise collision system that'll make it possible to have objects move and ineract with each other as I like.

[`Rigidbody2D`](https://docs.unity3d.com/Manual/rigidbody2D-body-types.html) body types: `dynamic`, `kinetic` and `static` turned out not to fit my needs, so after watching and reading countless articles and tutorials I've managed to figure out how to move things around in a Unity in a satisfying way and be in control of everything I need.

My solution to moving objects are fit for 2D tile-based games. If you're building something different chances are that my code won't satify your needs.

My friend likes to call my set of components _"my-custom-physics"_ even though underneath it's still using Unity built-in `Collider2D`, `Rigibody2D` and `Physics2D`. Still, I need a name for my solution and I always named it simply `PhysicsMovement`.

# 2. Basics
There are two major components - `PhysicsMovement` and `IPhysicsCollidable`. Every time I want to move GameObject I use `Vector2 PhysicsMovement.Move(Vector2 deltaMove)` method. I pass the desired distance, and receive the distance that the GameObject actually moved. Let's use a simple visuallization:

![physics-move-basic-example1](/images/posts/unity-physics/physics-move-basic-example1.png)

1. There are two GameObjects `A` and `B`.
2. GameObject `A` wants to move by distance `delta` and it uses `PhysicsMovement` component for that. It checks if there are any colliders with `IPhysicsCollidable` component inside in it's path. It encounters GameObject `B`.
3. GameObject `B` gets information that component `A` wants to move into it from specific direction and for specific distance.
4. GameObject `B` responds to `A` by returning how much `A` can move into it. It returns whole distance.
5. GameObject `A` adjusts it's distance to the new allowed distance.
6. GameObject `A` moves only by allowed distance.
7. During GameObject `A` movement it gets inside `B`.
8. GameObject `B` gets information that component `A` moves into it from specific direction and for specific distance. It can react and call some effects.

In this exmaple GameObject `B` allows `A` to move into it fully. It could be however that `B` behaves like an obstacle and stops anything that tries to move into it.

![physics-move-basic-example2](/images/posts/unity-physics/physics-move-basic-example2.png)

1. There are two GameObjects `A` and `B`.
2. GameObject `A` wants to move by distance `delta`. It encounters GameObject `B`.
3. GameObject `B` responds to `A` and returns that allowed distance into it is 0.
4. GameObject `A` adjusts it's distance to the new allowed distance.
5. GameObject `A` moves only by allowed distance.
6. During GameObject `A` movement there's nothing in its path, it reaches right next to `B` but doesn't move into it.

GameObject `B` can also be a movable object, in which case it can move in response to `A` movement:

![physics-move-basic-example3](/images/posts/unity-physics/physics-move-basic-example3.png)

1. There are three GameObjects `A`, `B`, and `C`.
2. GameObject `A` wants to move by distance `delta`. It encounters GameObject `B`.
3. GameObject `B` in response to `A` checks how much it can move by distance `delta_b`. It encounters GameObject `C`.
4. GameObject `C` in response to `B` returns that allowed distance into it is 0.
5. GameObject `B` returns to `A` can much it can move itself.
4. GameObject `A` adjusts it's distance to the new allowed distance.
5. GameObject `A` moves only by allowed distance.
7. During GameObject `A` movement it gets inside `B`.
8. GameObject `B` gets information that component `A` moves into it and as a reaction it moves as well.
9. During GameObject `B` movement there's nothing in it's path it reaches right next to `C` but doesn't move into it.

Our moving GameObject can meet more than one obstacle in it's path, in such case the least allowed distance is one that will be used.
![physics-move-basic-example4](/images/posts/unity-physics/physics-move-basic-example4.png)

1. There are four GameObjects `A`, `B`, `C`, and `D`.
2. GameObject `A` wants to move by distance `delta`. It encounters GameObjects `B`, `C`, and `D`.
3. Each of the GameObjects `B`, `C`, `D` returns 0 as allowed distance
4. GameObject `A` moves by smallest allowed distance - up to `B`.
5. During GameObject `A` movement there's nothing in it's path it reaches right next to `B` but doesn't move into it.

As you can see every move is split into two phases:
1. Resolving information how much object can move.
2. Applying the move and invoking collisions.

Three examples above showed easy cases where we want to move only in a single axis. But usually our object moves in both axes: horizontal and vertical. It's important that during the move we split and resolve individually both axes. Look at the examples where movement is resolved using:

1. Both axes at once:
![physics-move-axes-example1](/images/posts/unity-physics/physics-move-axes-example1.png)
2. Horizontal then vertical:
![physics-move-axes-example2](/images/posts/unity-physics/physics-move-axes-example2.png)
3. Vertical then horizontal:
![physics-move-axes-example3](/images/posts/unity-physics/physics-move-axes-example3.png)

The tileset in this example is obstacle that prevents moving into it. Each one gives moving GameObject different end position. From my experience with 2d platformer games `horizontal-then-vertical` provides satisfying results and I always use that.

Splitting movement into separate axes is also useful when resolving collisions like:
1. One-way platforms: the platform doesn't allow moving to it but only if the move direction is from top:
![platform-example](/images/posts/unity-physics/platform-example.png)

2. Crusing blocks: if it moves into player from the top and player is grounded it should crush him, but otherwise it behaves like normal obstacle:
![block-crush-example](/images/posts/unity-physics/block-crush-example.png)

Simple high-level code for our PhysicsMovment can look like this:
```c#
enum MoveMode
{
  HorizontalThenVertical,
  VerticalThenHorizontal
}

public class PhysicsMove : MonoBehaviour
{
  [SerializeField] private new Rigibdy2D rigidbody;

  public Vector2 Move(Vector2 wantsToMove, MoveMode moveMode = MoveMode.HorizontalThenVertical)
  {
    var axes = moveMove == MoveMode.HorizontalThenVertical ? new int[]{0, 1} : new int[]{1, 0};
    Vector2 movedAmount = Vector2.zero;
    foreach (var axis in axes)
    {
      var value = wantsToMove[axis];
      var sign = Mathf.Sign(value);
      var distance = Mathf.Abs(value);
      var direction = sign * (axis == 0 ? Vector2.right : Vector2.up);
      var allowedDistance = GetAllowedDistance(distance, direction);
      ApplyMove(distance, direction);

      rigidbody.position += sign * allowedMove * direction;
    }
    return movedAmount;
  }

  private float GetAllowedDistance(float distance, Vector2 direction)
  {
    var hits = GetHitsInTheWay(distance, direction);
    var minAllowedMove = distance;
    foreach (var hit in hits)
    {
      if (!hit.collider.TryGetComponent(out IPhysicsCollidable collidable))
      {
        continue;
      }
      var allowedMoveIntoCollidable = collidable.GetAllowedDistance(this, distance, direction);
      minAllowedMove = Mathf.Min(minAllowedMove, allowedMoveIntoCollidable);
    }
    return minAllowedMove;
  }

  private void ApplyMove(float distance, Vector2 direction)
  {
    var hits = GetHitsInTheWay(distance, direction);
    foreach (var axis in axes)
    {
      if (!hit.collider.TryGetComponent(out IPhysicsCollidable collidable))
      {
        continue;
      }
      collidable.OnMoveInto(this, distance, direction);
    }
  }
}
```

Now we have basics for moving our objects. We can use `PhysicsMovement` to create complex movement interactions, like this one:

![physics-move-complex-example](/images/posts/unity-physics/physics-move-complex-example.png)

1. Player `A` moves block `B`.
2. Block `B` can be moved only up to the wall `W`.
2. Block `B` has object `C` on top and after every move it moves all objects on top of it.

Now that we established high level of resolving movement let's talk about next important thing: collision detection. In the code exmaple above there's unimplemented method `RaycastHit2D[] GetHitsInTheWay(float distance, Vector2 direction)`. Let's see how can we implement it.

# 3. Collision detection
Unity has 2 types of collision detection: `OnCollision2D` and `OnTriggerCollision2D`, both have 3 phases: enter, stay, leave. That gives us:
1. `OnCollisionEnter2D(Collision2D)`
2. `OnCollisionStay2D(Collision2D)`
3. `OnCollisionExitD(Collision2D)`
4. `OnTriggerEnter2D(Collider2D)`
5. `OnTriggerStay2D(Collider2D)`
6. `OnTriggerExit2D(Collider2D)`

But each of these callbacks are called after we've moved objects not before them. We need to explicitly check what is in the way of moving a collider. There are three ways:
1. [`Physics2D.Raycast()`](https://docs.unity3d.com/ScriptReference/Physics2D.Raycast.html)
2. [`Physics2D.BoxCast()`](https://docs.unity3d.com/ScriptReference/Physics2D.BoxCast.html)
3. [`Collider2D.Cast()`](https://docs.unity3d.com/ScriptReference/Collider2D.Cast.html)

Let's describe in details how they differ.

## 3.1. Raycast
Using `Physics2D.Raycast()` is like shooting a laser from certain start to end position. It returns array of `RaycastHit2D` struct that holds information what collider in our way and how far it is. Becuase we move BoxCollider2D our object can meet obstacles on various heights. That's why when we want to detect collisions when moving in a single axis we need to shoot many raycasts. 

![physics-move-raycast-example1]()

How many raycasts? It depend on our tileset size and if we have obstacles smaller than single size. We want to make sure that the gap between two raycasts is smaller than the minimal possible collider side. For 16px tileset we can safely go with raycast gap 15px and ensure that there is raycast at the beginning and end of the side we're sending raycasts from.

![physics-move-raycast-example2]()

The code might look like this:
```c#
public class PhysicsMove : MonoBehaviour
{
  private static const int TILE_SIZE = 16;
  private static const int RAYCAST_GAP = TILE_SIZE - 1;

  private RaycastHit2D[] GetHitsInTheWay(float distance, Vector2 direction)
  {
    var results = new List<RaycastHit2D>();
    var bounds = collider.bounds;
    // we assume that direction is either Vector2.left, Vector2.right, Vector2.up, Vector2.down
    if (direction == Vector2.left || direction == Vector2.right)
    {
      var edge = bounds.max.y - bounds.min.y;
      var x = direction == Vector2.left ? bounds.min.x : bounds.max.x;
      var y = bounds.min.y;
      for (int i = 0; i < edge; i += RAYCAST_GAP)
      {
        var origin = new Vector2(x, bounds.min.y + i);
        var hits = Physics2D.RaycastAll(origin, direction, distance);
        results.AddRange(hits);
      }
      // if height is not divisible by RAYCAST_GAP add last raycast position
      if (edge % RAYCAST_GAP != 0)
      {
        var origin = new Vector2(x, bounds.max.y);
        var hits = Physics2D.RaycastAll(origin, direction, distance);
        results.AddRange(hits);
      }
    }
    else
    {
      var edge = bounds.max.x - bounds.min.x;
      var x = bounds.min.x;
      var y = direction == Vector2.down ? bounds.min.y : bounds.max.y;
      for (int i = 0; i < edge; i += RAYCAST_GAP)
      {
        var origin = new Vector2(bounds.min.x + i, y);
        var hits = Physics2D.RaycastAll(origin, direction, distance);
        results.AddRange(hits);
      }
      // if width is not divisible by RAYCAST_GAP add last raycast position
      if (bounds.size.x % RAYCAST_GAP != 0)
      {
        var origin = new Vector2(bounds.max.x, y);
        var hits = Physics2D.RaycastAll(origin, direction, distance);
        results.AddRange(hits);
      }
    }
    
    return results;
  }
}
```

That seems ok at first glimpse. But what happens if our character go into area that has space matching exactly it's height. We should fit, right? In Unity Physics2D positions are floating numbers, so even in the tile based game there can be position `0`, `16`, `32` but it can be also `15.9999` or `0.0001`. Latter numbers appears even if the player is moving only on perfect `16x16` grid tileset, it's just side effect of floating-point numbers - they are represented in a binary format that cannot precisely represent all decimal numbers. If our player has height `16px` and it moves horizontally we always want to shoot raycast at height `0`, `15`, and `16`. If our player has `position.y` equals `0.001` that means that bottom raycast will pass (it won't collide with the floor) but top will complain that at `hit.distance = 0` there is tileset, and we won't be able to move our player.

![physics-move-raycast-example3]()

To mitigate that I introduced a concept that I call `skinWidth`. I take a pretty small number (`0.01f` worked well so far) and always shoot top and bottom raycasts (or left, right in case of vertical movement) moved by `skinWidth` to ensure that they won't collide with floor/ceiling that are perfectly aligned with the tileset.
```c#
bottomRaycast.y = collider.min.y + skinWidth; // move slightly above
topRaycast.y = collider.max.y - skinWidth; // move slightly down

leftRaycast.y = collider.min.x + skinWidth; // move slightly to the right
rightRaycast.y = collider.min.x - skinWidth; // move slightly to the left
```

![physics-move-raycast-topbottom-skinwidth]()

Here's another tricky part - if our player collider is standing right next to the wall (other collider) and wants to move towards it, same floating-point precision problem occurs. We might stand at `16.0001` position and our raycast might start over the wall collider and tell the player that there is nothing in it's way:

![physics-move-raycast-wall-skinwidth]()

1. We need to use `skinWidth` again, and shoot raycasts from origin position moved by `-raycastDirection * skinWidth`.
2. That will make our raycast slightly shorter so we have to adjust the raycast distance `raycastDistance += skinWidth`.
3. Finally we want to move our collider to it's actual size (not size modified with `skinWidth`) so we have to adjust our `RaycastHit2D` to represent the real movement `hit.distance = hit.distance - skinWidth`.

![physics-move-raycast-distance-plus-skinwidth]()

Now becuase we're starting raycasts inside the collider for which we want to detect collisions they might collide with it as well (it depends if the collider is in the layer that react with the layerMask that we defined for the raycast [ref](https://docs.unity3d.com/ScriptReference/LayerMask.html)). That's why we must remove `RaycastHit2D` with that collider.

![physics-move-raycast-this-collider]()

Additionally becuase we shoot many raycasts for the same movement each of them might hit the same collider. Becuase there's no sense in resolving the collision many times for the same movement, we have to remove duplicates.

![physics-move-raycast-duplicates-same-distance]()

But becuase that collider might have complex shape (e.q. `TilemapCollider2D`) and our collisions are meant for movement, we want to leave the closest collision.

![physics-move-raycast-duplicates-different-distance]()

To summarize the collision detection with raycast is split into these steps:
1. Choose a boxCollider2D edge (based on direction where we want to detect collisions)
2. Decrease the edge by skinWidth on both sides
3. Move the edge back by skinWidth
4. Shoot raycasts per `raycastGap` (plus the last position) starting on our choosen edge for `distance + skinWidth`
5. For each hit decrease it's distance by `skinWidth`: `hit.distance = hit.distance - skinWidth`
6. Gather all hits and remove duplicates (leaving only hit with closes distance) and the collider that we want to move

Let's show the code for that
```c#
public class PhysicsMove : MonoBehaviour
{
  private static const int TILE_SIZE = 16;
  private static const int RAYCAST_GAP = TILE_SIZE - 1;
  private static const float SKIN_WIDTH = 0.1f;

  [SerializeField] private Rigidbody2D rigidbody;

  private RaycastHit2D[] GetHitsInTheWay(float distance, Vector2 direction)
  {
    var results = new List<RaycastHit2D>();
    var bounds = collider.bounds;
    bounds.size -= Vector2.one * 2 * SKIN_WIDTH; // with this one line we decrease the edge and move it back

    // we assume that direction is either Vector2.left, Vector2.right, Vector2.up, Vector2.down
    if (direction == Vector2.left || direction == Vector2.right)
    {
      var edge = bounds.max.y - bounds.min.y;
      var y = bounds.min.y;
      var x = direction == Vector2.left ? bounds.min.x : bounds.max.x;
      for (int i = 0; i < bounds.max.y; i += RAYCAST_GAP)
      {
        var origin = new Vector2(x, y + i);
        var hits = Physics2D.RaycastAll(origin, direction, distance + SKIN_WIDTH);
        results.AddRange(hits);
      }
      // if height is not divisible by RAYCAST_GAP add last raycast position
      if (bounds.size.y % RAYCAST_GAP != 0)
      {
        var origin = new Vector2(x, bounds.max.y);
        var hits = Physics2D.RaycastAll(origin, direction, distance + SKIN_WIDTH);
        results.AddRange(hits);
      }
    }
    else
    {
      var x = bounds.min.x;
      var y = direction == Vector2.down ? bounds.min.y : bounds.max.y;
      for (int x = 0; i < bounds.max.x; x += RAYCAST_GAP)
      {
        var origin = new Vector2(x, y);
        var hits = Physics2D.RaycastAll(origin, direction, distance + SKIN_WIDTH);
        results.AddRange(hits);
      }
      // if width is not divisible by RAYCAST_GAP add last raycast position
      if (bounds.size.x % RAYCAST_GAP != 0)
      {
        var origin = new Vector2(bounds.max.x, y);
        var hits = Physics2D.RaycastAll(origin, direction, distance + SKIN_WIDTH);
        results.AddRange(hits);
      }
    }
    
    return OmitThisAndDuplicates(results);
  }

  private RaycastHit2D[] OmitThisAndDuplicates(List<Raycast2D> hits)
  {
    var result = new Dictionary<Rigidbody, RaycastHit2D>();
    foreach (var hit in hits)
    {
      if (hit.rigibody == this.rigidbody)
      {
        continue;
      }

      hit.distance = Mathf.Min(0, hit.distance - SKIN_WIDTH);
      if (result.TryGet(hit.rigidbody, out RaycastHit2D existingHit))
      {
        if (hit.distance < existingHit.distance)
        {
          result[hit.rigidbody] = hit;
        }
        continue;
      }

      result[hit.rigidbody] = hit;
    }
    return result.ToArray();
  }
}
```

That's it for the collision detection with raycasts. Seems complicated but I find them incredibly reliable. Of course we can optimize raycasting with non-allocating functions, but that's not the scope of this post. In Unity 2022.3 there's [Physics2D.RaycastNonAlloc()](https://docs.unity3d.com/ScriptReference/Physics2D.RaycastNonAlloc.html) function, but future versions will have only `Physics2D.Raycast()` functions and there's will be a non-allocating overload.

## 3.2. BoxCast

TODO

## 3.3. Collider.Cast

TODO

# 4. Extras

TODO

# 5. Summary

TODO