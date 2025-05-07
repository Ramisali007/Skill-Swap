import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ProjectStats = ({ stats }) => {
  // Doughnut chart data for project status distribution
  const statusChartData = {
    labels: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [stats.open, stats.inProgress, stats.completed, stats.cancelled],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)',  // yellow for open
          'rgba(54, 162, 235, 0.7)',  // blue for in progress
          'rgba(75, 192, 192, 0.7)',  // green for completed
          'rgba(255, 99, 132, 0.7)',  // red for cancelled
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Project Status Distribution',
        font: {
          size: 14,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  // Bar chart data
  const barChartData = {
    labels: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [stats.open, stats.inProgress, stats.completed, stats.cancelled],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
      <div className="px-6 py-5 sm:px-8 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Project Statistics</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Projects */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-indigo-200 mr-4">
                <svg className="h-6 w-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-600">Total Projects</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.total}</p>
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-200 mr-4">
                <svg className="h-6 w-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Active Projects</p>
                <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          {/* Completed Projects */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-200 mr-4">
                <svg className="h-6 w-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Completed Projects</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          {/* Total Budget */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-200 mr-4">
                <svg className="h-6 w-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Total Budget</p>
                <p className="text-2xl font-bold text-purple-900">${stats.totalBudget.toFixed(2)}</p>
                <p className="text-xs text-purple-700">Avg: ${stats.avgBudget.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-medium text-gray-900 mb-4">Project Status Distribution</h3>
            <div className="h-64">
              <Doughnut 
                data={statusChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }} 
              />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-medium text-gray-900 mb-4">Project Status Comparison</h3>
            <div className="h-64">
              <Bar 
                data={barChartData} 
                options={barChartOptions} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;
