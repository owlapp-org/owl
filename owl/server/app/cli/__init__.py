import click
from app import __version__, create_app
from app.cli.app_cmd import cmd as app_cmd
from app.cli.init_cmd import cmd as init_cmd
from app.cli.users_cmd import cmd as users_cmd
from flask import current_app
from flask.cli import FlaskGroup, run_command, with_appcontext


def create():
    app = current_app or create_app()

    @app.shell_context_processor
    def shell_context():
        from app.settings import settings

        return {"settings": settings}

    return app


@click.group(cls=FlaskGroup, create_app=create)
def cli():
    """This is a management script for the Owl application."""


@cli.command()
def version():
    """Displays app version version."""
    print(__version__)


@cli.command()
def show_settings():
    """Show the settings as App sees them (useful for debugging)."""
    for name, item in current_app.config.items():
        print("{} = {}".format(name, item))


@cli.command("shell")
@with_appcontext
def shell():
    """Application shell."""
    import ptpython
    from app.models import User, db
    from flask import current_app as app

    context = {"app": app, "db": db, "User": User}

    ptpython.embed(locals=context, vi_mode=True)


@cli.command("routes")
@with_appcontext
def routes():
    """Display routes."""
    from flask import current_app as app

    for rule in app.url_map.iter_rules():
        print(f"{str(rule):<35}{str(rule.endpoint):<10}")


@cli.command()
def run():
    """Run the Flask application using Gunicorn."""
    import os

    os.system("gunicorn -b 127.0.0.1:8000 app.wsgi:app -w 1 --threads 12")


cli.add_command(run_command, "runserver")
cli.add_command(users_cmd, "users")
cli.add_command(init_cmd, "init")
cli.add_command(app_cmd, "app")
