# Deep copy and shadow copy in python

---

date: 12/02/2024
topics: python copy

---

## Shadow copy

There are few ways to perform shadom copy in python

1. Assigning

```python
a = [1, 2, 3, ['x', 'y', 'z'], 4, 5]
b = a

a.append(6)
print('a = ',a) # [1, 2, 3, ['x', 'y', 'z'], 4, 5, 6]
print('b = ',b) # [1, 2, 3, ['x', 'y', 'z'], 4, 5, 6]

a[2] = 100
print('a = ',a) # [1, 2, 100, ['x', 'y', 'z'], 4, 5, 6]
print('b = ',b) # [1, 2, 100, ['x', 'y', 'z'], 4, 5, 6]
```

all the chances in `a` will be reflected in `b` and vice versa.

2. Slicing

```python
a = [1, 2, 3, ['x', 'y', 'z'], 4, 5]
b = a[:]

a.append(6)
print('a = ',a) # [1, 2, 3, ['x', 'y', 'z'], 4, 5, 6]
print('b = ',b) # [1, 2, 3, ['x', 'y', 'z'], 4, 5]

a[2] = 100
print('a = ',a) # [1, 2, 100, ['x', 'y', 'z'], 4, 5, 6]
print('b = ',b) # [1, 2, 3, ['x', 'y', 'z'], 4, 5, 6]

a[3][1] = 'a'
print('a = ',a) # [1, 2, 100, ['x', 'a', 'z'], 4, 5, 6]
print('b = ',b) # [1, 2, 3, ['x', 'a', 'z'], 4, 5, 6]
```

unlike assigning, slicing will not reflect the changes in `a` to `b` but it will reflect the changes in `a` to `b` if the changes are made in the nested list.

3. Copy module

```python
import copy

a = [1, 2, 3, ['x', 'y', 'z'], 4, 5]
b = copy.copy(a)

a[2] = 100
print('a = ',a) # [1, 2, 100, ['x', 'y', 'z'], 4, 5, 6]
print('b = ',b) # [1, 2, 3, ['x', 'y', 'z'], 4, 5, 6]

a[3][1] = 'a'
print('a = ',a) # [1, 2, 100, ['x', 'a', 'z'], 4, 5, 6]
print('b = ',b) # [1, 2, 3, ['x', 'a', 'z'], 4, 5, 6]
```

have the same behaviour as slicing.

## Deep copy

```python
import copy

a = [1, 2, 3, ['x', 'y', 'z'], 4, 5]
b = copy.deepcopy(a)

a[2] = 100
print('a = ',a) # [1, 2, 100, ['x', 'y', 'z'], 4, 5, 6]
print('b = ',b) # [1, 2, 3, ['x', 'y', 'z'], 4, 5, 6]

a[3][1] = 'a'
print('a = ',a) # [1, 2, 100, ['x', 'a', 'z'], 4, 5, 6]
print('b = ',b) # [1, 2, 3, ['x', 'y', 'z'], 4, 5, 6]
```

now, all the changes in `a` will not be reflected in `b` and vice versa.
