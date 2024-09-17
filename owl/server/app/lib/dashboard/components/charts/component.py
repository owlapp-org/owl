import importlib
from typing import Any, Optional

import pydash as _
from pydantic import BaseModel

DEFAULT_COMPONENT_TYPE = "div"


class Component(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = DEFAULT_COMPONENT_TYPE
    children: Optional[list["Component"]] = None
    database: Optional[str] = None

    @classmethod
    def load(cls, kv: dict[str:Any]) -> "Component":
        if not (children := kv.get("children", [])):
            return
        children: list[dict[str, Any]] = (
            children if isinstance(children, list) else [children]
        )

        module = importlib.import_module("app.lib.dashboard.components")

        for child in children:
            component_type = child.get("type", "div")
            clz = getattr(module, child)

        pass
