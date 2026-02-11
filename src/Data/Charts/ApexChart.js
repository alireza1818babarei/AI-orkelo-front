

const chartOptions1 = {
  series: [
    {
      name: "series1",
      data: [5, 10, 8, 15, 12, 10, 20, 16, 20],
    },
  ],
  chart: {
    height: 150,
    type: "area",
    parentHeightOffset: 0,
    sparkline: {
      enabled: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  fill: {
    type: "gradient",
    colors: ["#056464"],
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.8,
      stops: [0, 90, 100],
    },
  },
  stroke: {
    width: 2,
    curve: "smooth",
  },
  yaxis: {
    show: false,
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
  xaxis: {
    show: false,
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
  grid: {
    show: false,
    padding: {
      top: 10,
      bottom: 2,
      left: -10,
      right: 0,
    },
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

const chartOptions2 = {
  series: [
    {
      name: "series1",
      data: [20, 25, 15, 12, 30, 25, 16, 28, 20],
    },
  ],
  chart: {
    height: 150,
    type: "area",
    parentHeightOffset: 0,
    sparkline: {
      enabled: true,
    },
  },
  colors: ["rgba(var(--success),1)"],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  fill: {
    type: "gradient",
    colors: ["#0fb450"],
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.4,
      stops: [0, 90, 100],
    },
  },
  yaxis: {
    show: false,
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
  xaxis: {
    show: false,
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
    padding: {
      top: 10,
      bottom: 2,
      left: -10,
      right: 0,
    },
  },
  tooltip: {
    enabled: false,
  },
};

const chartOptions3 = {
  series: [
    {
      name: "series1",
      data: [5, 8, 10, 12, 10, 20, 18, 25, 22, 30],
    },
  ],
  chart: {
    height: 160,
    type: "area",
    parentHeightOffset: 0,
    sparkline: {
      enabled: true,
    },
  },
  colors: ["rgba(var(--success),1)"],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 0,
      opacityFrom: 1,
      opacityTo: 0.1,
      stops: [0, 90, 100],
    },
  },
  yaxis: {
    axisBorder: {
      show: false,
    },
  },
  xaxis: {
    categories: [
      "2014",
      "2015",
      "2016",
      "2017",
      "2018",
      "2019",
      "2020",
      "2021",
      "2022",
      "2023",
    ],
    axisBorder: {
      show: false,
    },
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
    padding: {
      top: 10,
      bottom: 0,
      left: -10,
      right: 0,
    },
  },
  tooltip: {
    enabled: false,
  },
};

const   chartOptions4 = {
  series: [
    {
      name: "data1",
      data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
    },
    {
      name: "data2",
      data: [87, 57, 74, 99, 75, 38, 62, 47, 82, 56, 45, 47],
    },
  ],
  chart: {
    height: 90,
    type: "line",
  },
  dataLabels: {
    enabled: false,
  },
  colors: ["rgba(var(--danger),1)", "rgba(var(--primary),1)"],
  stroke: {
    width: [3, 3],
    curve: "smooth",
    dashArray: [0, 5],
  },
  markers: {
    size: 0,
    hover: {
      sizeOffset: 6,
    },
  },
  legend: {
    show: false,
  },
  xaxis: {
    categories: [
      "01 Jan",
      "02 Jan",
      "03 Jan",
      "04 Jan",
      "05 Jan",
      "06 Jan",
      "07 Jan",
      "08 Jan",
      "09 Jan",
      "10 Jan",
      "11 Jan",
      "12 Jan",
    ],
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  yaxis: {
    labels: {
      show: false,
    },
  },
  grid: {
    show: false,
    padding: {
      top: -10,
      right: 0,
      bottom: -18,
      left: 0,
    },
  },
  tooltip: {
    enabled: false,
  },
};

const chartOptions5 = {
  series: [80, 45, 67],
  chart: {
    height: 370,
    type: "radialBar",
  },
  colors: [
    "rgba(var(--primary),1)",
    "rgba(var(--danger),1)",
    "rgba(var(--warning),1)",
  ],
  plotOptions: {
    radialBar: {
      dataLabels: {
        name: {
          fontSize: "18px",
        },
        value: {
          fontSize: "20px",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 500,
          color: "rgba(var(--primary),1)",
        },
        total: {
          show: true,
          label: "Total",
        },
      },
    },
  },
  labels: ["New Target", "Resolve Target", "Total"],
  responsive: [
    {
      breakpoint: 1250,
      options: {
        chart: {
          height: 300,
        },
      },
    },
  ],
};

const fileManagerOption = {
  series: [42, 47, 52, 58],
  labels: ['Data A', 'Data B', 'Data C', 'Data D'],
  dataLabels: {
    enabled: false,
  },
  colors: ['#056464', '#74788d', '#ea5659', '#fac10f'],
  yaxis: {
    show: false,
  },
  legend: {
    show: true,
    position: 'top',
  },
};

const timeSpentData = {
  series: [{
  name: 'Spent Time',
  type: 'column',
  data: [35, 45, 32, 40, 35, 38, 40]
}, {
  name: 'Total Time',
  type: 'line',
  data: [30, 25, 36, 30, 40, 35]
}],
  chart: {
  height: 280,
  type: 'line',
  stacked: false,
},
annotations: {
  points: [{
    x: 'S',
    y: 35,
    marker: {
      size: 5,
      colors: '#fff',
      strokeColor: 'rgba(var(--warning),1)',
      strokeWidth: 4,
      cssClass: 'marker-warning',
    }
  }],
},
stroke: {
  width: [0, 2, 5],
  curve: 'smooth'
},
plotOptions: {
  bar: {
    columnWidth: '26'
  }
},
legend: {
  show: false,
},
colors:['rgba(var(--warning),1)'],
fill: {
  type: ["gradient", "solid"],
  opacity: [0.8, .1],
  gradient: {
    inverseColors: false,
    shade: 'light',
    type: "vertical",
    opacityFrom: 0.1,
    opacityTo: 0.1,
    colorStops: [
      {
        offset: 0,
        color: 'rgba(var(--primary),.1)',
        opacity: 1,
      },
      {
          offset: 50,
          color: 'rgba(var(--primary),.1)',
          opacity: 1,
        },
      {
        offset: 100,
        color: 'rgba(var(--primary),.1)',
        opacity: 1,
      },
    ],
  }
},
markers: {
  size: 0
},
xaxis: {
  type: 'category',
  categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  tooltip: {
      enabled: false
    },
    axisBorder: {
      show: false,
  }
},
yaxis: {
  show: false,
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
tooltip: {
  x: {
    show: false,
  },
  style: {
    fontSize: '16px',
    fontFamily: '"Outfit", sans-serif',
  },
},
// responsive: [{
//   breakpoint: 1440,
//   options: {
//     chart: {
//       height: 200
//     },
//   }
// }]
};

const ApiRequestData = {
  series: [
    {
      name: '',
      data: [19.0, 20, 19.8, 19, 19.67, 19.45, 20.99, 30.45, 19.45, 19.09, 19.8, 19.6, 20, 20.89, 21.4, 19.09, 20.8, 23.78, 25.0, 20, 19.65, 25, 24.89, 23, 19.0, 19.56, 20.36, 22.90, 24.90, 19.78]
    },
  ],
  chart: {
    type: 'area',
    height: 350,
    offsetY: 0,
    offsetX: 0,
    toolbar: {
      show: false,
    },
  },
  stroke: {
    width: 2,
    curve: 'smooth'
  },
  dataLabels: {
    enabled: false,
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      colorStops: [
        {
          offset: 0,
          color: 'rgba(var(--info),.4)',
          opacity: 1,
        },
        {
          offset: 50,
          color: 'rgba(var(--info),.4)',
          opacity: 1,
        },
        {
          offset: 100,
          color: 'rgba(var(--info),.1)',
          opacity: 1,
        },
      ]
    }
  },
  legend: {
    show: false,
  },
  colors: ['rgba(var(--info))'],
  xaxis: {
    tooltip: {
      enabled: false,
    },
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
    breakpoint: 1660,
    options: {
      chart: {
        height: 365
      }
    }
  }]
};



export {
  chartOptions1,
  chartOptions2,
  chartOptions3,
  chartOptions4,
  chartOptions5,
  fileManagerOption,
  timeSpentData,
  ApiRequestData,

};
