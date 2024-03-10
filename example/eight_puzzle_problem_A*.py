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