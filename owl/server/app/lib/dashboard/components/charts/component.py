import importlib
from typing import Any, Optional

import pydash as _
from pydantic import BaseModel

DEFAULT_COMPONENT_TAG = "div"


class Component(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tag: Optional[str] = DEFAULT_COMPONENT_TAG
    database: Optional[str] = None
    properties: Optional[dict[str, Any]] = None
    children: Optional[list["Component"]] = None

    # @classmethod
    # def render_properties(cls, properties: dict[str:Any]) -> str:
    #     result = " ".join([f"{key}={value}" for key, value in properties.items()])
    #     return result

    # @classmethod
    # def render(cls, kv: dict[str:Any]) -> "Component":
    #     tag: str = kv.get("tag", DEFAULT_COMPONENT_TAG)
    #     properties = cls.render_properties(kv.get("props", {}))
    #     children = []
    #     for child in kv.get("children", []):
    #         children.append(cls.load(child))

    #     body = "\n".join(children)
    #     return f"<{tag} {properties}>{body}</{tag}>"

    def try_resolve(self) -> "Component":

        return self

    @classmethod
    def load(cls, kv: dict[str, Any], **kwargs) -> "Component":
        name: str = kv.get("name", None)
        tag: str = kv.get("tag", DEFAULT_COMPONENT_TAG)
        properties: dict = kv.get("props", {})
        description: str = kv.get("description")
        database: str = kv.get("database", kwargs.get("database"))

        children = []
        for child in kv.get("children", []):
            children.append(
                cls.load(
                    child,
                    # pass parent attributes to inherit in child if not specified
                    database=database,
                )
            )

        return cls(
            name=name,
            tag=tag,
            properties=properties,
            description=description,
            database=database,
            children=children,
        )
