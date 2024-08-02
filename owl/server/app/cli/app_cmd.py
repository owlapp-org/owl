import secrets

import click
from flask.cli import AppGroup

cmd = AppGroup(help="App commands.")


@cmd.command(name="generate-secret")
def generate_secret():
    value = secrets.token_urlsafe(32)
    click.echo(value)


@cmd.command(name="generate-env")
def generate_env():
    from app.settings import settings

    content = settings.generate_env_content()
    click.echo(content)
