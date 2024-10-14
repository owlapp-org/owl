from sqlparse.sql import Statement
from sqlparse.tokens import Comment, Keyword, Name, Whitespace


def first_non_comment_token(statement: Statement) -> str | None:
    for token in statement.flatten():  # Use flatten to handle nested tokens
        # Ignore comments, whitespace, and newlines
        if (
            token.ttype not in (Whitespace, Comment)
            and token.value.strip()
            and token.ttype in (Keyword, Name)
        ):
            return token.value.strip()


def statement_starts_with(statement: Statement, *tokens: str) -> bool:
    head = first_non_comment_token(statement)
    for token in tokens:
        if head.lower() == token.lower():
            return True
    return False
