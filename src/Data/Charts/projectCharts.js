export const averageWeekReport = {
    series: [{
        name: 'Column Data',
        type: 'column',
        data: [35, 13, 25, 9, 19, 5, 12],
    }, {
        name: 'Line Data',
        type: 'line',
        data: [40, 25, 30, 20, 25, 10, 15],
    }],
    options: {
        chart: {
            height: 350,
            type: 'line',
        },
        colors: ['rgba(var(--danger),1)', 'rgba(var(--success),1)'],
        stroke: {
            curve: 'smooth',
            width: [4, 2]
        },
        markers: {
            size: 4,
        },
        plotOptions: {
            bar: {
                columnWidth: '45%',
                borderRadius: 5,
            }
        },
        yaxis: {
            show: false,
            labels: {
                show: false
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        xaxis: {
            show: false,
            labels: {
                show: false,
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        grid: {
            show: false,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: false
                }
            },
            padding: {
                top: 0,
                bottom: -20,
                left: -10,
                right: 0
            },
        },
        tooltip: {
            enabled: false,
        },
        legend: {
            show: false
        }
    }
}

export const totalSpentHours = {
    series: [{
        name: 'Website Blog',
        type: 'column',
        data: [20, 15, 20, 25, 30, 40, 55]
    }, {
        name: 'Social Media',
        type: 'line',
        data: [30, 25, 40, 35, 50, 45, 60]
    }],
    stroke: {
        width: [4, 4]
    },
    options: {
        chart: {
            height: 350,
            type: 'line',
            zoom: {
                enabled: false
            }
        },
        colors: ['rgba(var(--primary),1)', 'rgba(var(--success),1)'],
        stroke: {
            curve: 'smooth',
            width: [4, 3]
        },
        markers: {
            size: 4,
        },
        plotOptions: {
            bar: {
                columnWidth: '45%',
                borderRadius: 5,
            }
        },
        yaxis: {
            show: false,
            labels: {
                show: false
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        xaxis: {
            show: false,
            labels: {
                show: false
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        grid: {
            show: false,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: false
                }
            },
            padding: {
                top: 0,
                bottom: -20,
                left: -10,
                right: 0
            },
        },
        tooltip: {
            enabled: false,
        },
        legend: {
            show: false
        },
    }
}


import {getLocalStorageItem} from "@/_helper";

export const projectEarning = {
    series: [{
        name: 'Income',
        data: [40, 20, 42, 25, 45, 25, 32]
    }, {
        name: 'Total',
        data: [10, 25, 15, 35, 20, 45, 38]
    }],
    chart: {
        height: 190,
        type: 'line',
        dropShadow: {
            enabled: true,
            top: 10,
            left: 0,
            blur: 2,
            color: ["rgba(var(--warning),1)", "rgba(var(--success),1)"],
            opacity: 0.1,
        },
    },
    colors: ['rgba(var(--warning),1)', 'rgba(var(--success),1)'],
    dataLabels: {
        enabled: false
    },

    stroke: {
        width: 3,
        curve: 'smooth',
    },
    xaxis: {
        show: false,
        labels: {
            show: false
        },
        axisBorder: {
            show: true
        },
        axisTicks: {
            show: false
        },
        tooltip: {
            enabled: false
        }
    },
    yaxis: {
        show: true,
        labels: {
            show: false
        },
        axisBorder: {
            show: true
        },
    },
    grid: {
        show: false,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: false
            }
        },
    },
    legend: {
        show: false,
    },
    tooltip: {
        x: {
            show: false,
        },
        z: {
            show: false,
        },
        style: {
            fontSize: '16px',
            fontFamily: '"Outfit", sans-serif',
        },
    },

}

export const activityHours ={
    series: [{
        name: 'spent hours',
        type: 'column',
        data: [20, 35, 40, 45, 38, 30, 20]
    }, {
        name: 'total hours',
        type: 'line',
        data: [35, 26, 38, 30, 40, 35, 40]
    }],
    chart: {
        height: 270,
        type: 'line',
        // stacked: false,
        dropShadow: {
            enabled: true,
            top: 10,
            left: 0,
            blur: 2,
            color:'#48BECE',
            opacity: 0.2,
        },
    },
    stroke: {
        width: [0, 3],
        curve: 'smooth',
    },
    plotOptions: {
        bar: {
            columnWidth: '20',
            borderRadius: 5,
            borderRadiusApplication: 'around',
            borderRadiusWhenStacked: 'last',
        }
    },
    legend: {
        show: false,
    },
    colors: ['rgba(var(--primary),.2)', 'rgba(var(--primary),1)'],
    markers: {
        size: 4,
        colors: '#fff',
        strokeColors: 'rgba(var(--primary),1)',
        strokeWidth: 3,
        hover: {
            size: 4,
        }
    },
    xaxis: {
        show: false,
        type: 'category',
        categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        tooltip: {
            enabled: false
        },
        axisBorder: {
            show: true,
        },
        labels: {
            style: {
                colors: 'rgba(var(--secondary),1)',
                fontSize: '13px',
                fontFamily: 'Golos Text", sans-serif',
                fontWeight: 500,
            }
        }
    },
    yaxis: {
        show: false,
    },
    grid: {
        show: true,
        borderColor: 'rgba(var(--dark),.2)',
        strokeDashArray: 2,
        xaxis: {
            lines: {
                show: false
            },
        },
        yaxis: {
            lines: {
                show: true
            },
        },
    },
    tooltip: {
        x: {
            show: false,
        },
        style: {
            fontSize: '16px',
            fontFamily: '"Outfit", sans-serif',
        },
    },
    responsive: [{
        breakpoint: 1400,
        options: {
            chart: {
                height: 250
            },

        }
    }]
}

export const hoursRedial ={
    series: [60],
    chart: {
        width: 80,
        height: 100,
        type: 'radialBar',
        offsetX: 0,
        offsetY: 0
    },
    colors: [getLocalStorageItem('color-primary', '#48BECE'),],
    plotOptions: {
        radialBar: {
            hollow: {
                margin: 0,
                size: '70%',
                background: '#fff',
                position: 'front',
            },
            track: {
                background: 'rgba(var(--light),.2)',
                margin: 0,
            },
            dataLabels: {
                show: false
            }
        },
    },
    labels: [''],
    responsive: [{
        breakpoint: 1611,
        options: {
            chart: {
                height: 70
            },

        }
    }]
}

export const spendhoursRedial ={
    series: [85],
    chart: {
        width: 80,
        height: 100,
        type: 'radialBar',
        offsetX: 0,
        offsetY: 0
    },
    colors: ['rgba(var(--success),1)'],
    plotOptions: {
        radialBar: {
            hollow: {
                margin: 0,
                size: '70%',
                background: '#fff',
                position: 'front',
            },
            track: {
                background: 'rgba(var(--light),.2)',
                margin: 0,
            },
            dataLabels: {
                show: false
            }
        },
    },
    labels: [''],
    responsive: [{
        breakpoint: 1550,
        options: {
            chart: {
                height: 70
            },

        }
    }]
}