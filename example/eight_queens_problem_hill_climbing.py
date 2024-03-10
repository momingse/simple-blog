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
