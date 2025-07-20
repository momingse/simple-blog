# Changing the Shell Directory from a CLI Tool  

---

date: 20/07/2025
topics: bash

---

## Background

`cd` is a command that changes the shell directory. When you have multiple project folders in your working directory and are working on them at the same time, you end up running endless `cd` commands, opening tab after tab of new terminals, and feeling lost in a labyrinth of directories. [zoxide](https://github.com/ajeetdsouza/zoxide) is one solution—it uses fuzzy search to help you navigate to where you want to go without typing the full path.

## Zoxide

A simple explanation of how zoxide works: instead of typing `cd ~/dev/projects/my-awesome-frontend-app`, you might simply type `z frontend` and be instantly transported. Its implementation uses fuzzy search to match a relevant path and then changes the directory to it.

### The Child Process Conundrum

A child process (like a script or an external program such as zoxide) cannot directly change the working directory of its parent process (your shell). Even when you run `os.chdir('/path/to/target/directory')`, it only changes the working directory for the child process, not your shell. So how does zoxide deal with this problem?

### Zoxide's Workaround

If zoxide were just an executable, it wouldn’t be able to change your shell’s directory. That’s why you need to put `eval "$(zoxide init bash)"` in your bash profile (in this case, we use bash as the example). What this does is execute (`eval`) the output of `zoxide init bash`, which defines a `z` function in your shell:

```bash
function z() {
    __zoxide_z "$@"
}
```

So when you run `z sth`, you are actually running `__zoxide_z sth`. And inside `__zoxide_z`, if you're using the fuzzy search function, it will run the following:

```bash
result="$(\command zoxide query --exclude "$(__zoxide_pwd)" -- "$@")" &&
    __zoxide_cd "${result}"
```

In the above code, `result` is the output of `zoxide query`, and `__zoxide_cd` is the function that changes the shell directory. Basically, it `cd`s to the result returned by zoxide, using shell functions or aliases to work around the child process conundrum.

## Beyond Zoxide

This trick—using a shell function or alias to wrap a compiled executable—is not limited to directory-jumping tools like zoxide. It can be applied in many scenarios where an external tool needs to interact with the shell state, which is normally off-limits to child processes. For example, `direnv` asks you to include `eval "$(direnv hook bash)"` in your `~/.bashrc`, doing something similar to zoxide.

This approach allows you to interact fully with the shell state by emitting shell commands like `cd`, `export`, or `alias`, and then `eval`-ing them in the parent shell. It gives you the benefits of using a compiled language (performance, safety, advanced logic like fuzzy search) while still controlling the shell.

On the downside, this increases the debugging complexity of your tools, as they must remain aware of shell state. Security considerations also become more critical—any vulnerability or malicious input in the binary could result in injected arbitrary shell commands.
