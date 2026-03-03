---
title: Daily Development Workflows
order: 150
---
# Daily Development Workflows

## About Pants

Since 22.09, we have migrated to [Pants](https://pantsbuild.org/) as our primary build system and dependency manager for the mono-repository of Python components.

Pants is a graph-based async-parallel task executor written in Rust and Python. It is tailored to building programs with explicit and auto-inferred dependency checks and aggressive caching.

### Key concepts

*   The command pattern:

    {% code overflow="wrap" %}
    ```
    $ pants [GLOBAL_OPTS] GOAL [GOAL_OPTS] [TARGET ...]
    ```
    {% endcode %}
* Goal: an action to execute
  * You may think this as the root node of the task graph executed by Pants.
* Target: objectives for the action, usually expressed as `path/to/dir:name`
  * The targets are declared/defined by `path/to/dir/BUILD` files.
* The global configuration is at `pants.toml`.
* Recommended reading: [https://www.pantsbuild.org/docs/concepts](https://www.pantsbuild.org/docs/concepts)
