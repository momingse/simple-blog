import numpy as np


def gsac(dataset, name=[], target_name="target"):
    # deal with exception
    if len(dataset) == 0:
        raise ValueError("The dataset should not be empty")
    if len(dataset[0]) != len(name) + 1:
        raise ValueError("The dataset and the name should have the same length")

    X = np.array(dataset)[:, :-1]
    y = np.array(dataset)[:, -1]
    # init r = {}
    rules = []

    while len(X) > 0:
        # init r_i = {}
        selected_feature = [False for _ in range(X.shape[1])]
        while True:
            best_feature = None
            best_r = 0
            # loop through all features to find the best feature
            for feature in range(X.shape[1]):
                # exclude the feature that has been selected
                if selected_feature[feature]:
                    continue

                # create a new rule with the selected feature
                temp_selected_feature = selected_feature.copy()
                temp_selected_feature[feature] = True

                # if the rule is not able to cover any positive sample, skip
                if (
                    sum(y[np.all(X[:, temp_selected_feature] == 1, axis=1)])
                    == 0
                ):
                    continue
                # calculate the r value of the rule, r = number of positive sample under the rule / number of sample under the rule
                r = y[
                    np.all(X[:, temp_selected_feature] == 1, axis=1)
                ].sum() / len(
                    y[np.all(X[:, temp_selected_feature] == 1, axis=1)]
                )
                # update the best feature
                if r > best_r:
                    best_r = r
                    best_feature = feature

            # add the best feature to the selected feature
            selected_feature[best_feature] = True

            # if the rule is able to cover all positive samples, break
            selected_only_positive = y[
                np.all(X[:, selected_feature] == 1, axis=1)
            ].sum() == len(y[np.all(X[:, selected_feature] == 1, axis=1)])
            if selected_only_positive:
                break

        # add the rule to the rules
        rules.append(selected_feature)
        # remove the samples that are covered by the rule
        X, y = (
            X[~np.all(X[:, selected_feature] == 1, axis=1)],
            y[~np.all(X[:, selected_feature] == 1, axis=1)],
        )

        # if there is no positive sample left, break
        if sum(y) == 0:
            break

    for rule in rules:
        output = []
        for i in range(len(rule)):
            if rule[i]:
                output.append(name[i] if name else str(i))
        print(" AND ".join(output) + " => " + target_name)


if __name__ == '__main__':
    example1 = [
        [1, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 0, 1, 1],
        [0, 1, 1, 1, 1],
        [0, 1, 1, 0, 0],
        [1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1],
        [1, 0, 1, 0, 0],
        [1, 1, 0, 0, 0],
    ]
    gsac(example1, ["APP", "RATING", "INC", "BAL"], "OK")

    example2 = [
        [1, 0, 1, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 1, 1],
        [1, 1, 0, 0, 1, 0, 1],
        [1, 0, 0, 1, 1, 1, 1],
        [1, 0, 0, 1, 1, 0, 0],
        [1, 0, 1, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
    ]
    gsac(example2, ["GPA", "UST", "HKU", "CU", "REC", "EXP"], "Hire")
