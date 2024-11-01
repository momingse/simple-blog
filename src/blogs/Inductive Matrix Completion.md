# IMC (Inductive Matrix Completion)

---

date: 24/10/2024
topics: python machine_learning

---

## Background

Recently, I needed to work on a project involving IGMC (Inductive Graph-based Matrix Completion) to develop a recommendation system. But first, I need to understand what IMC (Inductive Matrix Completion) is.


## Recommendation System

The scenario involves a list of products, like movies or food, and a list of users. The task is to predict which product should be recommended to a user. A common approach is to reference the ratings given by each user. However, there are various ways to extract the "features" of this rating pattern, and one of them is IMC.


Image we have something like:
| user_id | item_id | rating |
|---------|---------|--------|
| 0       | 0       | 5      |
| 1       | 0       | 4      |
| 1       | 1       | 3      |
| 2       | 1       | 5      |

We want to predict which item_id should be recommended to each user_id, which is equivalent to predicting all the ratings a user may give to all items and then outputting the item with the highest rating.


## IMC

we want to achieve something like this $r_{ij} = x^{T}_{i}My_{j}$. Where i refer to $user_i$ and j refer to $item_j$. Here we want train a matrix M to learn the feature pattern. (Reference explaintion from [INDUCTIVE MATRIX COMPLETION BASED ON GRAPH  NEURAL NETWORKS](https://arxiv.org/abs/1904.12058))


## Example

Here is an example for IMC

Image now the table is like:
| user_id | item_id | rating |
|---------|---------|--------|
| 0       | 0       | 5      |
| 0       | 2       | 3      |
| 0       | 3       | 4      |
| 1       | 0       | 4      |
| 1       | 1       | 3      |
| 1       | 3       | 2      |
| 1       | 4       | 5      |
| 2       | 1       | 5      |
| 2       | 2       | 4      |
| 2       | 4       | 3      |
| 3       | 0       | 1      |
| 3       | 2       | 4      |
| 3       | 3       | 3      |
| 4       | 0       | 2      |
| 4       | 1       | 1      |
| 4       | 4       | 4      |


### Import library

We will use sklearn to prepare the data and torch to train the matrix M

```py
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

```


### Prepare the data

We will do some data cleaning like standardize the data and normalizate the data.

```py
# Prepare the data
user_features = np.array([[25, 30000],
                         [30, 40000],
                         [35, 50000],
                         [40, 60000],
                         [45, 70000]])

item_features = np.array([[0, 10],
                         [1, 20],
                         [0, 15],
                         [1, 25],
                         [0, 30]])

ratings = np.array([[5, np.nan, 3, 4, np.nan],
                   [4, 3, np.nan, 2, 5],
                   [np.nan, 5, 4, np.nan, 3],
                   [1, np.nan, 4, 3, np.nan],
                   [2, 1, np.nan, np.nan, 4]])

# Normalize features
user_scaler = StandardScaler()
item_scaler = StandardScaler()
user_features_normalized = user_scaler.fit_transform(user_features)
item_features_normalized = item_scaler.fit_transform(item_features)

# Create DataFrame and prepare data
df = pd.DataFrame(ratings)
df = df.stack().reset_index()
df.columns = ['user_id', 'item_id', 'rating']

# Merge normalized features
df['user_feature'] = df['user_id'].apply(lambda x: user_features_normalized[x])
df['item_feature'] = df['item_id'].apply(lambda x: item_features_normalized[x])
df['combined_features'] = df.apply(lambda x: np.concatenate([x['user_feature'], x['item_feature']]), axis=1)

# Prepare features and labels
df = df.dropna()
X = np.array(list(df['combined_features']))
y = (df['rating'].values - 1) / 4  # Normalize ratings to [0, 1]

# Convert to tensors
X_tensor = torch.tensor(X, dtype=torch.float32)
y_tensor = torch.tensor(y, dtype=torch.float32)

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X_tensor, y_tensor, test_size=0.2, random_state=42)
```

### Define the model

Define the model to achieve the $x * M * y$ equation


```py
class SimplifiedIMC(nn.Module):
    def __init__(self, user_features_size, item_features_size):
        super(SimplifiedIMC, self).__init__()
        self.user_features_size = user_features_size
        
        # Initialize M with careful scaling
        scale = np.sqrt(2.0 / (user_features_size + item_features_size))
        self.M = nn.Parameter(torch.randn(user_features_size, item_features_size) * scale)
        
        # Bias terms for better fitting
        self.user_bias = nn.Parameter(torch.zeros(user_features_size))
        self.item_bias = nn.Parameter(torch.zeros(item_features_size))

    def forward(self, x):
        # Split features
        user_features = x[:, :self.user_features_size]
        item_features = x[:, self.user_features_size:]
        
        # Add bias terms
        user_features = user_features + self.user_bias
        item_features = item_features + self.item_bias
        
        # Core IMC computation: x * M * y
        intermediate = torch.matmul(user_features, self.M)
        output = torch.sum(intermediate * item_features, dim=1)
        
        # Bound the output with sigmoid and add small epsilon for numerical stability
        output = torch.sigmoid(output)
        output = torch.clamp(output, min=1e-6, max=1-1e-6)
        
        return output

```

### Define the loss

Here we will use `RegularizedMSELoss` which is a combination of `MSELoss` and `L1Loss`

```py

# Custom loss function combining MSE with regularization
class RegularizedMSELoss(nn.Module):
    def __init__(self, lambda_reg=0.01):
        super(RegularizedMSELoss, self).__init__()
        self.lambda_reg = lambda_reg
        self.mse = nn.MSELoss()

    def forward(self, pred, target, model):
        mse_loss = self.mse(pred, target)
        reg_loss = self.lambda_reg * (torch.norm(model.M) + 
                                    torch.norm(model.user_bias) + 
                                    torch.norm(model.item_bias))
        return mse_loss + reg_loss

```

### Initialize model, loss, and optimizer

```py
model = SimplifiedIMC(
    user_features_size=user_features_normalized.shape[1],
    item_features_size=item_features_normalized.shape[1]
)

criterion = RegularizedMSELoss(lambda_reg=0.01)
optimizer = optim.Adam(model.parameters(), lr=0.005)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=50, verbose=True)

```

### Training 

```py

# Training loop with early stopping
num_epochs = 2000
best_loss = float('inf')
patience = 100
patience_counter = 0
best_model_state = None

for epoch in range(num_epochs):
    model.train()
    optimizer.zero_grad()
    
    # Forward pass
    predictions = model(X_train)
    loss = criterion(predictions, y_train, model)
    
    # Backward pass
    loss.backward()
    
    # Gradient clipping
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    
    optimizer.step()
    scheduler.step(loss)
    
    # Early stopping check
    if loss.item() < best_loss:
        best_loss = loss.item()
        patience_counter = 0
        best_model_state = model.state_dict().copy()
    else:
        patience_counter += 1
        
    if patience_counter >= patience:
        print(f'Early stopping at epoch {epoch + 1}')
        break
        
    if (epoch + 1) % 100 == 0:
        print(f'Epoch [{epoch + 1}/{num_epochs}], Loss: {loss.item():.4f}')

```

### Evaluate

```py

# Load best model
if best_model_state is not None:
    model.load_state_dict(best_model_state)

def evaluate_model(model, X_test, y_test):
    model.eval()
    with torch.no_grad():
        test_predictions = model(X_test)
        # Convert predictions back to 1-5 scale
        test_predictions = test_predictions * 4 + 1
        y_test_original = y_test * 4 + 1
        
        # Calculate metrics
        mse = nn.MSELoss()(test_predictions, y_test_original)
        rmse = torch.sqrt(mse)
        mae = torch.mean(torch.abs(test_predictions - y_test_original))
        
        print(f'\nTest Metrics:')
        print(f'MSE: {mse.item():.4f}')
        print(f'RMSE: {rmse.item():.4f}')
        print(f'MAE: {mae.item():.4f}')
        
        print("\nPredictions vs Actual Ratings:")
        for i in range(len(test_predictions)):
            print(f"Predicted: {test_predictions[i].item():.2f}, Actual: {y_test_original[i].item():.2f}")

        # Calculate correlation
        predictions_np = test_predictions.numpy()
        actuals_np = y_test_original.numpy()
        correlation = np.corrcoef(predictions_np, actuals_np)[0, 1]
        print(f'\nPearson Correlation: {correlation:.4f}')

# Evaluate the model
evaluate_model(model, X_test, y_test)

```

### Output

We can see the result below kinda match the actucal rating in ratio but it is not very accurate. Since it only have few data and the data is generate by gpt so it is difficult to find the pattern. Still it is so simple so it require high quality data (with obvious pattern) to achieve accurate prediction.

```txt
Epoch [100/2000], Loss: 0.0902
Epoch [200/2000], Loss: 0.0893
Epoch [300/2000], Loss: 0.0893
Epoch [400/2000], Loss: 0.0893
Epoch [500/2000], Loss: 0.0893
Epoch [600/2000], Loss: 0.0893
Early stopping at epoch 614

Test Metrics:
MSE: 1.1737
RMSE: 1.0834
MAE: 1.0443

Predictions vs Actual Ratings:
Predicted: 3.93, Actual: 5.00
Predicted: 3.60, Actual: 3.00
Predicted: 3.11, Actual: 2.00
Predicted: 2.40, Actual: 1.00

Pearson Correlation: 0.9426
```

## Reference

- [INDUCTIVE MATRIX COMPLETION BASED ON GRAPH  NEURAL NETWORKS](https://arxiv.org/abs/1904.12058)

