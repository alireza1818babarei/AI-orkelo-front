import React from "react";
import Chart from "react-apexcharts";

const MarketChart = ({ data, color }) => {
    const options = {
        series: [
            {
                name: 'series1',
                data: data,
            },
        ],
        chart: {
            width: 150,
            height: 55,
            type: 'line',
            offsetX: 0,
            offsetY: 0,
        },
        dataLabels: {
            enabled: false,
        },
        colors: [color],
        stroke: {
            width: 2,
        },
        xaxis: {
            show: true,
            labels: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            show: false,
        },
        grid: {
            show: false,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: false,
                },
            },
        },
        tooltip: {
            enabled: false,
        },
    };

    return <Chart options={options} series={options.series} type="line" height={55} />;
};

export default MarketChart;