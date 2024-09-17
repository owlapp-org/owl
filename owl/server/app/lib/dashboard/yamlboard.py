from typing import Any

import yaml


class YamlBoard:
    def __init__(self, owner_id: int, raw: str):
        self.owner_id = owner_id
        self.raw = raw

    def load_yaml(self) -> dict[str, Any]:
        return yaml.safe_load(self.raw)

    def parse(self) -> str:
        d = self.load_yaml()
        pass
