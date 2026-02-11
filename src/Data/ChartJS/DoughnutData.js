import {getLocalStorageItem, hexToRGB} from "@/_helper/index.js";

export const DoughnutData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
        {
            label: "Dataset #1",
            backgroundColor: [
                hexToRGB(getLocalStorageItem('color-primary','#48BECE'),0.5),
                'rgba(174, 204, 52,0.5)',
                'rgba( 299,94,64,0.5)',
            ],
            data: [-20, -54, 20, 0, 56, 55, -40]
        }
    ]
}