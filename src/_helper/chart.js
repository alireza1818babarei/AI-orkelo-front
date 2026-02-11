const themeName = "La-Theme";

export function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

export function getLocalStorageItem(key, defaultValue = null) {
    return localStorage.getItem(`${themeName}-${key}`) ?? defaultValue;
}

export const generateDayWiseTimeSeries = (baseval, count, yrange) => {
    let i = 0;
    let series = [];
    while (i < count) {
        var x = baseval;
        var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

        series.push([x, y]);
        baseval += 86400000;
        i++;
    }
    return series;
}

export function updateQuarterChart(sourceChart, destChartIDToUpdate) {
    let series = [];
    let seriesIndex = 0;
    let colors = []

    if (sourceChart.w.globals.selectedDataPoints[0]) {
        const selectedPoints = sourceChart.w.globals.selectedDataPoints;
        for (let i = 0; i < selectedPoints[seriesIndex].length; i++) {
            const selectedIndex = selectedPoints[seriesIndex][i];
            const yearSeries = sourceChart.w.config.series[seriesIndex];
            series.push({
                name: yearSeries.data[selectedIndex].x,
                data: yearSeries.data[selectedIndex].quarters
            })
            colors.push(yearSeries.data[selectedIndex].color)
        }

        if (series.length === 0) series = [{
            data: []
        }]

        return ApexCharts.exec(destChartIDToUpdate, 'updateOptions', {
            series: series,
            colors: colors,
            fill: {
                colors: colors
            }
        })
    }
}

export function generateData(baseval, count, yrange) {
    let i = 0;
    const series = [];
    while (i < count) {
        const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
        const z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;

        series.push([baseval, y, z]);
        baseval += 86400000;
        i++;
    }
    return series;
}

export function generateHeatmapData(count, yrange) {
    var i = 0;
    var series = [];
    while (i < count) {
        var x = (i + 1).toString();
        var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

        series.push({
            x: x,
            y: y
        });
        i++;
    }
    return series;
}




