def agent_move(state, player):
    best_score = -float("inf")
    best_move = None
    for i in range(3):
        for j in range(3):
            if state[i][j] == "":
                state[i][j] = player
                score = minimax(state, 0, False, player)
                state[i][j] = ""
                if score > best_score:
                    best_score = score
                    best_move = (i, j)
    return best_move


def minimax(state, depth, is_maximizing, player):
    if is_win(state, "X" if player == "O" else "O"):
        return -1
    if is_win(state, player):
        return 1
    if is_end(state):
        return 0

    if is_maximizing:
        best_score = -float("inf")
        for i in range(3):
            for j in range(3):
                if state[i][j] == "":
                    state[i][j] = player
                    score = minimax(state, depth + 1, False, player)
                    state[i][j] = ""
                    best_score = max(score, best_score)
        return best_score
    else:
        best_score = float("inf")
        for i in range(3):
            for j in range(3):
                if state[i][j] == "":
                    state[i][j] = "O" if player == "X" else "X"
                    score = minimax(state, depth + 1, True, player)
                    state[i][j] = ""
                    best_score = min(score, best_score)
        return best_score


def is_win(state, player):
    if state[0][0] == state[0][1] == state[0][2] == player:
        return True
    if state[1][0] == state[1][1] == state[1][2] == player:
        return True
    if state[2][0] == state[2][1] == state[2][2] == player:
        return True
    if state[0][0] == state[1][0] == state[2][0] == player:
        return True
    if state[0][1] == state[1][1] == state[2][1] == player:
        return True
    if state[0][2] == state[1][2] == state[2][2] == player:
        return True
    if state[0][0] == state[1][1] == state[2][2] == player:
        return True
    if state[0][2] == state[1][1] == state[2][0] == player:
        return True
    return False


def is_end(state):
    for row in state:
        for cell in row:
            if cell == "":
                return False
    return True


if __name__ == "__main__":
    board = [["", "", ""], ["", "", ""], ["", "", ""]]
    print("Initial state:")
    for row in board:
        print(row)

    current_player = "X"
    while True:
        if current_player == "X":
            x, y = map(
                int, input(f"Player {current_player} move (row column): ").split()
            )
        else:
            x, y = agent_move(board, current_player)

        if board[x][y] != "":
            print("Invalid move")
            continue
        board[x][y] = current_player
        print(f"Player {current_player} moved")
        for row in board:
            print(row)

        if is_win(board, current_player):
            print(f"Player {current_player} won!")
            break

        if is_end(board):
            print("Tie!")
            break

        current_player = "O" if current_player == "X" else "X"
