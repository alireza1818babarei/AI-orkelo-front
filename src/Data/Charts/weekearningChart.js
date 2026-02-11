import {getLocalStorageItem, hexToRGB} from "../../_helper";

export const weekearningChart = {
    series: [{
        name: 'series1',
        data: [31, 40, 28, 80, 30, 60, 25]
    }],
    options: {
        annotations: {
            xaxis: [{
                x: 'W',
                borderWidth: 2,
                borderColor: 'rgba(116, 120, 141,0.2)',
                strokeDashArray: 2,
            },
            ],
            points: [{
                x: 'W',
                y: 80,
                marker: {
                    size: 5,
                    colors: '#fff',
                    strokeColor: getLocalStorageItem('color-primary', '#056464'),
                    strokeWidth: 4,
                },
            }],
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        colors: [hexToRGB(getLocalStorageItem('color-primary', '#056464'))],
        markers: {
            size: 0,
            colors: '#fff',
            strokeColors: hexToRGB(getLocalStorageItem('color-primary', '#056464')),
            strokeWidth: 4,
            hover: {
                size: 6,

            }
        },
        dataLabels: {
            enabled: false
        },
        grid: {

            borderColor: 'rgba(var(--dark),.4)',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false
                },
            },
        },
        xaxis: {
            categories: ["S", "M", "T", "W", "T", "F", "S"],
            labels: {
                show: true,
                style: {
                    colors: hexToRGB(getLocalStorageItem('color-secondary', '#74788d'), 1),
                    fontSize: '14px',
                    fontWeight: 400,
                },
            }
        },
        yaxis: {
            show: true,
            labels: {
                show: true,
                style: {
                    colors: hexToRGB(getLocalStorageItem('color-secondary', '#74788d'), 1),
                    fontSize: '14px',
                    fontWeight: 500,
                },
            }
        },
        tooltip: {
            x: {
                show: false,
            },
            style: {
                fontSize: '14px',
                fontFamily: "'Poppins', sans-serif",
            },
        },
        responsive: [{
            breakpoint: 992,
            options: {
                chart: {
                    height: 320
                },
            }
        }]
    }
}

export const monthearningChart = {

    series: [{
        name: 'series1',
        data: [10, 35, 25, 60, 25, 30, 18]
    }],
    options: {

        annotations: {
            xaxis: [{
                x: 'Apr',
                borderWidth: 2,
                borderColor: 'rgba(116, 120, 141,0.2)',
                strokeDashArray: 2,
            },
            ],
            points: [{
                x: 'Apr',
                y: 60,
                marker: {
                    size: 5,
                    colors: '#fff',
                    strokeColor: getLocalStorageItem('color-secondary', '#74788d'),
                    strokeWidth: 4,
                }
            }],
        },
        chart: {
            height: 380,
            type: 'line'
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        colors: ["rgb(116, 120, 141)"],
        markers: {
            size: 0,
            colors: '#fff',
            strokeColors: 'rgb(116, 120, 141)',
            strokeWidth: 4,
            hover: {
                size: 6,

            }
        },
        dataLabels: {
            enabled: false
        },
        grid: {
            borderColor: 'rgba(var(--dark),.4)',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false
                },
            },
        },
        xaxis: {
            categories: ["Jan", "Fab", "Mar", "Apr", "May", "Jun", "Jul"],
            labels: {
                show: true,
                style: {
                    colors: hexToRGB(getLocalStorageItem('color-secondary', '#74788d'), 1),
                    fontSize: '14px',
                    fontWeight: 500,
                },
            }
        },
        yaxis: {
            show: false,
            labels: {
                show: true,
                style: {
                    colors: hexToRGB(getLocalStorageItem('color-secondary', '#74788d'), 1),
                    fontSize: '14px',
                    fontWeight: 500,
                },
            }
        },
        tooltip: {
            x: {
                show: false,
            },
            style: {
                fontSize: '14px',
                fontFamily: "'Poppins', sans-serif",
            },
        },
        responsive: [{
            breakpoint: 992,
            options: {
                chart: {
                    height: 320
                },
            }
        }]
    }
}

export const yearearningChart = {
    series: [{
        name: 'series1',
        data: [20, 15, 25, 15, 30, 15]
    }],
    options : {

        chart: {
            height: 380,
            type: 'line'
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        colors: ["rgba(var(--danger),1)"],
        markers: {
            size: 0,
            colors: '#fff',
            strokeColors: 'rgba(15, 180, 80)',
            strokeWidth: 4,
            hover: {
                size: 6,

            }
        },
        annotations: {
            xaxis: [{
                x: '2021',
                borderWidth: 2,
                borderColor: 'rgba(116, 120, 141,0.2)',
                strokeDashArray: 2,
            },
            ],
            points: [{
                x: '2021',
                y: 30,
                marker: {
                    size: 5,
                    colors: '#fff',
                    strokeColor: '#ea5659',
                    strokeWidth: 4,
                }
            }],
        },
        dataLabels: {
            enabled: false
        },
        grid: {
            borderColor: 'rgba(var(--dark),.4)',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false
                },
            },
        },
        xaxis: {
            categories: ["2017", "2018", "2019", "2020", "2021", "2022", "2023"],
            labels: {
                show: true,
                style: {
                    colors: hexToRGB(getLocalStorageItem('color-secondary','#74788d'),1),
                    fontSize: '14px',
                    fontWeight: 500,
                },
            }
        },
        yaxis: {
            show: false,
            labels: {
                show: true,
                style: {
                    colors: hexToRGB(getLocalStorageItem('color-secondary','#74788d'),1),
                    fontSize: '14px',
                    fontWeight: 500,
                },
            }
        },
        tooltip:{
            x: {
                show: false,
            },
            style: {
                fontSize: '14px',
                fontFamily: "'Poppins', sans-serif",
            },
        },
        responsive: [{
            breakpoint: 992,
            options: {
                chart: {
                    height: 320
                },
            }
        }]
    }
}