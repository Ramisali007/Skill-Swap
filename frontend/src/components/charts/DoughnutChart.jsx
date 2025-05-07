import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const DoughnutChart = ({ 
  data, 
  title = '', 
  height = 300,
  showLegend = true,
  legendPosition = 'right',
  cutout = 70,
  borderWidth = 1
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: legendPosition,
        labels: {
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
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
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: `${cutout}%`,
    elements: {
      arc: {
        borderWidth: borderWidth
      }
    }
  };

  return (
    <div style={{ height: height }}>
      <Doughnut options={options} data={data} />
    </div>
  );
};

export default DoughnutChart;
