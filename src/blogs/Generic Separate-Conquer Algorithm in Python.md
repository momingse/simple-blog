# Generic Separate-Conquer Algorithm in Python

---

date: 20/05/2024
topics: python algorithm

---

## Introduction

GSCA is used to learn propositional rules. From a given set of examples, it generates a set of rules r = {r_1,...,r_n} where r_i = (p_i, c_i) where p_i is a conjunction of literals and c_i is a class label. 

## Algorithm

The algorithm is as follows:

```md
1. let r = {}
2. while there are examples left:
    1. let r_i = {}
    2. repeat until r_i only cover c_i examples:
        1. find one feature that best separates the examples
        2. add feature to r_i
    3. add r_i to r
    4. remove the examples covered by r_i
3. return r
```

## Code

```python
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
    # RATING AND BAL => OK
    # APP AND RATING AND INC => OK

    example2 = [
        [1, 0, 1, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 1, 1],
        [1, 1, 0, 0, 1, 0, 1],
        [1, 0, 0, 1, 1, 1, 1],
        [1, 0, 0, 1, 1, 0, 0],
        [1, 0, 1, 0, 1, 0, 0],
    ]
    gsac(example2, ["GPA", "UST", "EXP", "REC", "HIRE"], "HIRE")
    # GPA AND EXP => Hire
    # UST AND REC => Hire
```

## References

- Course Material of COMP3211 from HKUST
