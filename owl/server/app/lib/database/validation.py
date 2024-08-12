def validate_query(query: str):
    tokens = query.split(" ")
    for token in tokens:
        if "{{files}}" in token and "../" in token:
            raise ValueError(f"Query contains not allowed characters: {token}")

    return query
