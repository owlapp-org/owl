---
sidebar_position: 1
---

# Quick Start
Owl is an open source data query tool with a simple interface and rest API.

- It's currently only tested on Linux but should also work on MacOS
- Make sure you have `python >= 3.12`
- It's recommended to create a `working directory` and configure and boot the application within that
directory.

```sh
# Create the work directory and run the commands
mkdir owl && cd owl

# Create python virtual environment with;
virtualenv --python python3.12 .venv

# Activate the virtual environment
source .venv/bin/activate

# Install with pip
pip install owl

# Initialize with basic settings.
owl init

# Run the application
owl run
```
