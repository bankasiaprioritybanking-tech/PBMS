import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Target, DollarSign, Activity, Users, Settings, Filter } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

// Placeholder data - in a real app this would be derived from Firestore collections
const businessData = [
  { name: 'Jan', requests: 40, success: 35 },
  { name: 'Feb', requests: 50, success: 42 },
  { name: 'Mar', requests: 30, success: 28 },
  { name: 'Apr', requests: 60, success: 55 },
];

const serviceTypeData = [
  { name: 'Meet & Greet', value: 400 },
  { name: 'Lounge Access', value: 300 },
  { name: 'Concierge', value: 300 },
  { name: 'Finance Consult', value: 200 },
];

const serviceCostData = [
  { name: 'Meet & Greet', cost: 1200, category: 'on_request', type: 'meet_greet', createdAt: '2026-01-15' },
  { name: 'Lounge Access', cost: 800, category: 'on_request', type: 'lounge_access', createdAt: '2026-02-10' },
  { name: 'Concierge', cost: 900, category: 'annual_service', type: 'concierge', createdAt: '2026-03-05' },
  { name: 'Finance Consult', cost: 1500, category: 'coupon_based', type: 'finance_consult', createdAt: '2026-04-01' },
];

const depositReportData = [
  {
    center: 'Gulshan Priority Center',
    employees: [
      { id: '004660', name: 'Sabiha Nigar Dristy (AVP)', dec25: 64.01, feb16: 69.31, feb17: 319.3, growthDay: 250.0, growthYtd: 255.29, yearlyBudget: 425, ytdBudget: 70.83, achievement: '360.41%' },
      { id: '004616', name: 'Sultana Perven Prianka (EO)', dec25: 11.76, feb16: 11.99, feb17: 11.97, growthDay: -0.02, growthYtd: 0.20, yearlyBudget: 320, ytdBudget: 53.33, achievement: '0.38%' },
      { id: '004659', name: 'Md Salman Rahman (SO)', dec25: 26.66, feb16: 27.75, feb17: 29.14, growthDay: 1.40, growthYtd: 2.49, yearlyBudget: 200, ytdBudget: 33.33, achievement: '7.46%' },
    ],
    total: { dec25: 169.61, feb16: 182.86, feb17: 434.23, growthDay: 251.37, growthYtd: 264.62, yearlyBudget: 1905.0, ytdBudget: 317.50, achievement: '83.34%' }
  },
  {
    center: 'Tejgaon Link Road Priority Center',
    employees: [
      { id: '004657', name: 'Sonya Sarker (FVP)', dec25: 40.69, feb16: 38.40, feb17: 48.51, growthDay: 10.11, growthYtd: 7.82, yearlyBudget: 425, ytdBudget: 70.83, achievement: '11.05%' },
      { id: '004656', name: 'Shimu Ziasmin (FAVP)', dec25: 37.69, feb16: 39.51, feb17: 39.49, growthDay: -0.02, growthYtd: 1.80, yearlyBudget: 360, ytdBudget: 60.0, achievement: '3.00%' },
    ],
    total: { dec25: 177.87, feb16: 174.03, feb17: 184.42, growthDay: 10.38, growthYtd: 6.54, yearlyBudget: 1805, ytdBudget: 300.83, achievement: '2.18%' }
  }
];

const staffPerformanceData = [
  { name: 'Sabiha Nigar Dristy', totalRequests: 50, avgResolutionTime: 4.5, successRate: 98 },
  { name: 'Sultana Perven Prianka', totalRequests: 35, avgResolutionTime: 5.2, successRate: 92 },
  { name: 'Md Salman Rahman', totalRequests: 45, avgResolutionTime: 3.8, successRate: 95 },
  { name: 'Sonya Sarker', totalRequests: 60, avgResolutionTime: 3.2, successRate: 99 },
];

const COLORS = ['#0F172A', '#D4AF37', '#94A3B8', '#F1F5F9'];

export default function Reports() {
  const [reportType, setReportType] = useState('performance');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  const stats = [
    { title: 'Total Service Requests', value: '180', icon: Activity, change: '+12%' },
    { title: 'Avg Service Cost', value: '$250', icon: DollarSign, change: '-5%' },
    { title: 'Performance Index', value: '94%', icon: Target, change: '+2%' },
    { title: 'Active Staff Users', value: '12', icon: Users, change: '0' },
  ];

  const filteredCostData = serviceCostData.filter(item => 
    (categoryFilter === 'all' || item.category === categoryFilter) &&
    (serviceTypeFilter === 'all' || item.type === serviceTypeFilter) &&
    (item.createdAt >= startDate && item.createdAt <= endDate)
  );

  const aggregatedData = filteredCostData.reduce((acc, item) => {
    const key = `${item.category}-${item.type}`;
    if (!acc[key]) {
      acc[key] = { category: item.category, type: item.type, totalCost: 0 };
    }
    acc[key].totalCost += item.cost;
    return acc;
  }, {} as Record<string, { category: string; type: string; totalCost: number }>);

  const aggregatedArray = Object.values(aggregatedData);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics & Reporting"
        description="Monitor business performance, service costs, and staff efficiency."
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#F8FAFC] rounded-xl text-[#0F172A]">
                <stat.icon size={20} />
              </div>
              <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</span>
            </div>
            <h3 className="text-sm font-bold text-[#64748B]">{stat.title}</h3>
            <p className="text-2xl font-bold text-[#0F172A] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
          <h3 className="text-lg font-bold text-[#0F172A] mb-6">Business Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={businessData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="#0F172A" name="Total Requests" />
                <Bar dataKey="success" fill="#D4AF37" name="Successful Availed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
          <h3 className="text-lg font-bold text-[#0F172A] mb-6">Service Type Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Service Request Activity by User */}
      <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
        <h3 className="text-lg font-bold text-[#0F172A] mb-6">Service Request Activity by User</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#64748B] font-bold uppercase">
                <th className="p-3">User Name</th>
                <th className="p-3">Total Requests</th>
                <th className="p-3">Avg Resolution Time (hrs)</th>
                <th className="p-3 text-right">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {staffPerformanceData.map((item, i) => (
                <tr key={i} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]">
                  <td className="p-3 font-medium text-[#0F172A]">{item.name}</td>
                  <td className="p-3">{item.totalRequests}</td>
                  <td className="p-3">{item.avgResolutionTime} hrs</td>
                  <td className="p-3 text-right font-bold text-[#D4AF37]">{item.successRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Service Cost Report */}
      <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#0F172A]">Service Cost Report</h3>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#94A3B8]" />
            <input 
              type="date"
              className="px-4 py-2 bg-[#F8FAFC] rounded-xl text-sm font-bold text-[#64748B] border-none outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input 
              type="date"
              className="px-4 py-2 bg-[#F8FAFC] rounded-xl text-sm font-bold text-[#64748B] border-none outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#64748B]">Category:</label>
              <select 
                className="px-4 py-2 bg-[#F8FAFC] rounded-xl text-sm font-bold text-[#64748B] border-none outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="on_request">On Request</option>
                <option value="annual_service">Annual Service</option>
                <option value="coupon_based">Coupon Based</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#64748B]">Type:</label>
              <select 
                className="px-4 py-2 bg-[#F8FAFC] rounded-xl text-sm font-bold text-[#64748B] border-none outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="meet_greet">Meet & Greet</option>
                <option value="lounge_access">Lounge Access</option>
                <option value="concierge">Concierge</option>
                <option value="finance_consult">Finance Consult</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredCostData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
              <Bar dataKey="cost" fill="#D4AF37" name="Service Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#64748B] font-bold uppercase">
                <th className="p-3">Service Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredCostData.map((item, i) => (
                <tr key={i} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]">
                  <td className="p-3 font-medium text-[#0F172A]">{item.name}</td>
                  <td className="p-3 capitalize">{item.category.replace('_', ' ')}</td>
                  <td className="p-3">{item.createdAt}</td>
                  <td className="p-3 text-right font-bold text-[#0F172A]">${item.cost}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#E2E8F0] font-bold">
                <td colSpan={3} className="p-3 text-right">Total</td>
                <td className="p-3 text-right text-[#D4AF37]">
                  ${filteredCostData.reduce((acc, curr) => acc + curr.cost, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Aggregated Cost Report */}
      <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
        <h3 className="text-lg font-bold text-[#0F172A] mb-6">Aggregated Service Costs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#64748B] font-bold uppercase">
                <th className="p-3">Category</th>
                <th className="p-3">Service Type</th>
                <th className="p-3 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedArray.map((item, i) => (
                <tr key={i} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]">
                  <td className="p-3 capitalize">{item.category.replace('_', ' ')}</td>
                  <td className="p-3 capitalize">{item.type.replace('_', ' ')}</td>
                  <td className="p-3 text-right font-bold text-[#0F172A]">${item.totalCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#0F172A]">Detailed Logs</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] text-[#0F172A] rounded-xl font-bold text-sm hover:bg-[#E2E8F0] transition-colors">
            <Settings size={16} /> Configure Reporting Thresholds
          </button>
        </div>
        <p className="text-sm text-[#64748B]">Logical reporting data for service costs, user efficiency, and department-specific performance are generated here.</p>
      </div>

      {/* Deposit Movement Report */}
      <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-x-auto">
        <h3 className="text-lg font-bold text-[#0F172A] mb-6">Priority Banking Daily & YTD Deposit Movement Report</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#F8FAFC] text-[#64748B] font-bold uppercase">
              <th className="p-3">Employee ID</th>
              <th className="p-3">Employee Name</th>
              <th className="p-3">Dec 25</th>
              <th className="p-3">16-Feb</th>
              <th className="p-3">17-Feb</th>
              <th className="p-3">Growth (Day)</th>
              <th className="p-3">Growth (YTD)</th>
              <th className="p-3">Budget (Yearly)</th>
              <th className="p-3">Budget (YTD)</th>
              <th className="p-3">Achievement</th>
            </tr>
          </thead>
          <tbody>
            {depositReportData.map((center, i) => (
              <React.Fragment key={i}>
                <tr className="bg-[#E2E8F0] font-bold text-[#0F172A]">
                  <td colSpan={10} className="p-2">{center.center}</td>
                </tr>
                {center.employees.map((emp, j) => (
                  <tr key={j} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="p-3">{emp.id}</td>
                    <td className="p-3 font-medium">{emp.name}</td>
                    <td className="p-3">{emp.dec25}</td>
                    <td className="p-3">{emp.feb16}</td>
                    <td className="p-3">{emp.feb17}</td>
                    <td className={`p-3 ${emp.growthDay < 0 ? 'text-red-500' : 'text-emerald-600'}`}>{emp.growthDay}</td>
                    <td className={`p-3 ${emp.growthYtd < 0 ? 'text-red-500' : 'text-emerald-600'}`}>{emp.growthYtd}</td>
                    <td className="p-3">{emp.yearlyBudget}</td>
                    <td className="p-3">{emp.ytdBudget}</td>
                    <td className="p-3 font-bold">{emp.achievement}</td>
                  </tr>
                ))}
                <tr className="bg-[#F1F5F9] font-bold text-[#0F172A]">
                  <td colSpan={2} className="p-3 text-right">Total</td>
                  <td className="p-3">{center.total.dec25}</td>
                  <td className="p-3">{center.total.feb16}</td>
                  <td className="p-3">{center.total.feb17}</td>
                  <td className="p-3">{center.total.growthDay}</td>
                  <td className="p-3">{center.total.growthYtd}</td>
                  <td className="p-3">{center.total.yearlyBudget}</td>
                  <td className="p-3">{center.total.ytdBudget}</td>
                  <td className="p-3">{center.total.achievement}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
