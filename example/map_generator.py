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
    valid_neighbour = (
        (neighbour[:, 0] >= 0)
        & (neighbour[:, 0] < map.shape[0])
        & (neighbour[:, 1] >= 0)
        & (neighbour[:, 1] < map.shape[1])
    )
    neighbour = neighbour[valid_neighbour]

    return neighbour


if __name__ == '__main__':
    width = 100
    height = 50
    map = generator(width, height, 100, len(BlockType))
    print_map(map)
