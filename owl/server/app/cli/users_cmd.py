import click
from app.models import db
from app.models.user import User
from click import argument, prompt
from flask.cli import AppGroup

cmd = AppGroup(help="User management commands")


@cmd.command("create")
@click.pass_context
@argument("email")
@argument("name")
def create(ctx: click.Context, email: str, name: str) -> None:
    """Create a new user"""
    if user := User.find_by_email(email):
        click.echo(f"User with email {email} already exists!")
        response = click.prompt(
            "Do you want to update it?",
            default="y",
            type=click.Choice(["y", "n"], case_sensitive=False),
        )
        if str(response).lower() == "y":
            ctx.invoke(update_user, email)
        else:
            click.echo("Exiting.")
            exit(1)

    password = prompt("Password", hide_input=True, confirmation_prompt=True)
    user = User(email=email, name=name).hash_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        print("Failed creating user: %s" % e)
        exit(1)


@cmd.command()
@argument("email")
def delete(email: str) -> None:
    """
    Delete a user
    """

    if user := User.find_by_email(email):
        deleted_count = db.session.delete(user)
        db.session.commit()
        click.echo(f"Deleted {deleted_count} user: " + email)
    else:
        click.echo(f"User with email {email} not found.")
        exit(1)


@cmd.command(name="list")
def list_users() -> None:
    """List all users"""
    users = User.find_all()
    if len(users) == 0:
        click.echo("No users found")
        exit(0)
    print(f"{'ID':<{7}}{'EMAIL':<{40}}{'NAME':<{50}}")
    for user in users:
        print(f"{user.id:<{7}}{user.email:<{40}}{user.name:<{50}}")


@cmd.command(name="update")
@argument("id_or_email")
def update_user(id_or_email: str) -> None:
    """Update a user"""

    try:
        id = int(id_or_email)
    except:  # noqa
        user = User.find_by_email(id_or_email)
    else:
        user = User.find_by_id(id)

    if user is None:
        click.echo("User not found!")
        exit(1)

    click.echo(f"User {user.email} {user.name}")
    click.echo("Press enter for default value.")

    email = prompt("Email", default=user.email, type=str)
    name = prompt("Name", default=user.name, type=str)
    password = prompt("Password", hide_input=True)

    if name and name != user.name:
        user.name = name
    if email and email != user.email:
        user.email = email
    if password:
        user.hash_password(password)

    db.session.commit()
    click.echo("User updated.")


@cmd.command(name="update-password")
@argument("id_or_email")
def update_password(id_or_email: str) -> None:
    """Update the password of a user"""
    try:
        id = int(id_or_email)
    except:  # noqa
        user = User.find_by_email(id_or_email)
    else:
        user = User.find_by_id(id)

    if user is None:
        click.echo("User not found!")
        exit(1)

    click.echo(f"User {user.email} {user.name}")
    password = prompt("Password", hide_input=True)
    if password:
        user.hash_password(password)

    db.session.commit()
    click.echo("Password updated.")
