import {getLocalStorageItem, hexToRGB} from "@/_helper/index.js";

export const barBorderRadiusData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
        {
            label: "Dataset #1",
            backgroundColor: hexToRGB(getLocalStorageItem('color-primary','#48BECE'),0.2),
            borderColor: hexToRGB(getLocalStorageItem('color-primary','#48BECE'),1),
            borderWidth: 2,
            borderRadius: 5,
            borderSkipped: false,
            data: [-65, 59, -20, 81, 56, -55, 40]
        },
        {
            label: "Dataset #2",
            backgroundColor: hexToRGB(getLocalStorageItem('color-primary','#FF5E40'),0.2),
            borderColor: hexToRGB(getLocalStorageItem('color-primary','#FF5E40'),0.2),
            borderRadius: 50,
            borderSkipped: false,
            data: [65, 59, -20, 81, -56, 55, -40]
        }
    ],
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false,
            }
        }
    }
};