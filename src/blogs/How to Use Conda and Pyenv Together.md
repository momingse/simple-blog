# Using conda and pyenv together

---

date: 12/02/2024
topics: python conda pyenv

---

## pyenv

### **Installation**

```bash
$ brew install pyenv
```

### **Initialization**

- add the following to your `~/.bash_profile` or `~/.zshrc` file

  ```bash
  # pyenv
  export PYENV_ROOT="$HOME/.pyenv"
  export PATH="$PYENV_ROOT/bin:$PATH"
  eval "$(pyenv init -)"
  ```

### **Usage**

- list all available versions

  ```bash
  $ pyenv install --list # list all available versions
  ```

- install a specific version

  ```bash
  $ pyenv install 3.6.0
  ```

- set a global version

  ```bash
  $ pyenv global 3.6.0
  ```

- set a local version

  ```bash
  $ pyenv local 3.6.0
  ```

  > This will create a `.python-version` file in the current directory.

## conda

### **Installation**

- download the installer from [here](https://www.anaconda.com/download/#macos)

### **Initialization**

- add the following to your `~/.bash_profile` or `~/.zshrc` file

  ```bash
  # conda
  export PATH="/Users/username/anaconda3/bin:$PATH"
  ```

- then run

  ```bash
  $ source ~/.bash_profile # or ~/.zshrc
  ```

- run init
  ```bash
  $ conda init # or conda init zsh
  ```

### **Usage**

- create a new environment

  ```bash
  $ conda create --name myenv
  ```

- activate an environment

  ```bash
  $ conda activate myenv
  ```

- deactivate an environment

  ```bash
  $ conda deactivate
  ```
