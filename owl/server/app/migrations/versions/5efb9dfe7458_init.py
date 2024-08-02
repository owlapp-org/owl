"""empty message

Revision ID: 5efb9dfe7458
Revises:
Create Date: 2024-07-25 23:43:34.233061

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "5efb9dfe7458"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Get the bind engine or connection
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    # Conditional SQL function based on dialect
    if dialect_name == "sqlite":
        created_at_default = sa.text("CURRENT_TIMESTAMP")
        updated_at_default = sa.text("CURRENT_TIMESTAMP")
    else:
        created_at_default = sa.text("now()")
        updated_at_default = sa.text("now()")

    # Create the users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("password_hash", sa.String(), nullable=True),
        sa.Column("is_admin", sa.Boolean(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=created_at_default,
            nullable=True,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=updated_at_default,
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    # Create the databases table
    op.create_table(
        "databases",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("config", sa.JSON(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("path", sa.String(), nullable=True),
        sa.Column("pool_size", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=created_at_default,
            nullable=True,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=updated_at_default,
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", "owner_id", name="_name_owner_uc"),
    )


def downgrade() -> None:
    op.drop_table("databases")
    op.drop_table("users")
