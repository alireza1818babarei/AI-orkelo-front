

import React from 'react';
import Chart from "react-apexcharts";
import {timeSpentData} from "../../Data/Charts/ApexChart";

const TimeSpent = () => {
  return (
        <Chart
            options={timeSpentData}
            series={timeSpentData.series}
            type="line"
            height={280}
        />
  )
}

export default TimeSpent