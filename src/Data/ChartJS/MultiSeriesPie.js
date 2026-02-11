import {getLocalStorageItem, hexToRGB} from "@/_helper/index.js";

export const MultiSeriesPie = {
    labels: ['Overall Yay', 'Overall Nay', 'Group A Yay', 'Group A Nay', 'Group B Yay', 'Group B Nay', 'Group C Yay', 'Group C Nay'],
    datasets: [
        {
            backgroundColor: [hexToRGB(getLocalStorageItem('color-secondary','#8B8476'),0.10), hexToRGB(getLocalStorageItem('color-secondary','#8B8476'))],
            data: [21, 79]
        },
        {
            backgroundColor: [hexToRGB(getLocalStorageItem('color-secondary','#AECC34'),0.10), hexToRGB(getLocalStorageItem('color-success','#AECC34'))],
            data: [33, 67]
        },
        {
            backgroundColor: [hexToRGB(getLocalStorageItem('color-primary','#48BECE'),0.5), hexToRGB(getLocalStorageItem('color-primary','#48BECE'),1)],
            data: [20, 80]
        },
        {
            backgroundColor: [hexToRGB(getLocalStorageItem('color-danger','#FF5E40'),0.5), hexToRGB(getLocalStorageItem('color-danger','#FF5E40'),1)],
            data: [10, 90]
        }
    ],
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    generateLabels: function (chart) {
                        // Get the default label list
                        const original = Chart.overrides.pie.plugins.legend.labels.generateLabels;
                        const labelsOriginal = original.call(this, chart);

                        // Build an array of colors used in the datasets of the chart
                        let datasetColors = chart.data.datasets.map(function (e) {
                            return e.backgroundColor;
                        });
                        datasetColors = datasetColors.flat();

                        // Modify the color and hide state of each label
                        labelsOriginal.forEach(label => {
                            // There are twice as many labels as there are datasets. This converts the label index into the corresponding dataset index
                            label.datasetIndex = (label.index - label.index % 2) / 2;

                            // The hidden state must match the dataset's hidden state
                            label.hidden = !chart.isDatasetVisible(label.datasetIndex);

                            // Change the color to match the dataset
                            label.fillStyle = datasetColors[label.index];
                        });

                        return labelsOriginal;
                    }
                },
                onClick: function (mouseEvent, legendItem, legend) {
                    // toggle the visibility of the dataset from what it currently is
                    legend.chart.getDatasetMeta(
                        legendItem.datasetIndex
                    ).hidden = legend.chart.isDatasetVisible(legendItem.datasetIndex);
                    legend.chart.update();
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const labelIndex = (context.datasetIndex * 2) + context.dataIndex;
                        return context.chart.data.labels[labelIndex] + ': ' + context.formattedValue;
                    }
                }
            }
        }
    },
}