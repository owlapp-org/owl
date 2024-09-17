from app.lib.dashboard.components.charts.chart import Chart, ChartSeries


class BarChart(Chart):
    series: list[ChartSeries]
