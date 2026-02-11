import {getLocalStorageItem, hexToRGB} from "@/_helper/index.js";

export const RadarSkipPoints = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
        {
            label: "Dataset #1",
            backgroundColor: "rgba(174, 204, 52,0.2)",
            borderColor: "rgba( 174, 204, 52,1)",
            data: [-20, 25, -20, -5, 35, -10, 20]
        },
        {
            label: "Dataset #2",
            backgroundColor: hexToRGB(getLocalStorageItem('color-primary','#48BECE'),0.2),
            borderColor: hexToRGB(getLocalStorageItem('color-primary','#48BECE'),1),
            data: [-20, -23, 20, 0, 8, 25, -20]
        }
    ],
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
}