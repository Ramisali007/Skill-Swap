import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  AcademicCapIcon, 
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SkillDemandSupplyChart = ({ data, timeframe, onTimeframeChange }) => {
  const [demandSupplyChart, setDemandSupplyChart] = useState(null);
  const [growthChart, setGrowthChart] = useState(null);
  const [view, setView] = useState('demand-supply'); // 'demand-supply', 'growth', 'forecast'
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    if (data) {
      // Process demand vs supply data
      const demandSupplyData = {
        labels: data.skillDemandSupply.map(skill => skill.name),
        datasets: [
          {
            label: 'Demand (Projects)',
            data: data.skillDemandSupply.map(skill => skill.demand),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1
          },
          {
            label: 'Supply (Freelancers)',
            data: data.skillDemandSupply.map(skill => skill.supply),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }
        ]
      };
      
      setDemandSupplyChart(demandSupplyData);
      
      // Initialize selected skills with top 3 skills if available
      if (data.skillGrowthTrend && data.skillGrowthTrend.length > 0 && selectedSkills.length === 0) {
        setSelectedSkills(data.skillGrowthTrend.slice(0, 3).map(skill => skill._id));
      }
      
      // Process growth trend data
      if (data.skillGrowthTrend && data.skillGrowthTrend.length > 0) {
        const growthData = {
          datasets: data.skillGrowthTrend
            .filter(skill => selectedSkills.includes(skill._id))
            .map((skill, index) => {
              const colors = [
                { bg: 'rgba(99, 102, 241, 0.2)', border: 'rgba(99, 102, 241, 1)' },
                { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 1)' },
                { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 1)' },
                { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 1)' },
                { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 1)' }
              ];
              
              // Format labels as "Month Year"
              const labels = skill.trend.map(point => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${monthNames[point.month - 1]} ${point.year}`;
              });
              
              // Add forecast points if available
              const forecast = data.skillForecast.find(f => f.name === skill._id)?.forecast || [];
              const allPoints = [...skill.trend.map(t => t.count)];
              const allLabels = [...labels];
              
              if (forecast && forecast.length > 0) {
                forecast.forEach(point => {
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  allPoints.push(point.count);
                  allLabels.push(`${monthNames[point.month - 1]} ${point.year} (F)`);
                });
              }
              
              return {
                label: skill._id,
                data: allPoints,
                borderColor: colors[index % colors.length].border,
                backgroundColor: colors[index % colors.length].bg,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5,
                fill: false
              };
            })
        };
        
        // Add labels
        if (growthData.datasets.length > 0) {
          const firstSkill = data.skillGrowthTrend.find(skill => skill._id === selectedSkills[0]);
          if (firstSkill) {
            const labels = firstSkill.trend.map(point => {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${monthNames[point.month - 1]} ${point.year}`;
            });
            
            // Add forecast labels if available
            const forecast = data.skillForecast.find(f => f.name === firstSkill._id)?.forecast || [];
            if (forecast && forecast.length > 0) {
              forecast.forEach(point => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                labels.push(`${monthNames[point.month - 1]} ${point.year} (F)`);
              });
            }
            
            growthData.labels = labels;
          }
        }
        
        setGrowthChart(growthData);
      }
    }
  }, [data, selectedSkills]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          precision: 0
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const handleSkillToggle = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      if (selectedSkills.length < 5) { // Limit to 5 skills for readability
        setSelectedSkills([...selectedSkills, skillName]);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <AcademicCapIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Skill Analytics
          </h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setView('demand-supply')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  view === 'demand-supply'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ArrowsRightLeftIcon className="h-4 w-4 inline mr-1" />
                Demand vs Supply
              </button>
              <button
                type="button"
                onClick={() => setView('growth')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  view === 'growth'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ArrowTrendingUpIcon className="h-4 w-4 inline mr-1" />
                Growth Trends
              </button>
            </div>
            <select
              value={timeframe}
              onChange={(e) => onTimeframeChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {view === 'growth' && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Select Skills to Compare (max 5)</h4>
          <div className="flex flex-wrap gap-2">
            {data?.skillGrowthTrend?.map(skill => (
              <button
                key={skill._id}
                onClick={() => handleSkillToggle(skill._id)}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedSkills.includes(skill._id)
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {skill._id}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="h-80">
          {view === 'demand-supply' && demandSupplyChart ? (
            <Bar data={demandSupplyChart} options={barOptions} />
          ) : view === 'growth' && growthChart ? (
            <Line data={growthChart} options={lineOptions} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
      </div>

      {data && data.skillDemandSupply && view === 'demand-supply' && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Top Skills Market Analysis</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supply
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D/S Ratio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.skillDemandSupply.slice(0, 5).map((skill) => (
                  <tr key={skill.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {skill.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {skill.demand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {skill.supply}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        skill.demandSupplyRatio > 1.5 
                          ? 'bg-red-100 text-red-800' 
                          : skill.demandSupplyRatio > 1 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {skill.demandSupplyRatio.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${skill.averageRate.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillDemandSupplyChart;
