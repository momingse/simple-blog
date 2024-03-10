def solver(puzzle, max_level):
    state = []
    def dfs(puzzle, level):
        if puzzle in state:
            return False
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