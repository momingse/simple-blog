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