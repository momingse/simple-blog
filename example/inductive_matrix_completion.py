import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split

# Generate synthetic data for user and item features
# User features (e.g., age, income)
user_features = np.array([[25, 30000],
                          [30, 40000],
                          [35, 50000],
                          [40, 60000],
                          [45, 70000]])

# Item features (e.g., category, price)
item_features = np.array([[0, 10],
                          [1, 20],
                          [0, 15],
                          [1, 25],
                          [0, 30]])

# Ratings matrix with some missing values (NaN represents missing entries)
ratings = np.array([[5, np.nan, 3, 4, np.nan],
                    [4, 3, np.nan, 2, 5],
                    [np.nan, 5, 4, np.nan, 3],
                    [1, np.nan, 4, 3, np.nan],
                    [2, 1, np.nan, np.nan, 4]])

# Create a DataFrame to handle missing values easily
df = pd.DataFrame(columns=['user_id', 'rating'])
for i in range(len(ratings)):
    df.loc[i] = [i, ratings[i]]
print(df)

# Merge user and item features with ratings
df['user_feature'] = df['user_id'].apply(lambda x: user_features[x])
df['item_feature'] = df['item_id'].apply(lambda x: item_features[x])
df['combined_features'] = df.apply(lambda x: np.concatenate([x['user_feature'], x['item_feature']]), axis=1)

# Prepare features and labels (only use non-missing ratings)
df = df.dropna()
X = np.array(list(df['combined_features']))
y = df['rating'].values

# Convert data to PyTorch tensors
X_tensor = torch.tensor(X, dtype=torch.float32)
y_tensor = torch.tensor(y, dtype=torch.float32)

# Split the dataset into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X_tensor, y_tensor, test_size=0.2, random_state=42)

# Define the neural network model
class MatrixCompletionModel(nn.Module):
    def __init__(self, user_features_size, item_features_size):
        super(MatrixCompletionModel, self).__init__()
        self.user_features_size = user_features_size
        self.M = nn.Parameter(torch.rand((user_features_size, item_features_size)))  # Learnable matrix M

    def forward(self, x):
        user_features = x[:, :self.user_features_size]
        item_features = x[:, self.user_features_size:]
        y = torch.matmul(user_features, self.M)  # Multiply user features with M
        y = torch.matmul(y, item_features.T)  # Then dot product with item features

        y = torch.sigmoid(y) * 5
        return y

# Initialize the model, loss function, and optimizer
model = MatrixCompletionModel(df['user_feature'][0].shape[0], df['item_feature'][0].shape[0])
criterion = nn.MSELoss()  # Mean Squared Error Loss
optimizer = optim.Adam(model.parameters(), lr=0.01)

# Train the model
num_epochs = 1000
for epoch in range(num_epochs):
    model.train()
    optimizer.zero_grad()  # Clear gradients

    # Forward pass
    predictions = model(X_train)

    # Calculate loss
    loss = criterion(predictions.squeeze(), y_train)

    # Backward pass and optimization
    loss.backward()
    optimizer.step()

    # Print loss every 100 epochs
    if (epoch + 1) % 100 == 0:
        print(f'Epoch [{epoch + 1}/{num_epochs}], Loss: {loss.item():.4f}')

# Evaluate the model on the test set
model.eval()
with torch.no_grad():
    test_predictions = model(X_test).squeeze()
    test_loss = criterion(test_predictions, y_test)
    print(f'Test Loss: {test_loss.item():.4f}')
    for i in range(len(test_predictions)):
      print(X_test[i])
      print(test_predictions[i])

