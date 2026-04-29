import { 
  Utensils, 
  PlaneTakeoff, 
  Users, 
  Car, 
  ShoppingBag, 
  Ticket, 
  HeartPulse, 
  Hotel, 
  Ship,
  Calendar,
  Database,
  Search,
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, onSnapshot } from 'firebase/firestore';

const vasServices = [
  { id: 'lunch', name: 'Lunch in Center', icon: Utensils, quota: 'Monthly' },
  { id: 'airport-greet', name: 'Airport Meet and Greet', icon: PlaneTakeoff, quota: 'Per Request' },
  { id: 'meeting', name: 'Meeting in Center', icon: Users, quota: 'Hourly' },
  { id: 'limo', name: 'Airport Limousines', icon: Car, quota: 'Per Trip' },
  { id: 'lifestyle', name: 'Lifestyle Services', icon: ShoppingBag, quota: 'Per Event' },
  { id: 'ticket', name: 'Travel Ticket', icon: Ticket, quota: 'Per Request' },
  { id: 'health', name: 'Health Services', icon: HeartPulse, quota: 'Annual' },
  { id: 'hotel', name: 'Travel Hotel', icon: Hotel, quota: 'Per Stay' },
  { id: 'cruise', name: 'Travel Cruise', icon: Ship, quota: 'Per Request' },
  { id: 'annual-service', name: 'Annual Service', icon: Calendar, quota: 'Annual' },
  { id: 'request-base', name: 'Request Base', icon: Database, quota: 'Per Request' },
];

interface ServiceRequest {
  id: string;
  request_id: string;
  customer_name: string;
  service_type: string;
  status: string;
  priority: string;
  createdAt: any;
}

export default function ServiceRequest() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'queue'>('catalog');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [meetAndGreetType, setMeetAndGreetType] = useState('normal');
  const [serviceCost, setServiceCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminConfig] = useState({
    vipBasePrice: 10000,
    vipVendor: 'Premium Airport Services Ltd',
    standardBasePrice: 5000,
    standardVendor: 'Standard Greet Co.',
    availableLounges: [
      { id: 'none', label: 'None', price: 0 },
      { id: 'balaka', label: 'Balaka Executive Lounge (+BDT 2000)', price: 2000 },
      { id: 'mtb', label: 'MTB Air Lounge (+BDT 2500)', price: 2500 },
      { id: 'skylounge', label: 'Sky Lounge (+BDT 3000)', price: 3000 }
    ],
    porterOptions: [
      { id: 'yes', label: 'Yes - Dedicated Porter Included', price: 0 },
      { id: 'no', label: 'No - Exclude Porter Service', price: 0 },
      { id: 'extra', label: 'Yes - Extra Porter (+BDT 1000)', price: 1000 }
    ],
    fastTrackOptions: [
      { id: 'yes', label: 'Yes - Fast-Track Enabled', price: 0 },
      { id: 'no', label: 'No - Standard Immigration', price: 0 },
      { id: 'vip_lane', label: 'Yes - VIP Lane Access (+BDT 1500)', price: 1500 }
    ]
  });

  const [selectedLounge, setSelectedLounge] = useState('none');
  const [selectedPorter, setSelectedPorter] = useState('yes');
  const [selectedFastTrack, setSelectedFastTrack] = useState('yes');

  useEffect(() => {
    let cost = meetAndGreetType === 'vip' ? adminConfig.vipBasePrice : adminConfig.standardBasePrice;
    
    if (meetAndGreetType === 'vip') {
      const loungeOpt = adminConfig.availableLounges.find(l => l.id === selectedLounge);
      if (loungeOpt) cost += loungeOpt.price;
      
      const porterOpt = adminConfig.porterOptions.find(p => p.id === selectedPorter);
      if (porterOpt) cost += porterOpt.price;

      const ftOpt = adminConfig.fastTrackOptions.find(f => f.id === selectedFastTrack);
      if (ftOpt) cost += ftOpt.price;
    }
    
    setServiceCost(cost.toString());
  }, [meetAndGreetType, adminConfig, selectedLounge, selectedPorter, selectedFastTrack]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'serviceRequests'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: ServiceRequest[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as ServiceRequest);
      });
      setRequests(data);
    });
    return () => unsub();
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchesService = serviceTypeFilter ? req.service_type === serviceTypeFilter : true;
    const matchesPriority = priorityFilter ? req.priority === priorityFilter : true;
    const matchesStatus = statusFilter ? req.status === statusFilter : true;
    const matchesSearch = searchTerm ? 
      req.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchesService && matchesPriority && matchesStatus && matchesSearch;
  });

  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    try {
      const serviceName = vasServices.find(s => s.id === selectedService)?.name || 'Service Request';
      
      const newRequest = {
        request_id: `VAS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        customer_name: 'Customer Name Placeholder', // In a real app this would come from form data
        service_type: selectedService,
        status: 'pending',
        priority: 'medium',
        createdAt: serverTimestamp(),
        cost: serviceCost
      };
      
      const docRef = await addDoc(collection(db, 'serviceRequests'), newRequest);
      
      // Auto-generated email to stakeholders
      await addDoc(collection(db, 'mail'), {
        to: ['vendor@example.com', 'rm@bankasia-bd.com', 'service.rm@bankasia-bd.com', 'bdt@bankasia-bd.com', 'head.priority@bankasia-bd.com', 'customer@example.com'],
        message: {
          subject: `New Service Request Created: ${newRequest.request_id}`,
          text: `A new service request for ${serviceName} has been created for ${newRequest.customer_name}. Request ID: ${newRequest.request_id}`,
          html: `<div><p>A new service request for <strong>${serviceName}</strong> has been created for <strong>${newRequest.customer_name}</strong>.</p><p>Request ID: ${newRequest.request_id}</p></div>`
        },
        createdAt: serverTimestamp()
      });
      
      // Service confirmation text to customer
      await addDoc(collection(db, 'sms'), {
        to: '+8801234567890', // placeholder number
        body: `Dear customer, your service request ${newRequest.request_id} for ${serviceName} has been received. Thank you for choosing Bank Asia Priority.`,
        createdAt: serverTimestamp()
      });
      
      alert('Request submitted successfully!');
      setSelectedService(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderFormContent = () => {
    if (selectedService === 'airport-greet') {
      return (
        <div className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#D4AF37]/30" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Customer ID/Code</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={14} />
                  <input placeholder="Search Customer..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Customer Name</label>
                <input readOnly value="" placeholder="Auto-filled" className="w-full px-4 py-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-sm text-[#334155] font-medium outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Current Balance</label>
                <input readOnly value="" placeholder="$0.00" className="w-full px-4 py-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-sm text-[#334155] font-medium outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Last 6 Months Avg Balance</label>
                <input readOnly value="" placeholder="$0.00" className="w-full px-4 py-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-sm text-[#334155] font-medium outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Branch Name</label>
                <input readOnly value="" placeholder="Auto-filled" className="w-full px-4 py-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-sm text-[#334155] font-medium outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Priority Center Name</label>
                <input readOnly value="" placeholder="Auto-filled" className="w-full px-4 py-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-sm text-[#334155] font-medium outline-none" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Customer Contact Number</label>
                <input className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">RM Name & Contact</label>
                <input readOnly value="" placeholder="Auto-filled" className="w-full px-4 py-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-sm text-[#334155] font-medium outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#D4AF37]/30" />
              Service Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Service Type</label>
                <div className="flex bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-1 w-full">
                  <button
                    type="button"
                    onClick={() => setMeetAndGreetType('normal')}
                    className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-all ${meetAndGreetType === 'normal' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeetAndGreetType('vip')}
                    className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-all ${meetAndGreetType === 'vip' ? 'bg-[#D4AF37] text-white shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                  >
                    VIP
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Service Request Date</label>
                <input type="date" readOnly value={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-sm text-[#334155] font-medium outline-none cursor-not-allowed" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Service Date</label>
                <input type="date" className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Service Cost</label>
                <input 
                  type="number"
                  value={serviceCost}
                  onChange={(e) => setServiceCost(e.target.value)}
                  placeholder="Enter Cost"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Service Time From</label>
                <input type="time" className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Service Time To</label>
                <input type="time" className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Flight Number</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Airlines</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">No of Passenger/s</label>
                <input type="number" min="1" className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">No of Luggages (Optional)</label>
                <input type="number" min="0" className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Passenger/s Name</label>
                <input type="text" placeholder="John Doe, Jane Doe" className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
              </div>
              
              <div className="space-y-1.5 col-span-2">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Pick Up/Drop Off Address</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm resize-none"></textarea>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Emergency Contact Person & Details</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#D4AF37]/30" />
              Additional Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Special Instruction</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm resize-none"></textarea>
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Remarks</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm resize-none"></textarea>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Deviation Approval Required?</label>
                <select className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm">
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="space-y-1.5 col-span-2 mt-4">
                <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.1em] ml-1">Pricing & Vendor Information</label>
                {meetAndGreetType === 'vip' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-[#D4AF37]/10 to-[#F8FAFC] border border-[#D4AF37]/30 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#D4AF37] rounded-lg text-white">
                          <PlaneTakeoff size={14} />
                        </div>
                        <span className="text-xs font-bold text-[#334155] uppercase tracking-wider">VIP Service Parameters</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 ml-10">
                        <div>
                          <p className="text-[10px] uppercase text-[#94A3B8] font-bold">Base Price</p>
                          <p className="text-sm font-semibold text-[#0F172A]">BDT {adminConfig.vipBasePrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-[#94A3B8] font-bold">Vendor</p>
                          <p className="text-sm font-semibold text-[#0F172A]">{adminConfig.vipVendor}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] uppercase text-[#94A3B8] font-bold">Inclusions</p>
                          <p className="text-xs font-medium text-[#64748B]">Premium Lounge Access, Dedicated Porter, Fast-Track Immigration</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
                      <h3 className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">VIP Service Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Specific Lounge Access</label>
                          <select 
                            value={selectedLounge}
                            onChange={(e) => setSelectedLounge(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm"
                          >
                            {adminConfig.availableLounges.map(lounge => (
                              <option key={lounge.id} value={lounge.id}>{lounge.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Dedicated Porter</label>
                          <select 
                            value={selectedPorter}
                            onChange={(e) => setSelectedPorter(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm"
                          >
                            {adminConfig.porterOptions.map(option => (
                              <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Fast-Track Immigration</label>
                          <select 
                            value={selectedFastTrack}
                            onChange={(e) => setSelectedFastTrack(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm"
                          >
                            {adminConfig.fastTrackOptions.map(option => (
                              <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
                      <h3 className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">Vendor Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Vendor Name</label>
                          <input type="text" defaultValue={adminConfig.vipVendor} className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Contact Person</label>
                          <input type="text" placeholder="Manager Name" className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Contact Number</label>
                          <input type="text" placeholder="+880..." className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#E2E8F0] rounded-lg text-[#64748B]">
                        <PlaneTakeoff size={14} />
                      </div>
                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Standard Service Parameters</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 ml-10">
                      <div>
                        <p className="text-[10px] uppercase text-[#94A3B8] font-bold">Base Price</p>
                        <p className="text-sm font-semibold text-[#0F172A]">BDT {adminConfig.standardBasePrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-[#94A3B8] font-bold">Vendor</p>
                        <p className="text-sm font-semibold text-[#0F172A]">{adminConfig.standardVendor}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase text-[#94A3B8] font-bold">Inclusions</p>
                        <p className="text-xs font-medium text-[#64748B]">Standard Meet and Greet, Shared Porter (subject to availability)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default form for other services
    return (
      <div className="space-y-10">
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#D4AF37]/30" />
            Customer Identification
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Customer CB No.</label>
              <input placeholder="Enter CB Number" className="w-full px-6 py-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Service Ref No.</label>
              <input readOnly value="CBL/PBMS/LNCH/1110" className="w-full px-6 py-4 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] text-sm text-[#94A3B8] font-mono cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#D4AF37]/30" />
            Request Details
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Request Date & Time</label>
              <input type="datetime-local" className="w-full px-6 py-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Preferred Center</label>
              <select className="w-full px-6 py-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm outline-none">
                <option>Gulshan Center</option>
                <option>Banani Center</option>
                <option>Dhanmondi Center</option>
              </select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Special Requirements</label>
              <textarea rows={3} placeholder="Dietary restrictions, preferences etc." className="w-full px-6 py-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm outline-none resize-none" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold text-[#0F172A]">Service Request (VAS)</h1>
        <p className="text-[#64748B]">Manage value added services and customer experience workflows.</p>
      </div>

      {/* Internal Navigation */}
      <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'catalog' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Service Catalog
        </button>
        <button 
          onClick={() => setActiveTab('queue')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'queue' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Live Request Queue
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'catalog' ? (
          <motion.div 
            key="catalog"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {vasServices.map((service, i) => (
              <motion.button
                key={service.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedService(service.id)}
                className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all text-left flex flex-col group justify-between h-[220px]"
              >
                <div>
                  <div className="w-14 h-14 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#94A3B8] group-hover:bg-[#0F172A] group-hover:text-[#D4AF37] transition-all mb-6">
                    <service.icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1">{service.name}</h3>
                  <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">{service.quota}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">New entry</span>
                  <div className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] group-hover:bg-[#D4AF37] group-hover:text-white transition-all">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="queue"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-[#F1F5F9] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-bold text-[#0F172A]">Request Tracking</h2>
              <div className="flex flex-wrap items-center gap-2">
                <select 
                  className="px-3 py-2 bg-[#F8FAFC] rounded-xl text-xs border-none outline-none font-bold text-[#64748B]"
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                >
                  <option value="">All Services</option>
                  {vasServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select 
                  className="px-3 py-2 bg-[#F8FAFC] rounded-xl text-xs border-none outline-none font-bold text-[#64748B]"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select 
                  className="px-3 py-2 bg-[#F8FAFC] rounded-xl text-xs border-none outline-none font-bold text-[#64748B]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                  <input 
                    placeholder="Search..." 
                    className="pl-9 pr-4 py-2 bg-[#F8FAFC] rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-[#D4AF37]/20 w-48" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left ">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] w-[140px]">Ref No.</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Customer</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Service</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Priority</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-[#FDFCFB] transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs font-bold text-[#334155]">{req.request_id}</span>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-[#0F172A]">{req.customer_name}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <PlaneTakeoff size={14} className="text-[#94A3B8]" />
                          <span className="text-sm text-[#64748B]">{vasServices.find(s => s.id === req.service_type)?.name || req.service_type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            req.priority === 'high' ? 'bg-red-50 text-red-700' : 
                            req.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                        }`}>
                            {req.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">{req.status || 'Pending'}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="text-sm font-bold text-[#D4AF37] hover:underline">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry Modal Overlay (Conceptual) */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-[#F1F5F9] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0F172A] rounded-2xl text-[#D4AF37]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#0F172A]">Entry: {vasServices.find(s => s.id === selectedService)?.name}</h2>
                    <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mt-1">Capture customer request details</p>
                  </div>
                </div>
                <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-[#F1F5F9] rounded-xl transition-colors">
                  <PlusCircle className="rotate-45 text-[#94A3B8]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-10">
                {renderFormContent()}
              </div>

              <div className="p-8 border-t border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-end gap-4">
                <button 
                  onClick={() => setSelectedService(null)}
                  className="px-8 py-4 text-sm font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-[#0F172A] text-[#D4AF37] rounded-2xl font-bold flex items-center gap-3 hover:shadow-xl hover:shadow-[#D4AF37]/10 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  {!isSubmitting && <ChevronRight size={18} />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
