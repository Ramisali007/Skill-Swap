import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ 
  data, 
  title = '', 
  xAxisLabel = '', 
  yAxisLabel = '', 
  height = 300,
  showLegend = true,
  showGrid = true,
  horizontal = false,
  barThickness = 'flex',
  borderWidth = 1
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
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
          display: horizontal ? showGrid : false,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          }
        },
        stacked: false
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
          display: horizontal ? false : showGrid,
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
        beginAtZero: true,
        stacked: false
      }
    },
    elements: {
      bar: {
        borderWidth: borderWidth
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    barThickness: barThickness
  };

  return (
    <div style={{ height: height }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default BarChart;
