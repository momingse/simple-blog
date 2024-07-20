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
    # start near the center
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
