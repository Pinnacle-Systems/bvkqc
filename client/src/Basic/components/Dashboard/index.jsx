import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import './Dashboard.css'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { useState } from "react";
import { 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    TrendingUp, 
    Users, 
    ClipboardCheck,
    Clock,
    BarChart3,
    PieChart,
    Shield,
    Target
} from "lucide-react";
import secureLocalStorage from "react-secure-storage";
import { Login } from "../../pages";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend, 
    ArcElement
);

export default function QCDashboard() {
    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    );

    // QC-focused data
    const qualityMetricsData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Defect Rate (%)",
                data: [2.1, 1.8, 1.5, 1.2, 0.9, 0.7],
                backgroundColor: "rgba(76, 175, 80, 0.8)",
                borderColor: "rgba(76, 175, 80, 1)",
                borderWidth: 2,
            },
            {
                label: "Target Defect Rate",
                data: [1.5, 1.5, 1.5, 1.5, 1.5, 1.5],
                backgroundColor: "rgba(244, 67, 54, 0.6)",
                borderColor: "rgba(244, 67, 54, 1)",
                borderWidth: 2,
                borderDash: [5, 5],
            },
        ],
    };

    const inspectionTrendData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Inspections Completed",
                data: [450, 520, 480, 600, 580, 650],
                fill: false,
                borderColor: "#2196F3",
                tension: 0.4,
                backgroundColor: "rgba(33, 150, 243, 0.1)",
            },
        ],
    };

    const defectDistributionData = {
        labels: ['Critical', 'Major', 'Minor', 'Cosmetic', 'False Positive'],
        datasets: [
            {
                data: [5, 15, 45, 30, 5],
                backgroundColor: [
                    '#FF6B6B',
                    '#FFA726',
                    '#42A5F5',
                    '#66BB6A',
                    '#BDBDBD'
                ],
                borderColor: [
                    '#FF5252',
                    '#FF9800',
                    '#2196F3',
                    '#4CAF50',
                    '#9E9E9E'
                ],
                borderWidth: 2,
            },
        ],
    };

    const qualityScoreData = {
        labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
        datasets: [
            {
                label: "Quality Score (%)",
                data: [98.2, 95.7, 99.1, 92.4, 96.8],
                backgroundColor: "rgba(41, 128, 185, 0.8)",
                borderColor: "rgba(41, 128, 185, 1)",
                borderWidth: 0,
                borderRadius: 4,
            },
        ],
    };

    // QC Cards Data
    const qcCardsData = [
        { 
            label: 'Quality Score', 
            value: '98.7%', 
            logo: <CheckCircle size={40} color={'#4CAF50'} />, 
            trend: 'up', 
            percentage: '2.3%',
            description: 'Overall quality rating'
        },
        { 
            label: 'Defect Rate', 
            value: '0.7%', 
            logo: <XCircle size={40} color={'#F44336'} />, 
            trend: 'down', 
            percentage: '1.1%',
            description: 'Below target of 1.5%'
        },
        { 
            label: 'Pending Inspections', 
            value: '24', 
            logo: <Clock size={40} color={'#FF9800'} />, 
            trend: 'down', 
            percentage: '8%',
            description: 'Awaiting QC review'
        },
        { 
            label: 'QC Staff Active', 
            value: '18/20', 
            logo: <Users size={40} color={'#2196F3'} />, 
            trend: 'stable', 
            percentage: '90%',
            description: 'Available inspectors'
        },
        { 
            label: 'Audits Completed', 
            value: '156', 
            logo: <ClipboardCheck size={40} color={'#9C27B0'} />, 
            trend: 'up', 
            percentage: '12%',
            description: 'This month'
        }
    ];

    // Recent QC Activities
    const recentActivities = [
        { product: "Batch #A-2387", status: "Approved", inspector: "John D.", time: "2 min ago", score: "99.2%" },
        { product: "Batch #B-8912", status: "Rejected", inspector: "Sarah M.", time: "15 min ago", score: "87.5%" },
        { product: "Batch #C-4567", status: "Approved", inspector: "Mike R.", time: "1 hour ago", score: "98.7%" },
        { product: "Batch #D-6734", status: "Pending", inspector: "Lisa T.", time: "2 hours ago", score: "-" },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                padding: 12,
                bodyFont: {
                    size: 12,
                },
                titleFont: {
                    size: 13,
                },
            },
        },
    };

    const barOptions = {
        indexAxis: "y",
        responsive: true,
        plugins: {
            legend: { 
                display: true,
                position: 'bottom'
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            },
            y: {
                categoryPercentage: 0.7,
                barPercentage: 0.8,
            },
        },
    };

    const doughnutOptions = {
        ...chartOptions,
        cutout: '60%',
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Approved': return 'text-green-600 bg-green-50';
            case 'Rejected': return 'text-red-600 bg-red-50';
            case 'Pending': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getTrendIcon = (trend) => {
        switch(trend) {
            case 'up': return <TrendingUp size={16} className="text-green-500" />;
            case 'down': return <TrendingUp size={16} className="text-red-500 transform rotate-180" />;
            case 'stable': return <BarChart3 size={16} className="text-blue-500" />;
            default: return <TrendingUp size={16} />;
        }
    };

    return (
        <>
            {userId ? (
                <div className="min-h-screen bg-gray-50 p-6">
                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                    <Shield className="mr-3 text-blue-600" size={32} />
                                    Quality Control Dashboard
                                </h1>
                                <p className="text-gray-600 mt-2">Real-time quality metrics and inspection insights</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Last updated</p>
                                    <p className="text-sm font-semibold">Just now</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        {qcCardsData.map((card, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.value}</h3>
                                        <div className="flex items-center space-x-1">
                                            {getTrendIcon(card.trend)}
                                            <span className={`text-xs font-medium ${
                                                card.trend === 'up' ? 'text-green-600' : 
                                                card.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                                            }`}>
                                                {card.percentage} {card.trend !== 'stable' && 'from last week'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                        {card.logo}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">{card.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Main Charts Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                        {/* Defect Rate Trend */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Defect Rate Trend</h3>
                                <Target className="text-blue-600" size={20} />
                            </div>
                            <div className="h-80">
                                <Line data={qualityMetricsData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Defect Distribution */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Defect Distribution</h3>
                                <PieChart className="text-purple-600" size={20} />
                            </div>
                            <div className="h-80">
                                <Doughnut data={defectDistributionData} options={doughnutOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Secondary Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Quality Scores */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Quality Scores</h3>
                            <div className="h-64">
                                <Bar data={qualityScoreData} options={barOptions} />
                            </div>
                        </div>

                        {/* Inspection Trend */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Inspection Completion Trend</h3>
                            <div className="h-64">
                                <Line data={inspectionTrendData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities & Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent QC Activities */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent QC Activities</h3>
                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full ${
                                                activity.status === 'Approved' ? 'bg-green-500' :
                                                activity.status === 'Rejected' ? 'bg-red-500' : 'bg-orange-500'
                                            }`}></div>
                                            <div>
                                                <p className="font-medium text-gray-900">{activity.product}</p>
                                                <p className="text-sm text-gray-500">by {activity.inspector}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
                                                {activity.status}
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                                            {activity.score !== '-' && (
                                                <p className="text-sm font-medium text-gray-700">Score: {activity.score}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">QC Performance</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="text-green-800 font-medium">First Pass Yield</span>
                                    <span className="text-green-800 font-bold">96.3%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="text-blue-800 font-medium">Avg. Inspection Time</span>
                                    <span className="text-blue-800 font-bold">12.4 min</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="text-purple-800 font-medium">Critical Issues</span>
                                    <span className="text-purple-800 font-bold">3</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="text-orange-800 font-medium">SLA Compliance</span>
                                    <span className="text-orange-800 font-bold">98.9%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <Login />
            )}
        </>
    );
}