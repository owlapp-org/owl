import os
import textwrap

import click
from alembic import command
from alembic.config import Config
from app.models.user import User
from app.settings import settings
from flask.cli import AppGroup

cmd = AppGroup(help="Initialization commands.")


@cmd.command(name="fs")
def init_filesystem(**kwargs):
    """Initialize filesystem for user directories."""
    if os.path.exists(settings.STORAGE_BASE_PATH):
        click.echo(f"- !Error: Path '{settings.STORAGE_BASE_PATH}' already exits.")
        exit(1)

    users_path = os.path.join(settings.STORAGE_BASE_PATH, "users")
    os.makedirs(users_path)
    if kwargs.get("echo") is not False:
        click.echo(f"- Created {users_path}")


@cmd.command(name="db")
def init_db() -> None:
    """Initialize database objects."""
    import importlib.resources

    with importlib.resources.path("app", "migrations") as path:
        migrations_path = str(path)
        alembic_ini = os.path.join(migrations_path, "alembic.ini")
        click.echo(f"- Alembic config file {alembic_ini}")
        config = Config(alembic_ini)
        config.set_main_option("script_location", str(migrations_path))
        command.upgrade(config, "head")


@cmd.command(name="all")
@click.pass_context
def init_all(ctx: click.Context) -> None:
    """Initialize all required resources."""

    click.echo("- Initializing all resources...")
    if os.path.exists(".env"):
        click.echo("- .env file exists.")
    else:
        click.echo("- Generating .env file...")
        with open(".env", "w") as f:
            f.write(settings.generate_env_content())

    click.echo("- Checking database...")
    if not settings.SQLALCHEMY_DATABASE_URI:
        click.echo("- !Error: SQLALCHEMY_DATABASE_URI is not set!")
        exit(1)
    elif settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        click.echo("- You are using sqlite database")
    elif settings.SQLALCHEMY_DATABASE_URI.startswith("postgresql"):
        click.echo("- You are using postgres database")
    else:
        click.echo(
            textwrap.dedent(
                f"""
        - Unknown SQLAlchemy dialect in SQLALCHEMY_DATABASE_URI.
        {settings.SQLALCHEMY_DATABASE_URI}
        Only sqlite and postgresql are supported.
        """
            )
        )
        exit(1)

    click.echo("- Initializing filesystem for user space files...")
    ctx.invoke(init_filesystem)
    click.echo("- Creating database objects...")
    ctx.invoke(init_db)

    click.echo("- Create admin user...")
    admin_email = click.prompt("Email", type=str, default="admin@owl.com")
    admin_name = click.prompt("Name", type=str, default="Jane Doe")
    admin_password = click.prompt("Password", type=str, hide_input=True)

    admin_user = User(email=admin_email, name=admin_name).hash_password(admin_password)
    try:
        from app.models import db

        db.session.add(admin_user)
        db.session.commit()
    except Exception as e:
        click.echo("- Failed to create user: %s" % e)
        exit(1)

    click.echo("- Done.")
    click.echo("- Run the application using command `owl run`")
    click.echo(f"- Login with {admin_email} and the password you just provided.")
