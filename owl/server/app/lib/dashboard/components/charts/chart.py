from typing import Any, Optional

from app.lib.dashboard.components.charts.component import Component
from pydantic import BaseModel


class ChartSeries(BaseModel):
    name: str
    color: Optional[str] = None
    label: Optional[str] = None
    yAxisId: Optional[str] = None


class Chart(Component):
    data: list[dict[str, Any]]
