---
sidebar_position: 1
---

# User Management

Manage application users using **command line interface**.

## Show user management commands

Type the following command to see user management commands.

```bash
owl users --help
```

You should see the following output

```sh title="owl users --help"
Usage: owl users [OPTIONS] COMMAND [ARGS]...

  User management commands

Options:
  --help  Show this message and exit.

Commands:
  create           Create a new user
  delete           Delete a user
  list             List all users
  update           Update a user
  update-password  Update the password of a user
```

## Create user
Type the following to see the usage:
```sh
owl users create --help
```
You should see the following output.

```sh title="owl users create --help"
Usage: owl users create [OPTIONS] EMAIL NAME

  Create a new user

Options:
  --help  Show this message and exit.
```

```sh
owl users create jane.doe@owl.com "Jane Doe"
```
Enter the password for the new user and it's done. The User can then login with email, password
and **can change their password**.


## Delete User
Use user ID or email to delete the user.

```sh
owl users delete jane.doe@owl.com
```

## Show all users
Show the users as list on the command line.

```sh
owl users list
```

## Update user
You can update `email`, `name` and `password` of the user using:

```sh
owl users update jane.doe@owl.com
```
Press enter to use default values and skip.

If you just want to change the password of the user you can issue the following command.

```sh
owl users update-password jane.doe@owl.com
```

