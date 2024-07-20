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

