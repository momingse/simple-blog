# Algorithm of Searching Agents

---

date: 10/03/2024
topics: search algorithm ai

---

## BFS and DFS

Consider The Eight Puzzle Problem, where we have a 3x3 grid with 8 tiles and one empty space. The goal is to reach the goal state from the initial state by moving the tiles.

Initially, we have the following state:

```md
2 8 3
1 6 4
7 _ 5
```

The goal state is:

```md
1 2 3
8 _ 4
7 6 5
```

### DFS

Since the state tree can be very large, we need a bound to limit the depth of searching.

```python
def solver(puzzle, max_level):
    state = []
    def dfs(puzzle, level):
        # Check if the puzzle is already visited
        if puzzle in state:
            return False
        # Check if the level exceeds the maximum level
        if level > max_level:
            return False

        state.append(puzzle)

        print("Level: ", level)
        for row in puzzle:
            print(row)
        print()

        # Check if goal state is found
        if puzzle == [[1, 2, 3], [8, 0, 4], [7, 6, 5]]:
            print("Goal state found!")
            return True

        # Find the position of the empty tile
        for i in range(3):
            for j in range(3):
                if puzzle[i][j] == 0:
                    x, y = i, j
                    break

        # iterate over all possible next states
        move = [[0, 1], [1, 0], [0, -1], [-1, 0]]
        for m in move:
            x_, y_ = x + m[0], y + m[1]
            if 0 <= x_ < 3 and 0 <= y_ < 3:
                new_puzzle = [row[:] for row in puzzle]
                new_puzzle[x][y], new_puzzle[x_][y_] = new_puzzle[x_][y_], new_puzzle[x][y]
                if dfs(new_puzzle, level + 1):
                    return True

        return False

    return dfs(puzzle, 0)

if __name__ == "__main__":
    init = [[2, 8, 3], [1, 6, 4], [7, 0, 5]]
    solver(init, 6)
```

### Iterative Deepening Search

This is a combination of BFS and DFS. It starts with a small depth and increases the depth in each iteration which solve the memory problem of BFS

```python
def solver(init):
    been_state = []
    queue = [init]
    level = 0

    while True:
        newQueue = []
        for prev_state in queue:
            # Check if have been in this state
            if prev_state in been_state:
                continue
            been_state.append(prev_state)

            print("Level: ", level)
            for row in prev_state:
                print(row)
            print()

            # Check if goal state is found
            if prev_state == [[1, 2, 3], [8, 0, 4], [7, 6, 5]]:
                print("Goal state found!")
                return True

            # Find the position of the empty tile
            for i in range(3):
                for j in range(3):
                    if prev_state[i][j] == 0:
                        x, y = i, j
                        break
            # iterate over all possible next states
            move = [[0, 1], [1, 0], [0, -1], [-1, 0]]
            for m in move:
                x_, y_ = x + m[0], y + m[1]
                if 0 <= x_ < 3 and 0 <= y_ < 3:
                    new_state = [row[:] for row in prev_state]
                    new_state[x][y], new_state[x_][y_] = new_state[x_][y_], new_state[x][y]
                    newQueue.append(new_state)
        level += 1
        queue = newQueue

if __name__ == "__main__":
    init = [[2, 8, 3], [1, 6, 4], [7, 0, 5]]
    solver(init)
```

## Heuristic Search

For the same problem, we can use heuristic search, which heuristic function measures the distance between the current state and the goal state. we let `f(n) = number of tiles out of place compared to the goal state`. The heuristic function is very important as it determines the *efficiency* of the search algorithm.

### A* Search

```python
import heapq

# Calculate the number of different tiles between the current state and the goal state
def f(state):
    target = [[1, 2, 3], [8, 0, 4], [7, 6, 5]]
    diff = 0
    for i in range(3):
        for j in range(3):
            if state[i][j] != 0 and state[i][j] != target[i][j]:
                diff += 1
    return diff

def solve(init):
    been_state = []
    queue = [(f(init), init)]
    iteration = 0
    
    while queue:
        # Pop the state with the smallest f value
        state = heapq.heappop(queue)[1]
        # Check if have been in this state
        if state in been_state:
            continue
        been_state.append(state)
        
        print("Iteration: ", iteration)
        for row in state:
            print(row)
        print()
        
        if state == [[1, 2, 3], [8, 0, 4], [7, 6, 5]]:
            print("Goal state found!")
            return True
        
        # Find the position of the empty tile
        x, y = 0, 0
        for i in range(3):
            for j in range(3):
                if state[i][j] == 0:
                    x, y = i, j
                    break

        # iterate over all possible next states
        move = [[0, 1], [1, 0], [0, -1], [-1, 0]]
        for m in move:
            x_, y_ = x + m[0], y + m[1]
            if 0 <= x_ < 3 and 0 <= y_ < 3:
                new_state = [row[:] for row in state]
                new_state[x][y], new_state[x_][y_] = new_state[x_][y_], new_state[x][y]
                heapq.heappush(queue, (f(new_state), new_state))
        iteration += 1

if __name__ == "__main__":
    init = [[2, 8, 3], [1, 6, 4], [7, 0, 5]]
    solve(init)
```

### Hill Climbing

Here we consider another problem which is 8 queens problem. The goal is to place 8 queens on an 8x8 chessboard such that no two queens attack each other. We use hill climbing to solve this problem which we want to maximize a function (when the function reaches the maximum value, the problem is solved and no queen attacks each other). The function can be `f(n) = 1/e^d` where `d` is the number of pairs of queens that attack each other. And since hill climbing may get stuck in a local maximum, we can use simulated annealing to solve this problem.

```python
import math
import random


def f(state):
    attrack = 0
    for i in range(len(state)):
        quene = state[i]
        being_attacked = False
        for j in range(len(state)):
            if i == j:
                continue
            other_quene = state[j]
            # check if the queen in the same row
            if quene[0] == other_quene[0]:
                being_attacked = True
            # check if the queen in the same column
            if quene[1] == other_quene[1]:
                being_attacked = True
            # check if the queen in the same diagonal
            if abs(quene[0] - other_quene[0]) == abs(quene[1] - other_quene[1]):
                being_attacked = True
        if being_attacked:
            attrack += 1
    return 1 / math.exp(attrack)


def solve(state, max_iteration=100000):
    iternation = 0
    target_quene = 0
    alpha = 0.99
    temperature = 1000
    while True:
        print(
            "Iteration:",
            iternation,
            "Target quene:",
            target_quene,
            "Value:",
            f(state),
            end=" ",
        )

        # check if the state is the goal state
        if f(state) > 0.99:
            print("Goal state found!")
            # print board
            for i in range(8):
                for j in range(8):
                    if [i, j] in state:
                        print("Q", end=" ")
                    else:
                        print("*", end=" ")
                print()
            return True
        if iternation > max_iteration:
            print("Goal state not found!")
            return False

        # find all possible next states
        possible_next_states = [[i, target_quene] for i in range(8)]

        # find value of possible next states
        possible_next_states_values = [
            f(state[:target_quene] + [pns] + state[target_quene + 1 :])
            for pns in possible_next_states
        ]

        random_move = random.randint(0, len(possible_next_states_values) - 1)
        delta = f(state) - possible_next_states_values[random_move]
        if delta < 0:
            state[target_quene] = possible_next_states[random_move]
            print('rand', end=" ")
        else:
            if random.random() < math.exp(-delta/(temperature)):
                state[target_quene] = possible_next_states[random_move]
                print('rand', end=" ")
        print()

        iternation += 1
        target_quene = (target_quene + 1) % 8
        temperature *= alpha

if __name__ == "__main__":
    initial_state = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]]
    solve(initial_state)
```

## Minimax Algorithm

The minimax algorithm is used in two-player games to find the optimal move for a player. It is based on the assumption that both players play optimally. The algorithm is a recursive algorithm that searches the game tree to find the best move for the current player. There are partial implementation so that the run time is optimized which use alpha-beta pruning.

Here is an example of agents with minimax algorithm playing tic-tac-toe.

```python

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
```

## References

- Course Material of COMP 3211 from HKUST