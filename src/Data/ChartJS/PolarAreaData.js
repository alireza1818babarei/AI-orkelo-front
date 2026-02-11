import {getLocalStorageItem, hexToRGB} from "@/_helper/index.js";

export const PolarAreaData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
        {
            label: "Dataset #1",
            backgroundColor: [
                hexToRGB(getLocalStorageItem('color-primary','#48BECE'),0.5),
                'rgba(83,90,231,0.5)',
                'rgba( 235,195,63,0.5)',
            ],
            data: [-10, -54, 40, 20, 56, 55, -40]
        }
    ]
}