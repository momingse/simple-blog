import numpy as np

true_probs = [0.1, 0.4, 0.02, 0.18, 0.7]

num_bandits = len(true_probs)
epsilon = 0.1   # 10% of the time we will explore
num_pulls = 1000   # number of times we will pull the arm
total_reward = 0
num_times_pulled = np.zeros(
    len(true_probs)
)   # number of times each arm is pulled
estimated_probs = np.zeros(
    len(true_probs)
)   # estimated probability of each arm

for i in range(num_pulls):
    if np.random.rand() < epsilon:
        chosen_bandit = np.random.choice(num_bandits)
    else:
        chosen_bandit = np.argmax(estimated_probs)

    # simulate pulling
    reward = np.random.rand() < true_probs[chosen_bandit]
    total_reward += reward

    # record
    num_times_pulled[chosen_bandit] += 1
    estimated_probs[chosen_bandit] += (
        reward - estimated_probs[chosen_bandit]
    ) / num_times_pulled[chosen_bandit]

print(f'Estimated probs: {estimated_probs}')
print(f'Total reward: {total_reward}')
print(f'Optimal bandit: {np.argmax(true_probs)}')
print(f'Times each bandit was pulled: {num_times_pulled}')
