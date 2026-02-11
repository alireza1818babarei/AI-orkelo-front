import {getLocalStorageItem, hexToRGB} from "@/_helper/index.js";

export const PieData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
        {
            label: "Dataset #1",
            backgroundColor: [
                hexToRGB(getLocalStorageItem('color-dark','#48443D'),0.5),
                'rgba(299,94,64,0.5)',
                'rgba( 83,90,231,0.5)',
            ],
            data: [-20, -54, 20, 0, 56, 55, -40]
        }
    ]
}