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
