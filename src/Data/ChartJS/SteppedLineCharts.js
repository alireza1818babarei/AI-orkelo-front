export const SteppedLineCharts = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
        {
            label: "Dataset #1",
            backgroundColor: "rgba( 299,94,64,0.2)",
            borderColor: "rgba( 299,94,64,1)",
            fill: false,
            stepped: true,
            data: [-20, 54, -20, -5, 56, -55, 40]
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
}