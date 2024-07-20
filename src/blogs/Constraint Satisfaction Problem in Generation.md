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

### Map Generation

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

### Maze Generation

- Variable: 2D maze
- Domain: Wall or path
- Constraint: there should be at least one path from start to end and all path should be connected

```py
import numpy as np
import random


class BlockType:
    PATH = 0
    WALL = 1
    START = 2
    END = 3


def generator(width, height, max_iter, start, end):
    maze, init_path_x, init_path_y = init_maze(width, height)
    maze[start] = BlockType.START
    maze[end] = BlockType.END
    possible_path = get_neighbour(width, height, init_path_x, init_path_y)
    possible_path = [
        (x, y) for x, y in possible_path if maze[x, y] == BlockType.WALL
    ]

    for _ in range(max_iter):
        if not possible_path:
            break
        best_path = None
        min_conflict = np.inf
        for _ in range(len(possible_path)):
            x, y = random.choice(possible_path)
            maze[x, y] = BlockType.PATH
            conflict = conflict_calucator(maze, x, y, start, end)
            if conflict < min_conflict:
                best_path, min_conflict = (x, y), conflict
            maze[x, y] = BlockType.WALL

        if best_path is not None:
            x, y = best_path
            maze[x, y] = BlockType.PATH
            neighbour = get_neighbour(width, height, x, y)
            neighbour = [
                (nx, ny)
                for nx, ny in neighbour
                if maze[nx, ny] == BlockType.WALL
                and (nx, ny) not in possible_path
            ]
            possible_path.remove(best_path)
            possible_path.extend(neighbour)

    return maze


def conflict_calucator(maze, x, y, start, end):
    conflict = 0
    # check if there is no path from start to end
    conflict += 0 if solve_maze(maze, start, end) else 1

    # check 3 x 3 block if there are more than 3 PATH
    next_to_wall = (
        x == 0 or x == maze.shape[0] - 1 or y == 0 or y == maze.shape[1] - 1
    )
    grid = maze[
        max(0, x - 1) : min(maze.shape[0], x + 2),
        max(0, y - 1) : min(maze.shape[1], y + 2),
    ]
    conflict += np.sum(grid == BlockType.PATH) > 4 - next_to_wall

    # check if neighbour is alone WALL
    neighbour = get_neighbour(maze.shape[1], maze.shape[0], x, y)
    hv_alone = False
    for nx, ny in neighbour:
        if (
            maze[nx, ny] == BlockType.WALL
            and np.sum(
                get_neighbour(maze.shape[1], maze.shape[0], nx, ny)
                == BlockType.WALL
            )
            == 0
        ):
            hv_alone = True
            break
    conflict += 1 if hv_alone else 0

    # if neighbour more PATH than WALL
    conflict += np.sum(grid == BlockType.PATH) + 1 > np.sum(grid == BlockType.WALL)

    return conflict


def solve_maze(maze, start, end):
    path = [start]
    height, width = maze.shape
    visited = np.zeros((height, width), dtype=bool)
    visited[start] = True

    while path:
        if end in path:
            return True
        temp_path = []
        for x, y in path:
            for nx, ny in get_neighbour(width, height, x, y):
                if (
                    maze[nx, ny] == BlockType.PATH
                    or maze[nx, ny] == BlockType.END
                ) and not visited[nx, ny]:
                    visited[nx, ny] = True
                    temp_path.append((nx, ny))
        path = temp_path
    return False


def get_neighbour(width, height, x, y):
    directions = np.array([(0, 1), (0, -1), (1, 0), (-1, 0)])
    neighbour = directions + np.array([x, y])
    valid_neighbour = (
        (neighbour[:, 0] >= 0)
        & (neighbour[:, 0] < height)
        & (neighbour[:, 1] >= 0)
        & (neighbour[:, 1] < width)
    )
    return [tuple(n) for n in neighbour[valid_neighbour]]


def init_maze(width, height):
    maze = np.full((height, width), BlockType.WALL)
    init_path_x, init_path_y = height // 2, width // 2
    maze[init_path_x, init_path_y] = BlockType.PATH
    return maze, init_path_x, init_path_y


def print_maze(maze):
    block2emoji = {
        BlockType.WALL: '🟫',
        BlockType.PATH: '🟩',
        BlockType.START: '🟦',
        BlockType.END: '🟥',
    }

    for x in range(maze.shape[0]):
        print(''.join([block2emoji[maze[x, y]] for y in range(maze.shape[1])]))


if __name__ == '__main__':
    width, height = 20, 20
    start = (0, 0)
    end = (width - 1, height - 1)
    maze = generator(width, height, 220, start, end)
    print_maze(maze)
```

You can bring randomness by adding random initial start or diff constraint. And all of those will affect the result. However, it is required lots of computation to find the solution so sometimes using other searching algorithm is suggested.


## Reference

- [Procedural Generation using Constraint Satisfaction](https://www.youtube.com/watch?v=gKNJKce1p8M&list=WL&index=8)
