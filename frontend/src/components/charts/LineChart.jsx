import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ 
  data, 
  title = '', 
  xAxisLabel = '', 
  yAxisLabel = '', 
  height = 300,
  showLegend = true,
  showGrid = true,
  fill = false,
  tension = 0.4,
  borderWidth = 2,
  pointRadius = 3,
  pointHoverRadius = 5
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 10,
        cornerRadius: 4,
        displayColors: true
      }
    },
    scales: {
      x: {
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel,
          font: {
            weight: 'bold'
          }
        },
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          font: {
            weight: 'bold'
          }
        },
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            // Format large numbers with k/M suffix
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value;
          }
        },
        beginAtZero: true
      }
    },
    elements: {
      line: {
        tension: tension,
        borderWidth: borderWidth
      },
      point: {
        radius: pointRadius,
        hoverRadius: pointHoverRadius,
        backgroundColor: 'white',
        borderWidth: 2
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  // Apply fill property to all datasets
  const chartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      fill: fill
    }))
  };

  return (
    <div style={{ height: height }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default LineChart;
