# Optimizer in Machine Learning

---

date: 14/05/2025
topics: python machine_learning

---

## Background

Currently, most project I worked on used default optimizer or just blindly use `Adam`. I thought it is complex to understand what optimizer is doing and how it works. After course from hkust(which copy from Standford CS231n), I found it is simple and can write a blog to discuss about it during study my final.

## Optimizer

What optimizer need to do is to find the best parameter in order to minimize the loss. In another word gradients , optimizer update the parameters. 

We may start with a simple example of 2D function: $x^2 + y^2 + 2xy + x + y$. The minimum of this function is at (-0.5, 0) and the value is -0.25. And check how each optimizer works to find the minimum.

```py
def quadratic(x, y):
    return x**2 + 2*y**2 + 2*x*y + x + y

# Gradient of the quadratic function
def gradient(x, y):
    df_dx = 2*x + 2*y + 1  # Partial derivative with respect to x
    df_dy = 4*y + 2*x + 1  # Partial derivative with respect to y
    return np.array([df_dx, df_dy])
```

### Gradient Descent

Consider you have gradient of the loss function in current point, you can update the parameter by moving in the opposite direction of the gradient by some step size. Here step size is called learning rate. That's how gradient descent works. And we can control the batch size to control the noise of the gradient so we can have mini-batch gradient descent, full-batch gradient descent and stochastic gradient descent(SGD).

Here is the equation of gradient descent:

$$
x_{t+1} = x_t - \eta \nabla f(x_t)
$$

where $\eta$ is the learning rate and $\nabla f(x_t)$ is the gradient of the function at point $x_t$.

```py
def mini_batch_gd(x, y, learning_rate=0.1, batch_size=64, max_epochs=2000, tolerance=1e-4):
    history = [(x, y, quadratic(x, y))]
    
    for epoch in range(max_epochs):
        grads = []
        for _ in range(batch_size):
            # Simulate noise in gradient by perturbing x, y slightly
            dx, dy = np.random.normal(0, 0.2, 2)
            grads.append(gradient(x + dx, y + dy))
        
        avg_grad = np.mean(grads, axis=0)
        x_new = x - learning_rate * avg_grad[0]
        y_new = y - learning_rate * avg_grad[1]

        if np.sqrt((x_new - x)**2 + (y_new - y)**2) < tolerance:
            break

        x, y = x_new, y_new
        history.append((x, y, quadratic(x, y)))
    
    return x, y, quadratic(x, y), epoch + 1, history
```

```txt
Minimum found at: x = -0.4964, y = -0.0225
Minimum function value: -0.2491
Epochs needed: 79
```

![img](../../public/blog/Optimizer%20in%20Machine%20Learning/image.png)

### Nesterov Momentum

What if we want to speed up the convergence? We can use momentum. The idea is to keep track of the previous gradients and use them to update the parameters. We will speed up when the gradient is consistent and slow down when the gradient is oscillating. 

The equation of momentum is:

$$
v_{t+1} = \beta v_t + (1 - \beta) \nabla f(x_t) \\
x_{t+1} = x_t - \eta v_{t+1}
$$

where $v_t$ is the velocity at time $t$ and $\beta$ is the momentum coefficient. 

We may add a lookahead term to the momentum. The idea is to use the momentum to predict where the next point will be and then calculate the gradient at that point. This is called Nesterov momentum.

The equation of Nesterov momentum is:

$$
v_{t+1} = \beta v_t + (1 - \beta) \nabla f(x_t + \beta v_t) \\
x_{t+1} = x_t - \eta v_{t+1}
$$

where $v_t$ is the velocity at time $t$ and $\beta$ is the momentum coefficient. 

```py
def nesterov_monentum(x, y, learning_rate=0.1, max_epochs=2000, tolerance=1e-4, rho=0.9):
    # Random initial point
    history = [(x, y, quadratic(x, y))]
    vx = np.array([0, 0])
    for epoch in range(max_epochs):
        grad = gradient(x + rho * vx[0], y + rho * vx[1])

        vx = rho * vx - learning_rate * grad
        # Update parameters
        x_new = x + vx[0]
        y_new = y + vx[1]
          
          # Check for convergence
        if np.sqrt((x_new - x)**2 + (y_new - y)**2) < tolerance:
            break
              
        x, y = x_new, y_new
        history.append((x, y, quadratic(x, y)))
    
    return x, y, quadratic(x, y), epoch + 1, history
```

```txt
Minimum found at: x = -0.5028, y = 0.0018
Minimum function value: -0.2500
Epochs needed: 80
```

![img](../../public/blog/Optimizer%20in%20Machine%20Learning/image-1.png)

The point get closer to the minimum faster then sgd. But due to the momentum, it may overshoot the minimum and oscillate around the minimum.

### Adam

Can we enlarge the step size when the gradient is small and reduce the step size when the gradient is large? Yes, we can. We track the sum of the squares of the gradients and use it to scale the learning rate. This is how AdaGrad works.

The equation of AdaGrad is:

$$
v_{t+1} = v_t + \nabla f(x_t)^2 \\
x_{t+1} = x_t - \frac{\eta}{\sqrt{v_{t+1}}} \nabla f(x_t)
$$

where $v_t$ is the sum of the squares of the gradients at time $t$.

And as the final optimizer in this blog, we want to combine all the ideas including momentum and AdaGrad. This is how Adam works.

The equation of Adam is:

$$
m_{t+1} = \beta_1 m_t + (1 - \beta_1) \nabla f(x_t) \\
v_{t+1} = \beta_2 v_t + (1 - \beta_2) \nabla f(x_t)^2 \\
\hat{m}_{t+1} = \frac{m_{t+1}}{1 - \beta_1^{t+1}} \\
\hat{v}_{t+1} = \frac{v_{t+1}}{1 - \beta_2^{t+1}} \\
x_{t+1} = x_t - \frac{\eta}{\sqrt{\hat{v}_{t+1}}} \hat{m}_{t+1}
$$

where $m_t$ is the momentum at time $t$ and $v_t$ is the sum of the squares of the gradients at time $t$. $\beta_1$ and $\beta_2$ are the momentum coefficients. 

```py
def Adam(x, y, learning_rate=0.1, max_epochs=2000, tolerance=1e-4):
    # Random initial point
    history = [(x, y, quadratic(x, y))]
    epsilon = 1e-7  # Small constant to avoid division by zero

    first_moment = np.array([0.0, 0.0])
    second_moment = np.array([0.0, 0.0])

    beta1 = 0.9
    beta2 = 0.999
    epsilon = 1e-7
    
    for epoch in range(1, max_epochs + 1):
        dx = gradient(x, y)

        first_moment = beta1 * first_moment + (1 - beta1) * dx
        second_moment = beta2 * second_moment + (1 - beta2) * dx * dx

        first_unbias = first_moment / (1 - beta1 ** epoch)
        second_unbias = second_moment / (1 - beta2 ** epoch) 
        
        # Update parameters
        x_new, y_new = np.array([x, y]) - learning_rate * first_unbias / (np.sqrt(second_unbias) + epsilon)
          
        # Check for convergence
        if np.sqrt((x_new - x)**2 + (y_new - y)**2) < tolerance:
            break
              
        x, y = x_new, y_new
        history.append((x, y, quadratic(x, y)))
    
    return x, y, quadratic(x, y), epoch, history
```

```txt
Minimum found at: x = -0.4914, y = -0.0079
Minimum function value: -0.2499
Epochs needed: 124
```
![img](../../public/blog/Optimizer%20in%20Machine%20Learning/image-2.png)

It is a bit slower then SGD and Nesterov momentum in this case. But first SGD is count on the batch size. So if we use a small batch size, it will be slower. Second, Adam is more robust to the learning rate and the batch size. So in most cases, Adam is the best choice. But for some cases, SGD and Nesterov momentum may be better after tuning the learning rate and the batch size.

## Reference

- [[機器學習ML NOTE]SGD, Momentum, AdaGrad, Adam Optimizer](https://medium.com/%E9%9B%9E%E9%9B%9E%E8%88%87%E5%85%94%E5%85%94%E7%9A%84%E5%B7%A5%E7%A8%8B%E4%B8%96%E7%95%8C/%E6%A9%9F%E5%99%A8%E5%AD%B8%E7%BF%92ml-note-sgd-momentum-adagrad-adam-optimizer-f20568c968db)
- Course Material of COMP 4711 from HKUST



