# Constraint Satisfaction Problem in Generation

---

date: 20/07/2024
topics: search algorithm

---

## Background

I have watched a video about [Procedural Generation using Constraint Satisfaction](https://www.youtube.com/watch?v=gKNJKce1p8M&list=WL&index=8). This video shown how to generation map or plants using constraint. I think it is a good idea and can be explore more.

## Constraint Satisfaction with one solution: Sudoku

First, we may start with simple question with can be solve and even have only one solution like Sudoku.

- Variable: Sudoku 9x9 map
- Domain: 1-9
- Constraint: in row, col and 3x3 grid should not have same number

```py
def solver(board):
    # check if valid board
    if len(board) != 9 or any(len(row) != 9 for row in board):
        raise ValueError('Invalid board')

    # find the empty cell
    i, j = -1, -1
    for row in range(9):
        for col in range(9):
            if board[row][col] == -1:
                i, j = row, col
                break
        if i != -1:
            break

    # if no empty cell is found, the board is solved
    if i == -1 and j == -1:
        return True

    # try to fill the empty cell with a number from 1 to 9
    for num in range(1, 10):
        # check constraint
        row = board[i]
        col = [board[row][j] for row in range(9)]
        grid = [board[x][y] for x in range(i//3*3, i//3*3+3) for y in range(j//3*3, j//3*3+3)]
        if num not in row and num not in col and num not in grid:
            board[i][j] = num
            if solver(board):
                return True
            board[i][j] = -1

    # if no number can be filled in the empty cell, the board is unsolvable
    return False

def printSudoku(board):
    print("-" * 25)
    for i in range(9):
        print("|", end=" ")
        for j in range(9):
            print(board[i][j], end=" ")
            if (j + 1) % 3 == 0:
                print("|", end=" ")
        print()
        if (i + 1) % 3 == 0:
            print("-" * 25)


if __name__ == '__main__':
    board = [
        [-1, -1, -1, 7, 2, 4, -1, -1, -1],
        [1, -1, -1, -1, 9, -1, -1, -1, -1],
        [9, -1, 6, -1, 3, -1, -1, -1, -1],
        [5, 8, -1, -1, -1, -1, -1, 6, -1],
        [-1, -1, -1, -1, -1, 7, -1, 3, -1],
        [-1, -1, -1, 8, -1, -1, 9, -1, -1],
        [-1, -1, 2, 3, -1, -1, -1, -1, 7],
        [-1, 9, -1, -1, -1, -1, 4, -1, 2],
        [-1, -1, 4, -1, -1, -1, -1, -1, -1],
    ]
    solver(board)
    printSudoku(board)

```

## Constraint Satisfaction with multiple solution

### Map Generation with minimun conflict algorithm

The idea of this is utilizing the minimun conflict algorithm to find the local solution. Since we bring randomness to the algorithm, we can find multiple solution which is good for map generation.

- Variable: 2D map
- Domain: Block type (e.g. island, sea, mountain)
- Constraint: like in the video, we can define the constraint like sea should not be too close to mountain

```py
import enum
import numpy as np

class BlockType(enum.IntEnum):
    EMPTY = 0
    SEA = 1
    LAND = 2
    MOUNTAIN = 3

    @staticmethod
    def get_non_empty_block_list():
        return list(map(lambda x: x.value, BlockType._member_map_.values()))[
            1:
        ]


def print_map(map):
    block2emoji = {
        BlockType.EMPTY: '🏔️',
        BlockType.SEA: '🌊',
        BlockType.LAND: '🌲',
        BlockType.MOUNTAIN: '🏔️',
    }

    for row in map:
        print(''.join([block2emoji[block] for block in row]))


def generator(width, height, max_iter, trail_per_block):
    # init
    map = init_map(width, height)
    block_type = BlockType.get_non_empty_block_list()

    for _ in range(max_iter * width * height):
        x, y = np.random.randint(0, height), np.random.randint(0, width)
        best_type = map[x][y]
        min_conflict = np.inf
        for _ in range(trail_per_block):
            chosen_type = np.random.choice(block_type)
            map[x][y] = chosen_type
            conflict = conflict_calucator(map, x, y)
            if conflict < min_conflict:
                best_type, min_conflict = chosen_type, conflict
        map[x][y] = best_type

    return map

def init_map(width, height):
    map = np.full((height, width), BlockType.EMPTY)
    return map

def conflict_calucator(map, x, y):
    conflict = 0
    neighbour = get_neighbour(map, x, y, 2)
    for nx, ny in neighbour:
        # mountain cannot be adjacent to sea
        if map[nx][ny] == BlockType.MOUNTAIN and map[x][y] == BlockType.SEA:
            conflict += 1
        # sea cannot be adjacent to mountain
        if map[nx][ny] == BlockType.SEA and map[x][y] == BlockType.MOUNTAIN:
            conflict += 1

    return conflict


def get_neighbour(map, x, y, size):
    direction = []
    for i in range(-size, size + 1):
        for j in range(-size, size + 1):
            if i == 0 and j == 0:
                continue
            direction.append([i, j])
    neighbour = direction + np.array([x, y])
    valid_neighbour = (neighbour[:, 0] >= 0) & (neighbour[:, 0] < map.shape[0]) & (neighbour[:, 1] >= 0) & (neighbour[:, 1] < map.shape[1])
    neighbour = neighbour[valid_neighbour]

    return neighbour


if __name__ == '__main__':
    width = 100
    height = 50
    map = generator(width, height, 100, len(BlockType))
    print_map(map)
```

### Map Generation with backtracking algorithm

Sometimes we dun want any conflict but we still want to bring the randomness to the map. The backtracking algorithm can be used to find the solution.

- Variable: 2D map
- Domain: block type which restrict by neighbour's block type
  ```
  e.g. Block 3 cannot please at the right hand side of Block 1 and Block 2
           ###           # #         ###
  Block 1:       Block 2:    Block 3:#
           ###           ###         # #
  ```
- Constraint: block type do not conflict with neighbour

````py
- Constraint: block type do not conflict with neighbour

```py
import enum
from typing import Dict, List
import numpy as np

class BlockType(enum.IntEnum):
    EMPTY = 0
    BLOCK1 = 1
    BLOCK2 = 2
    BLOCK3 = 3
    BLOCK4 = 4
    BLOCK5 = 5
    BLOCK6 = 6
    BLOCK7 = 7
    Block8 = 8
    Block9 = 9
    Block10 = 10
    BLOCK11 = 11


class Direction(enum.IntEnum):
    NORTH = 0
    EAST = 1
    SOUTH = 2
    WEST = 3

rules: Dict[BlockType, List[Direction]] = {
    BlockType.BLOCK1: [Direction.WEST, Direction.EAST],
    BlockType.BLOCK2: [
        Direction.NORTH,
        Direction.EAST,
        Direction.SOUTH,
        Direction.WEST,
    ],
    BlockType.BLOCK3: [Direction.EAST, Direction.SOUTH, Direction.WEST],
    BlockType.BLOCK4: [Direction.NORTH, Direction.EAST, Direction.WEST],
    BlockType.BLOCK5: [Direction.NORTH, Direction.SOUTH],
    BlockType.BLOCK6: [Direction.NORTH, Direction.EAST, Direction.SOUTH],
    BlockType.BLOCK7: [Direction.NORTH, Direction.WEST, Direction.SOUTH],
    BlockType.Block8: [Direction.NORTH, Direction.EAST],
    BlockType.Block9: [Direction.NORTH, Direction.WEST],
    BlockType.Block10: [Direction.SOUTH, Direction.WEST],
    BlockType.BLOCK11: [Direction.EAST, Direction.SOUTH],
}

block_type_to_string = {
    BlockType.EMPTY: ['###', '###', '###'],
    BlockType.BLOCK1: ['###', '   ', '###'],
    BlockType.BLOCK2: ['# #', '   ', '# #'],
    BlockType.BLOCK3: ['###', '   ', '# #'],
    BlockType.BLOCK4: ['# #', '   ', '###'],
    BlockType.BLOCK5: ['# #', '# #', '# #'],
    BlockType.BLOCK6: ['# #', '#  ', '# #'],
    BlockType.BLOCK7: ['# #', '  #', '# #'],
    BlockType.Block8: ['# #', '#  ', '###'],
    BlockType.Block9: ['# #', '  #', '###'],
    BlockType.Block10: ['###', '  #', '# #'],
    BlockType.BLOCK11: ['###', '#  ', '# #'],
}

direction_to_coordinate_change = {
    Direction.NORTH: (-1, 0),
    Direction.EAST: (0, 1),
    Direction.SOUTH: (1, 0),
    Direction.WEST: (0, -1),
}

choosalbe_blocks = list(filter(lambda x: x != BlockType.EMPTY, BlockType))


def generate_map(
    width, height
) -> np.ndarray[BlockType, np.dtype[np.int8]] | None:
    x, y = np.random.randint(0, height), np.random.randint(0, width)
    map = np.full((height, width), BlockType.EMPTY)
    if assign_block(map, x, y, np.random.choice(choosalbe_blocks)):
        return map

    print('Failed to generate map')
    return None


def assign_block(map, x, y, block):
    map[x][y] = block

    is_conflict = False
    for direction, neighbour in get_neighbour(map, x, y).items():
        if neighbour is None:
            continue
        if neighbour == BlockType.EMPTY:
            continue
        relative_direction = (direction.value + 2) % 4
        if (
            direction in rules[block]
            and Direction(relative_direction) not in rules[neighbour]
        ):
            is_conflict = True
            break
        if (
            direction not in rules[block]
            and Direction(relative_direction) in rules[neighbour]
        ):
            is_conflict = True
            break

    if is_conflict:
        map[x][y] = BlockType.EMPTY
        return False

    valid_step = True
    shuffled_directions = np.random.permutation(list(Direction))
    shuffled_blocks = np.random.permutation(choosalbe_blocks)
    for possible_direction in shuffled_directions:
        dx, dy = direction_to_coordinate_change[possible_direction]
        if (
            not validate_position(map, x + dx, y + dy)
            or map[x + dx][y + dy] != BlockType.EMPTY
        ):
            continue

        valid_direction = False
        for shuffled_block in shuffled_blocks:
            if assign_block(map, x + dx, y + dy, shuffled_block):
                valid_direction = True
                break

        if not valid_direction:
            valid_step = False
            map[x + dx][y + dy] = BlockType.EMPTY
            break
    if not valid_step:
        map[x][y] = BlockType.EMPTY
        return False

    return True


def get_neighbour(map, x, y) -> Dict[Direction, BlockType | None]:
    neighbours = {
        Direction.NORTH: map[x - 1][y]
        if validate_position(map, x - 1, y)
        else None,
        Direction.EAST: map[x][y + 1]
        if validate_position(map, x, y + 1)
        else None,
        Direction.SOUTH: map[x + 1][y]
        if validate_position(map, x + 1, y)
        else None,
        Direction.WEST: map[x][y - 1]
        if validate_position(map, x, y - 1)
        else None,
    }

    return neighbours


def validate_position(map, x, y):
    return 0 <= x < len(map) and 0 <= y < len(map[0])


# map is a 2D array of BlockType
def print_map(map: np.ndarray[BlockType, np.dtype[np.int8]]) -> None:
    print('+' + '-' * (len(map[0]) * 3) + '+')
    for row in map:
        print('|', end='')
        for block in row:
            print(block_type_to_string[block][0], end='')
        print('|', end='')
        print()
        print('|', end='')
        for block in row:
            print(block_type_to_string[block][1], end='')
        print('|', end='')
        print()
        print('|', end='')
        for block in row:
            print(block_type_to_string[block][2], end='')
        print('|', end='')
        print()
    print('+' + '-' * (len(map[0]) * 3) + '+')


if __name__ == '__main__':
    width = 20
    height = 10
    map = generate_map(width, height)
    if map is not None:
        print_map(map)
````

Here is one of the output. In this algorithm, there are 3 places that brings randomness. First, the starting point of the map. Second, choosing of direction Third, the order of choosing block type.

```txt
+------------------------------------------------------------+
|# ## ## ######## ## ## ## ## ########### ## ## ## ## ## ## #|
|# ##    ##    ##    ## ## ##                ## ##    ##     |
|# ## ##### ## ######## ## ##### ## ##### ##### ## ##########|
|# ## ##### ## ######## ## ##### ## ##### ##### ## ##########|
|#       ## ##          ##       ##                ##    ##  |
|####### ## ## ##### ## ## ## ## ##### ########### ## ## ## #|
|####### ## ## ##### ## ## ## ## ##### ########### ## ## ## #|
|     ## ##    ##       ##    ##             ##          ## #|
|# ## ## ######## ## ############## ## ## ## ## ##### ##### #|
|# ## ## ######## ## ############## ## ## ## ## ##### ##### #|
|  ## ##    ##    ##             ##          ##          ##  |
|#### ## ## ## ## ## ######## ## ########### ##### ##### ####|
|#### ## ## ## ## ## ######## ## ########### ##### ##### ####|
|                       ##             ##       ## ##        |
|####### ######## ## ## ## ## ## ##### ## ## ## ## ## ## ## #|
|####### ######## ## ## ## ## ## ##### ## ## ## ## ## ## ## #|
|  ##    ##    ##    ## ##    ##    ##    ##    ##       ##  |
|# ## ## ## ## ## ##### ## ##### ## #################### ####|
|# ## ## ## ## ## ##### ## ##### ## #################### ####|
|     ## ##       ##    ##       ##    ##                ##  |
|# ## ## ## ## ## ## ########### ## ## ## ##### ## ## ## ## #|
|# ## ## ## ## ## ## ########### ## ## ## ##### ## ## ## ## #|
|  ##       ## ## ##    ##          ##    ##    ##    ## ## #|
|# ## ## ## ## ## ##### ## ## ## ## ## ## ## ## ######## ## #|
|# ## ## ## ## ## ##### ## ## ## ## ## ## ## ## ######## ## #|
|#    ##    ##             ##    ## ##    ## ##             #|
|####### ##### ## ############## ## ######## ##### ## ## ## #|
|####### ##### ## ############## ## ######## ##### ## ## ## #|
|  ##          ##          ##    ##                ##        |
|# ## ##### ##### ## ## ## ## ## ##### ## ##### ##### ## ## #|
+------------------------------------------------------------+
```

## Reference

- [Procedural Generation using Constraint Satisfaction](https://www.youtube.com/watch?v=gKNJKce1p8M&list=WL&index=8)
