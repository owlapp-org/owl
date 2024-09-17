from textwrap import dedent

import requests
from tests.conftest import api_url


def test_render_dashboard_content(use_access_token):
    raw_content = dedent(
        """
        name: "demo"
        description: "demo dashboard description"
        children:
        - name: city_population_bar
            type: BarChart
            database: <database name>
            props:
            data: {{ref('addresses')}}
            series: {{_.without(ctx.data.columns, "month")}}
            h: 300
            dataKey: "month"
            tickLine: "y"
    """
    )
    response = requests.post(
        api_url("dashboards/render"),
        json={"content": raw_content},
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
