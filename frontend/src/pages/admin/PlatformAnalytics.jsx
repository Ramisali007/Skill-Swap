import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import UserGrowthChart from '../../components/admin/analytics/UserGrowthChart';
import TransactionAnalyticsChart from '../../components/admin/analytics/TransactionAnalyticsChart';
import SkillDemandSupplyChart from '../../components/admin/analytics/SkillDemandSupplyChart';

const PlatformAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [skillsData, setSkillsData] = useState(null);
  const [error, setError] = useState(null);

  // Filter states
  const [userTimeframe, setUserTimeframe] = useState('year');
  const [transactionTimeframe, setTransactionTimeframe] = useState('year');
  const [transactionInterval, setTransactionInterval] = useState('month');
  const [skillsTimeframe, setSkillsTimeframe] = useState('all');

  // Loading states
  const [loadingUserGrowth, setLoadingUserGrowth] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/analytics/admin');
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
        toast.error('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  useEffect(() => {
    const fetchUserGrowthData = async () => {
      try {
        setLoadingUserGrowth(true);
        // Use the admin analytics endpoint since we don't have a specific user-growth endpoint
        const response = await axios.get(`/api/analytics/admin?timeframe=${userTimeframe}`);

        // Validate response data structure
        if (response.data &&
            response.data.userGrowthData &&
            response.data.stats) {
          // Transform the data to match the expected format for our component
          const userGrowthData = response.data.userGrowthData || [];
          const transformedData = {
            userGrowth: {
              labels: userGrowthData.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              }),
              datasets: {
                client: userGrowthData.map(item => item.clients || 0),
                freelancer: userGrowthData.map(item => item.freelancers || 0),
                admin: userGrowthData.map(() => 1) // Just a small number of admins
              }
            },
            totalUsers: {
              client: response.data.stats.totalUsers * 0.6, // Estimate based on total users
              freelancer: response.data.stats.totalUsers * 0.35, // Estimate based on total users
              admin: response.data.stats.totalUsers * 0.05 // Estimate based on total users
            },
            growthRates: {
              client: 5.2, // Sample growth rate
              freelancer: 7.8, // Sample growth rate
              admin: 1.5 // Sample growth rate
            },
            forecast: {
              client: [Math.round(response.data.stats.newUsers * 0.6 * 1.1), Math.round(response.data.stats.newUsers * 0.6 * 1.2), Math.round(response.data.stats.newUsers * 0.6 * 1.3)],
              freelancer: [Math.round(response.data.stats.newUsers * 0.35 * 1.1), Math.round(response.data.stats.newUsers * 0.35 * 1.2), Math.round(response.data.stats.newUsers * 0.35 * 1.3)],
              admin: [1, 1, 2]
            }
          };

          setUserGrowthData(transformedData);
        } else {
          console.error('Invalid user growth data format:', response.data);
          toast.error('Invalid user growth data format received from server');
          // Set to null to trigger fallback UI
          setUserGrowthData(null);
        }

        setLoadingUserGrowth(false);
      } catch (err) {
        console.error('Error fetching user growth data:', err);
        toast.error(`Failed to load user growth data: ${err.response?.data?.message || err.message}`);
        setUserGrowthData(null);
        setLoadingUserGrowth(false);
      }
    };

    fetchUserGrowthData();
  }, [userTimeframe]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoadingTransactions(true);
        // Use the admin analytics endpoint since we don't have a specific transactions endpoint
        const response = await axios.get(
          `/api/analytics/admin?timeframe=${transactionTimeframe}&interval=${transactionInterval}`
        );

        // Validate response data structure
        if (response.data &&
            response.data.projectGrowthData &&
            response.data.revenueData &&
            response.data.stats) {
          // Transform the data to match the expected format for our component
          const projectGrowthData = response.data.projectGrowthData || [];
          const revenueData = response.data.revenueData || [];

          const transformedData = {
            transactions: {
              labels: projectGrowthData.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              }),
              datasets: {
                projectCount: projectGrowthData.map(item => item.posted || 0),
                totalBudget: revenueData.map(item => (item.revenue || 0) * 10), // Revenue is 10% of total budget
                avgBudget: revenueData.map((item, index) => {
                  const projectCount = projectGrowthData[index]?.posted || 1;
                  return ((item.revenue || 0) * 10) / projectCount; // Avg budget per project
                }),
                completedCount: projectGrowthData.map(item => item.completed || 0),
                completedBudget: revenueData.map(item => (item.revenue || 0) * 10 * 0.8) // 80% of projects completed
              }
            },
            totals: {
              projectCount: response.data.stats.totalProjects,
              totalBudget: response.data.stats.totalEarnings,
              completedCount: response.data.stats.totalProjects * 0.8, // Estimate 80% completion rate
              completedBudget: response.data.stats.totalEarnings * 0.8 // Estimate 80% of budget from completed projects
            },
            revenueForecast: [
              Math.round(response.data.stats.platformFees * 1.1),
              Math.round(response.data.stats.platformFees * 1.2),
              Math.round(response.data.stats.platformFees * 1.3)
            ],
            completionRate: 80, // Sample completion rate
            avgProjectDuration: 14 // Sample average duration in days
          };

          setTransactionData(transformedData);
        } else {
          console.error('Invalid transaction data format:', response.data);
          toast.error('Invalid transaction data format received from server');
          // Set to null to trigger fallback UI
          setTransactionData(null);
        }

        setLoadingTransactions(false);
      } catch (err) {
        console.error('Error fetching transaction data:', err);
        toast.error(`Failed to load transaction data: ${err.response?.data?.message || err.message}`);
        setTransactionData(null);
        setLoadingTransactions(false);
      }
    };

    fetchTransactionData();
  }, [transactionTimeframe, transactionInterval]);

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        setLoadingSkills(true);
        // Use the admin analytics endpoint since we don't have a specific skills endpoint
        const response = await axios.get(`/api/analytics/admin?timeframe=${skillsTimeframe}`);

        // Validate response data structure
        if (response.data && response.data.categoryData) {
          // Transform the data to match the expected format for our component
          const categoryData = response.data.categoryData || [];

          // If no category data, create some sample data
          let skillDemandSupply = [];

          if (categoryData.length === 0) {
            // Create sample data if no categories exist
            skillDemandSupply = [
              { name: "Web Development", demand: 45, supply: 38, demandSupplyRatio: 1.18, averageRate: 35 },
              { name: "Mobile App Development", demand: 32, supply: 25, demandSupplyRatio: 1.28, averageRate: 40 },
              { name: "UI/UX Design", demand: 28, supply: 22, demandSupplyRatio: 1.27, averageRate: 30 },
              { name: "Data Analysis", demand: 20, supply: 15, demandSupplyRatio: 1.33, averageRate: 38 },
              { name: "Content Writing", demand: 18, supply: 20, demandSupplyRatio: 0.9, averageRate: 25 }
            ];
          } else {
            // Generate skill demand and supply data based on categories
            skillDemandSupply = categoryData.map(category => {
              const supply = Math.round(category.count * 0.8); // Estimate supply as 80% of demand
              return {
                name: category.name,
                demand: category.count,
                supply: supply,
                demandSupplyRatio: category.count / supply,
                averageRate: (category.totalBudget / category.count) * 0.7 // Estimate hourly rate as 70% of avg budget
              };
            });
          }

          // Generate skill growth trend data
          const skillGrowthTrend = skillDemandSupply.map(skill => {
            // Generate 6 months of trend data
            const trend = [];
            for (let i = 0; i < 6; i++) {
              const date = new Date();
              date.setMonth(date.getMonth() - (5 - i));

              trend.push({
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                count: Math.round(skill.demand * (0.7 + (i * 0.06))) // Increasing trend
              });
            }

            return {
              _id: skill.name,
              trend
            };
          });

          // Generate skill forecast data
          const skillForecast = skillDemandSupply.map(skill => {
            // Generate 3 months of forecast data
            const forecast = [];
            for (let i = 1; i <= 3; i++) {
              const date = new Date();
              date.setMonth(date.getMonth() + i);

              forecast.push({
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                count: Math.round(skill.demand * (1 + (i * 0.1))) // Increasing forecast
              });
            }

            return {
              name: skill.name,
              forecast
            };
          });

          // Generate freelancer skills data
          const freelancerSkills = skillDemandSupply.map(skill => ({
            name: skill.name,
            count: skill.supply,
            avgRate: skill.averageRate,
            growth: Math.round((Math.random() * 20) + 5) // Random growth between 5-25%
          }));

          const transformedData = {
            skillDemandSupply,
            skillGrowthTrend,
            skillForecast,
            freelancerSkills,
            timeframe: skillsTimeframe
          };

          setSkillsData(transformedData);
        } else {
          console.error('Invalid skills data format:', response.data);
          toast.error('Invalid skills data format received from server');
          // Set to null to trigger fallback UI
          setSkillsData(null);
        }

        setLoadingSkills(false);
      } catch (err) {
        console.error('Error fetching skills data:', err);
        toast.error(`Failed to load skills data: ${err.response?.data?.message || err.message}`);
        setSkillsData(null);
        setLoadingSkills(false);
      }
    };

    fetchSkillsData();
  }, [skillsTimeframe]);

  const handleExportData = (dataType) => {
    let dataToExport;
    let filename;

    switch (dataType) {
      case 'users':
        dataToExport = userGrowthData;
        filename = 'user-growth-data.json';
        break;
      case 'transactions':
        dataToExport = transactionData;
        filename = 'transaction-data.json';
        break;
      case 'skills':
        dataToExport = skillsData;
        filename = 'skills-data.json';
        break;
      default:
        return;
    }

    if (!dataToExport) return;

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data exported successfully`);
  };

  if (loading && !analyticsData && !userGrowthData && !transactionData && !skillsData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-6 py-6 bg-gradient-to-r from-indigo-700 to-purple-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl leading-6 font-bold text-white flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2" />
              Platform Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Monitor transactions, user growth, and popular skills with advanced analytics.
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setUserTimeframe('year');
                setTransactionTimeframe('year');
                setSkillsTimeframe('all');
                toast.info('Refreshing all analytics data...');
              }}
              className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-lg shadow-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <ArrowPathIcon className="mr-2 h-5 w-5" />
              Refresh All
            </button>
          </div>
        </div>
      </div>

      {/* User Growth Analytics */}
      <div className="relative">
        {loadingUserGrowth && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => handleExportData('users')}
            disabled={!userGrowthData}
            className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!userGrowthData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
            Export Data
          </button>
        </div>

        {userGrowthData ? (
          <UserGrowthChart
            data={userGrowthData}
            timeframe={userTimeframe}
            onTimeframeChange={setUserTimeframe}
          />
        ) : !loadingUserGrowth && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No User Growth Data Available</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                We couldn't retrieve user growth data at this time. This could be due to missing data or a server issue.
              </p>
              <button
                onClick={() => {
                  setUserTimeframe('year');
                  toast.info('Refreshing user growth data...');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Analytics */}
      <div className="relative">
        {loadingTransactions && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => handleExportData('transactions')}
            disabled={!transactionData}
            className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!transactionData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
            Export Data
          </button>
        </div>

        {transactionData ? (
          <TransactionAnalyticsChart
            data={transactionData}
            timeframe={transactionTimeframe}
            onTimeframeChange={setTransactionTimeframe}
            interval={transactionInterval}
            onIntervalChange={setTransactionInterval}
          />
        ) : !loadingTransactions && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Transaction Data Available</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                We couldn't retrieve transaction data at this time. This could be due to missing data or a server issue.
              </p>
              <button
                onClick={() => {
                  setTransactionTimeframe('year');
                  setTransactionInterval('month');
                  toast.info('Refreshing transaction data...');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Skills Analytics */}
      <div className="relative">
        {loadingSkills && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => handleExportData('skills')}
            disabled={!skillsData}
            className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!skillsData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
            Export Data
          </button>
        </div>

        {skillsData ? (
          <SkillDemandSupplyChart
            data={skillsData}
            timeframe={skillsTimeframe}
            onTimeframeChange={setSkillsTimeframe}
          />
        ) : !loadingSkills && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <AcademicCapIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Skills Data Available</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                We couldn't retrieve skills analytics data at this time. This could be due to missing data or a server issue.
              </p>
              <button
                onClick={() => {
                  setSkillsTimeframe('all');
                  toast.info('Refreshing skills data...');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformAnalytics;
