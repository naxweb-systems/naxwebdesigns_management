import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./Auth";
import { 
  Printer, Mail, MessageCircle, Save, Home, Key, Briefcase, Receipt, 
  StickyNote, ChevronRight, Edit3, Phone, Smartphone, Globe, Building2, 
  Trash2, Eye, EyeOff, Copy, Plus, AlertCircle, CheckCircle2, Info, 
  Search, Pin, TrendingUp, Clock, Download, Upload, LayoutDashboard, 
  Users, DollarSign, Settings, User, Menu, RefreshCw, PlusCircle,
  ArrowUpRight, ArrowDownRight, Wallet, X, MinusCircle, CalendarDays, Sparkles, Send, ExternalLink
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, 
  Bar, Pie, Cell, PieChart as RechartsPie 
} from "recharts";


const INITIAL_SETTINGS = {
  businessName: "My Freelance Studio",
  ownerName: "User",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  logo: "",
  taxRate: 0,
  currency: "USD",
  paymentTerms: "Payment due within 30 days.",
  bankDetails: "",
  theme: "light"
};

// ─── SAMPLE DATA ───────────────────────────────────────────────

// ─── UTILITIES ─────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n, cur = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const currentMonth = () => new Date().toISOString().slice(0, 7);
const initials = (name) => name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";

const COLORS = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#1e3a8a", "#2563eb"];
const STATUS_COLORS = { Active: "bg-emerald-100 text-emerald-700", Inactive: "bg-gray-100 text-gray-600", "On Hold": "bg-amber-100 text-amber-700" };
const INV_COLORS = { Paid: "bg-emerald-100 text-emerald-700", Sent: "bg-blue-100 text-blue-700", Draft: "bg-gray-100 text-gray-600", Overdue: "bg-red-100 text-red-700" };
const SAL_COLORS = { Received: "bg-emerald-100 text-emerald-700", Pending: "bg-amber-100 text-amber-700", Overdue: "bg-red-100 text-red-700" };


// ─── TOAST ─────────────────────────────────────────────────────
let _setToasts = null;
const toast = (msg, type = "success") => { if (_setToasts) _setToasts(p => [...p, { id: uid(), msg, type }]); };

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { _setToasts = setToasts; }, []);
  useEffect(() => {
    if (toasts.length) { const t = setTimeout(() => setToasts(p => p.slice(1)), 3000); return () => clearTimeout(t); }
  }, [toasts]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white animate-slide-in ${t.type === "error" ? "bg-red-500" : t.type === "warning" ? "bg-amber-500" : "bg-blue-600"}`}>
          {t.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── MODAL ─────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-blue-950/30 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-4xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-blue-50">
          <h2 className="text-lg font-semibold text-blue-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-50 rounded-lg text-blue-400 hover:text-blue-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── CONFIRM ───────────────────────────────────────────────────
function Confirm({ open, onClose, onConfirm, message }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Action">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600">Delete</button>
      </div>
    </Modal>
  );
}

// ─── INPUT COMPONENT ───────────────────────────────────────────
const Input = ({ label, error, className = "", ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-blue-700 uppercase tracking-wider">{label}</label>}
    <input className={`w-full px-3 py-2.5 rounded-lg border ${error ? "border-red-300" : "border-blue-100"} bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 text-sm ${className}`} {...props} />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-blue-700 uppercase tracking-wider">{label}</label>}
    <select className="w-full px-3 py-2.5 rounded-lg border border-blue-100 bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 text-sm" {...props}>{children}</select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-blue-700 uppercase tracking-wider">{label}</label>}
    <textarea className="w-full px-3 py-2.5 rounded-lg border border-blue-100 bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 text-sm resize-none" rows={4} {...props} />
  </div>
);

// ─── BADGE ─────────────────────────────────────────────────────
const Badge = ({ label, color }) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;

// ─── STAT CARD ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "blue", trend }) {
  const colors = {
    blue: "bg-blue-600 text-white",
    green: "bg-emerald-500 text-white",
    amber: "bg-amber-500 text-white",
    red: "bg-red-500 text-white"
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-blue-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={20} /></div>
    </div>
  );
}

// ─── AVATAR ────────────────────────────────────────────────────
const Avatar = ({ name, size = "md" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };
  const hues = ["bg-blue-600", "bg-blue-700", "bg-blue-800", "bg-blue-500", "bg-indigo-600"];
  const h = hues[name?.charCodeAt(0) % hues.length] || "bg-blue-600";
  return <div className={`${sizes[size]} ${h} rounded-xl flex items-center justify-center font-bold text-white shrink-0`}>{initials(name)}</div>;
};

// ═══════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
function DashboardPage({ clients, settings, setPage, setSelectedClient }) {
  const cur = settings.currency || "USD";
  const cm = currentMonth();

  const totalRevenue = clients.reduce((s, c) => s + (c.monthlySalary || 0), 0);
  const receivedThisMonth = clients.reduce((s, c) => {
    const h = c.salaryHistory?.find(x => x.month === cm);
    return s + (h?.status === "Received" ? c.monthlySalary : 0);
  }, 0);
  const pendingCount = clients.reduce((s, c) => {
    const allInv = c.invoices || [];
    return s + allInv.filter(i => i.status === "Sent" || i.status === "Overdue").length;
  }, 0);
  const pendingAmount = clients.reduce((s, c) => {
    return s + (c.invoices || []).filter(i => i.status === "Sent" || i.status === "Overdue").reduce((x, i) => x + i.total, 0);
  }, 0);

  const monthlyData = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m, i) => ({
    month: m,
    revenue: [5200, 6100, 5800, 7200, 6800, 7500][i],
    received: [5200, 6100, 5800, 7200, 6400, receivedThisMonth][i]
  }));

  const pieData = clients.map(c => ({ name: c.companyName, value: c.monthlySalary }));

  const serviceMap = {};
  clients.forEach(c => (c.services || []).forEach(s => { serviceMap[s] = (serviceMap[s] || 0) + 1; }));
  const serviceData = Object.entries(serviceMap).map(([name, value]) => ({ name, value }));

  const pendingClients = clients.filter(c => {
    const h = c.salaryHistory?.find(x => x.month === cm);
    return !h || h.status === "Pending";
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Good morning, {settings.ownerName?.split(" ")[0]} 👋</h1>
          <p className="text-blue-400 text-sm mt-0.5">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
        <button onClick={() => setPage("new-client")} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-blue-200 transition-all">
          <Plus size={16} /> New Client
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Clients" value={clients.filter(c => c.status === "Active").length} sub={`${clients.length} total`} color="blue" />
        <StatCard icon={Wallet} label="Monthly Revenue" value={fmt(totalRevenue, cur)} sub={`${fmt(receivedThisMonth, cur)} received`} color="green" trend={8} />
        <StatCard icon={Receipt} label="Pending Invoices" value={pendingCount} sub={fmt(pendingAmount, cur)} color="amber" />
        <StatCard icon={DollarSign} label="Not Received" value={pendingClients.length} sub="clients this month" color={pendingClients.length > 0 ? "red" : "green"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
          <h3 className="text-sm font-semibold text-blue-900 mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eff6ff" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#93c5fd" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#93c5fd" }} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip formatter={(v) => fmt(v, cur)} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(30,64,175,0.12)" }} />
              <Bar dataKey="revenue" fill="#bfdbfe" radius={[6, 6, 0, 0]} name="Expected" />
              <Bar dataKey="received" fill="#2563eb" radius={[6, 6, 0, 0]} name="Received" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
          <h3 className="text-sm font-semibold text-blue-900 mb-4">Revenue by Client</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RechartsPie>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v, cur)} contentStyle={{ borderRadius: 12, border: "none" }} />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-500">{p.name}</span>
                </div>
                <span className="font-medium text-blue-900">{fmt(p.value, cur)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
          <h3 className="text-sm font-semibold text-blue-900 mb-4">Salary Status — {new Date().toLocaleString("default", { month: "long", year: "numeric" })}</h3>
          <div className="space-y-3">
            {clients.map(c => {
              const h = c.salaryHistory?.find(x => x.month === cm);
              const st = h?.status || "Pending";
              return (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => { setSelectedClient(c); setPage("client-detail"); }}>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.companyName} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">{c.companyName}</p>
                      <p className="text-xs text-gray-400">{c.contactName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-blue-900">{fmt(c.monthlySalary, cur)}</span>
                    <Badge label={st} color={SAL_COLORS[st]} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
          <h3 className="text-sm font-semibold text-blue-900 mb-4">Recent Clients</h3>
          <div className="space-y-3">
            {clients.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => { setSelectedClient(c); setPage("client-detail"); }}>
                <div className="flex items-center gap-3">
                  <Avatar name={c.companyName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{c.companyName}</p>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {(c.services || []).slice(0, 2).map((s, i) => <span key={i} className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-blue-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CLIENTS PAGE
// ═══════════════════════════════════════════════════════════════
function ClientsPage({ clients, settings, setPage, setSelectedClient, onAddClient }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("name");
  const cur = settings.currency || "USD";

  const filtered = clients
    .filter(c => filter === "All" || c.status === filter)
    .filter(c => c.companyName.toLowerCase().includes(search.toLowerCase()) || c.contactName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "name" ? a.companyName.localeCompare(b.companyName) : sort === "revenue" ? b.monthlySalary - a.monthlySalary : 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Clients</h1>
        <button onClick={() => setPage("new-client")} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-blue-200 transition-all">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-blue-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Inactive", "On Hold"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === f ? "bg-blue-600 text-white" : "bg-white text-blue-500 border border-blue-100 hover:bg-blue-50"}`}>{f}</button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2 rounded-xl border border-blue-100 bg-white text-sm text-blue-700 focus:outline-none">
          <option value="name">Sort: Name</option>
          <option value="revenue">Sort: Revenue</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-blue-50">
          <Users size={40} className="text-blue-200 mx-auto mb-3" />
          <p className="text-blue-400 font-medium">No clients found</p>
          <p className="text-blue-200 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => {
            const cm = currentMonth();
            const sal = c.salaryHistory?.find(x => x.month === cm);
            const salSt = sal?.status || "Pending";
            const pendingInv = (c.invoices || []).filter(i => i.status === "Sent" || i.status === "Overdue").length;
            return (
              <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group" onClick={() => { setSelectedClient(c); setPage("client-detail"); }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.companyName} size="md" />
                    <div>
                      <p className="font-semibold text-blue-900 group-hover:text-blue-600 transition-colors">{c.companyName}</p>
                      <p className="text-xs text-gray-400">{c.contactName}</p>
                    </div>
                  </div>
                  <Badge label={c.status} color={STATUS_COLORS[c.status]} />
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {(c.services || []).map((s, i) => <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
                <div className="border-t border-blue-50 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Monthly</p>
                    <p className="text-lg font-bold text-blue-900">{fmt(c.monthlySalary, cur)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingInv > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">{pendingInv} invoice{pendingInv > 1 ? "s" : ""}</span>}
                    <Badge label={salSt} color={SAL_COLORS[salSt]} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CLIENT FORM (Add / Edit)
// ═══════════════════════════════════════════════════════════════
function ClientForm({ client, onSave, onCancel }) {
  const [form, setForm] = useState(client || {
    companyName: "", contactName: "", email: "", phone: "", whatsapp: "",
    website: "", industry: "", status: "Active", monthlySalary: "",
    services: [], salaryHistory: [], credentials: [], servicesList: [], invoices: [], notes: []
  });
  const [svcInput, setSvcInput] = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const addSvc = () => { if (svcInput.trim()) { set("services", [...(form.services || []), svcInput.trim()]); setSvcInput(""); } };
  const remSvc = (i) => set("services", form.services.filter((_, j) => j !== i));

  const handleGenerateLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?onboard=true`;
    navigator.clipboard.writeText(url);
    toast("Intake link copied to clipboard!");
  };

  return (
    <div className="space-y-5">
      {!client && (
        <div className="flex justify-end border-b border-blue-50 pb-3 -mt-2">
          <button onClick={handleGenerateLink} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
            <Copy size={14} /> Copy Intake Link
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Company Name *" value={form.companyName} onChange={e => set("companyName", e.target.value)} placeholder="Acme Corp" />
        <Input label="Contact Name *" value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="John Doe" />
        <Input label="Email" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="john@acme.com" />
        <Input label="Phone" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 0000" />
        <Input label="WhatsApp Number" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="15550000 (digits only)" />
        <Input label="Website" value={form.website} onChange={e => set("website", e.target.value)} placeholder="acme.com" />
        <Input label="Industry" value={form.industry} onChange={e => set("industry", e.target.value)} placeholder="Technology" />
        <Select label="Status" value={form.status} onChange={e => set("status", e.target.value)}>
          <option>Active</option><option>Inactive</option><option>On Hold</option>
        </Select>
        <Input label="Monthly Salary" type="number" value={form.monthlySalary} onChange={e => set("monthlySalary", parseFloat(e.target.value) || "")} placeholder="2500" />
      </div>
      <div>
        <label className="text-xs font-medium text-blue-700 uppercase tracking-wider">Services</label>
        <div className="flex gap-2 mt-1">
          <input value={svcInput} onChange={e => setSvcInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSvc()} placeholder="Add service..." className="flex-1 px-3 py-2 rounded-lg border border-blue-100 bg-blue-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={addSvc} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(form.services || []).map((s, i) => (
            <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
              {s} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => remSvc(i)} />
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-blue-100 text-blue-600 text-sm hover:bg-blue-50">Cancel</button>
        <button onClick={() => { if (!form.companyName.trim()) return toast("Company name required", "error"); onSave(form); }} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 font-medium">Save Client</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INVOICE BUILDER
// ═══════════════════════════════════════════════════════════════
function InvoiceBuilder({ client, invoice, settings, onSave, onClose, allInvoices }) {
  const nextNum = () => {
    const nums = (allInvoices || []).map(i => parseInt(i.invoiceNumber?.split("-")[2] || 0));
    const max = nums.length ? Math.max(...nums) : 0;
    return `INV-${new Date().getFullYear()}-${String(max + 1).padStart(3, "0")}`;
  };
  const [form, setForm] = useState(invoice || {
    invoiceNumber: nextNum(),
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    lineItems: [{ desc: "", qty: 1, price: 0 }],
    taxRate: settings.taxRate || 10,
    discount: 0,
    notes: settings.paymentTerms || "",
    status: "Draft"
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setItem = (i, k, v) => setForm(p => { const li = [...p.lineItems]; li[i] = { ...li[i], [k]: v }; return { ...p, lineItems: li }; });
  const addItem = () => set("lineItems", [...form.lineItems, { desc: "", qty: 1, price: 0 }]);
  const remItem = (i) => set("lineItems", form.lineItems.filter((_, j) => j !== i));
  const subtotal = form.lineItems.reduce((s, l) => s + (l.qty * l.price), 0);
  const tax = subtotal * (form.taxRate / 100);
  const disc = form.discount || 0;
  const total = subtotal + tax - disc;
  const cur = settings.currency || "USD";

  const handlePrint = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>${form.invoiceNumber}</title><style>body{font-family:Georgia,serif;padding:40px;color:#1e3a8a;} table{width:100%;border-collapse:collapse;} th{background:#dbeafe;padding:10px;text-align:left;font-size:12px;} td{padding:10px;border-bottom:1px solid #eff6ff;font-size:13px;} .total{font-size:18px;font-weight:bold;}</style></head><body>
    <h1 style="color:#1d4ed8">INVOICE</h1><p><b>${settings.businessName}</b><br/>${settings.address}<br/>${settings.email}</p>
    <hr/><p><b>Bill To:</b><br/>${client.companyName}<br/>${client.contactName}<br/>${client.email}</p>
    <p>Invoice #: <b>${form.invoiceNumber}</b> | Date: ${fmtDate(form.issueDate)} | Due: ${fmtDate(form.dueDate)}</p>
    <table><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
    ${form.lineItems.map(l => `<tr><td>${l.desc}</td><td>${l.qty}</td><td>${fmt(l.price, cur)}</td><td>${fmt(l.qty * l.price, cur)}</td></tr>`).join("")}
    </table><br/>
    <p>Subtotal: ${fmt(subtotal, cur)}<br/>Tax (${form.taxRate}%): ${fmt(tax, cur)}<br/>Discount: -${fmt(disc, cur)}</p>
    <p class="total">Total: ${fmt(total, cur)}</p>
    <hr/><p style="font-size:12px;color:#6b7280">${form.notes}</p>
    <p style="font-size:12px;color:#6b7280">${settings.bankDetails}</p>
    </body></html>`);
    w.print();
  };

  const handleEmail = () => {
    const body = `Invoice ${form.invoiceNumber}

Dear ${client.contactName},

Please find your invoice details below:

${form.lineItems.map(l => `${l.desc}: ${fmt(l.qty * l.price, cur)}`).join("\n")}

Subtotal: ${fmt(subtotal, cur)}
Tax: ${fmt(tax, cur)}
Total: ${fmt(total, cur)}

Due: ${fmtDate(form.dueDate)}

${form.notes}

Best regards,
${settings.ownerName}`;
    window.open(`mailto:${client.email}?subject=Invoice ${form.invoiceNumber} from ${settings.businessName}&body=${encodeURIComponent(body)}`);
    toast("Email client opened");
  };

  const handleWhatsapp = () => {
    const msg = `Hi ${client.contactName}, please find your invoice *${form.invoiceNumber}* for *${fmt(total, cur)}* due on *${fmtDate(form.dueDate)}*. Thank you! — ${settings.businessName}`;
    window.open(`https://wa.me/${client.whatsapp}?text=${encodeURIComponent(msg)}`);
    toast("WhatsApp opened");
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <Input label="Invoice #" value={form.invoiceNumber} onChange={e => set("invoiceNumber", e.target.value)} />
        <Input label="Issue Date" type="date" value={form.issueDate} onChange={e => set("issueDate", e.target.value)} />
        <Input label="Due Date" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
      </div>

      <div className="bg-blue-50/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-blue-900">Line Items</h4>
          <button onClick={addItem} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"><PlusCircle size={14} /> Add Row</button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs text-blue-400 font-medium px-1">
            <span className="col-span-6">Description</span><span className="col-span-2">Qty</span><span className="col-span-3">Price</span><span className="col-span-1"></span>
          </div>
          {form.lineItems.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input value={l.desc} onChange={e => setItem(i, "desc", e.target.value)} placeholder="Service description" className="col-span-6 px-3 py-2 rounded-lg border border-blue-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input type="number" value={l.qty} onChange={e => setItem(i, "qty", parseFloat(e.target.value) || 1)} className="col-span-2 px-3 py-2 rounded-lg border border-blue-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input type="number" value={l.price} onChange={e => setItem(i, "price", parseFloat(e.target.value) || 0)} className="col-span-3 px-3 py-2 rounded-lg border border-blue-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button onClick={() => remItem(i)} className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600"><MinusCircle size={16} /></button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-blue-100 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-medium text-blue-900">{fmt(subtotal, cur)}</span></div>
          <div className="flex justify-between text-gray-500 items-center">
            <span>Tax (%)</span>
            <input type="number" value={form.taxRate} onChange={e => set("taxRate", parseFloat(e.target.value) || 0)} className="w-16 px-2 py-1 rounded border border-blue-100 text-sm text-right" />
          </div>
          <div className="flex justify-between text-gray-500 items-center">
            <span>Discount</span>
            <input type="number" value={form.discount} onChange={e => set("discount", parseFloat(e.target.value) || 0)} className="w-20 px-2 py-1 rounded border border-blue-100 text-sm text-right" />
          </div>
          <div className="flex justify-between font-bold text-blue-900 text-base pt-2 border-t border-blue-100"><span>Total</span><span>{fmt(total, cur)}</span></div>
        </div>
      </div>

      <Textarea label="Notes / Payment Terms" value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} />

      <div className="flex flex-wrap gap-2">
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"><Printer size={15} /> Print</button>
        <button onClick={handleEmail} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm"><Mail size={15} /> Send Email</button>
        <button onClick={handleWhatsapp} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm"><MessageCircle size={15} /> WhatsApp</button>
        <button onClick={() => onSave({ ...form, subtotal, total, id: form.id || uid() })} className="ml-auto flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"><Save size={15} /> Save Invoice</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CLIENT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════
function ClientDetailPage({ client, settings, onUpdate, onBack }) {
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [showCred, setShowCred] = useState({});
  const [showAddCred, setShowAddCred] = useState(false);
  const [editCredId, setEditCredId] = useState(null);
  const [showAddSvc, setShowAddSvc] = useState(false);
  const [editSvcId, setEditSvcId] = useState(null);
  const [showInvBuilder, setShowInvBuilder] = useState(false);
  const [editInv, setEditInv] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [editSalaryEntry, setEditSalaryEntry] = useState(null);
  const emptyCredForm = { label: "", username: "", password: "", url: "", notes: "" };
  const emptySvcForm = { name: "", description: "", startDate: "", pricingType: "Monthly", price: "", status: "Active" };
  const emptySalForm = { month: currentMonth(), amount: client.monthlySalary || "", status: "Pending", date: "" };
  const [credForm, setCredForm] = useState(emptyCredForm);
  const [svcForm, setSvcForm] = useState(emptySvcForm);
  const [salForm, setSalForm] = useState(emptySalForm);
  const cur = settings.currency || "USD";
  const cm = currentMonth();
  const salHis = client.salaryHistory?.find(x => x.month === cm);
  const salStatus = salHis?.status || "Pending";

  const update = (patch) => onUpdate({ ...client, ...patch });

  const toggleSalary = () => {
    const history = [...(client.salaryHistory || [])];
    const idx = history.findIndex(x => x.month === cm);
    const newStatus = salStatus === "Received" ? "Pending" : "Received";
    const entry = { month: cm, amount: client.monthlySalary, status: newStatus, date: newStatus === "Received" ? new Date().toISOString().slice(0, 10) : null };
    if (idx >= 0) history[idx] = entry; else history.push(entry);
    update({ salaryHistory: history });
    toast(newStatus === "Received" ? "Salary marked as received!" : "Salary marked as pending");
  };

  // ── CREDENTIALS ──
  const openAddCred = () => { setEditCredId(null); setCredForm(emptyCredForm); setShowAddCred(true); };
  const openEditCred = (c) => { setEditCredId(c.id); setCredForm({ label: c.label, username: c.username, password: c.password, url: c.url, notes: c.notes }); setShowAddCred(true); };
  const saveCred = () => {
    if (!credForm.label) return toast("Label required", "error");
    let creds;
    if (editCredId) {
      creds = (client.credentials || []).map(c => c.id === editCredId ? { ...c, ...credForm } : c);
    } else {
      creds = [...(client.credentials || []), { ...credForm, id: uid() }];
    }
    update({ credentials: creds }); setShowAddCred(false); setEditCredId(null);
    setCredForm(emptyCredForm); toast(editCredId ? "Credential updated" : "Credential saved");
  };
  const delCred = (id) => { update({ credentials: client.credentials.filter(c => c.id !== id) }); toast("Deleted"); };

  // ── SERVICES ──
  const openAddSvc = () => { setEditSvcId(null); setSvcForm(emptySvcForm); setShowAddSvc(true); };
  const openEditSvc = (s) => { setEditSvcId(s.id); setSvcForm({ name: s.name, description: s.description, startDate: s.startDate, pricingType: s.pricingType, price: s.price, status: s.status }); setShowAddSvc(true); };
  const saveSvc = () => {
    if (!svcForm.name) return toast("Service name required", "error");
    let svcs;
    if (editSvcId) {
      svcs = (client.servicesList || []).map(s => s.id === editSvcId ? { ...s, ...svcForm, price: parseFloat(svcForm.price) || 0 } : s);
    } else {
      svcs = [...(client.servicesList || []), { ...svcForm, id: uid(), price: parseFloat(svcForm.price) || 0 }];
    }
    const svcTags = [...new Set(svcs.map(s => s.name))];
    update({ servicesList: svcs, services: svcTags });
    setShowAddSvc(false); setEditSvcId(null); setSvcForm(emptySvcForm);
    toast(editSvcId ? "Service updated" : "Service added");
  };

  // ── INVOICES ──
  const saveInvoice = (inv) => {
    const invs = [...(client.invoices || [])];
    const idx = invs.findIndex(i => i.id === inv.id);
    if (idx >= 0) invs[idx] = inv; else invs.push(inv);
    update({ invoices: invs }); setShowInvBuilder(false); setEditInv(null);
    toast("Invoice saved");
  };

  const handleAutoGenerateInvoice = () => {
    const monthlyServices = (client.servicesList || []).filter(s => s.pricingType === "Monthly" && s.status === "Active");
    if (monthlyServices.length === 0) return toast("No active monthly services found.", "warning");
    
    const lineItems = monthlyServices.map(s => ({ 
      desc: s.name + (s.description ? ` - ${s.description}` : ""), 
      qty: 1, 
      price: parseFloat(s.price) || 0 
    }));
    
    const nums = (client.invoices || []).map(i => parseInt(i.invoiceNumber?.split("-")[2] || 0));
    const max = nums.length ? Math.max(...nums) : 0;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(max + 1).padStart(3, "0")}`;

    const subtotal = lineItems.reduce((s, l) => s + (l.qty * l.price), 0);
    const taxRate = settings.taxRate || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    setEditInv({
      invoiceNumber,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      lineItems,
      taxRate,
      discount: 0,
      notes: settings.paymentTerms || "",
      status: "Draft",
      subtotal,
      total
    });
    setShowInvBuilder(true);
    toast("Auto-populated invoice with monthly services");
  };
  const markInvPaid = (id) => {
    const invs = client.invoices.map(i => i.id === id ? { ...i, status: "Paid", paidAt: new Date().toISOString().slice(0, 10) } : i);
    update({ invoices: invs }); toast("Invoice marked as paid");
  };
  const delInv = (id) => { update({ invoices: client.invoices.filter(i => i.id !== id) }); toast("Invoice deleted"); };
  const changeInvStatus = (id, status) => {
    const invs = client.invoices.map(i => i.id === id ? { ...i, status } : i);
    update({ invoices: invs }); toast(`Invoice marked as ${status}`);
  };

  // ── SALARY HISTORY ──
  const openAddSalary = () => { setEditSalaryEntry(null); setSalForm(emptySalForm); setShowSalaryModal(true); };
  const openEditSalary = (h) => { setEditSalaryEntry(h.month); setSalForm({ month: h.month, amount: h.amount, status: h.status, date: h.date || "" }); setShowSalaryModal(true); };
  const saveSalEntry = () => {
    if (!salForm.month) return toast("Month required", "error");
    const history = [...(client.salaryHistory || [])];
    const idx = history.findIndex(x => x.month === salForm.month);
    const entry = { month: salForm.month, amount: parseFloat(salForm.amount) || 0, status: salForm.status, date: salForm.status === "Received" && salForm.date ? salForm.date : salForm.status === "Received" ? new Date().toISOString().slice(0, 10) : null };
    if (idx >= 0) history[idx] = entry; else history.push(entry);
    history.sort((a, b) => a.month.localeCompare(b.month));
    update({ salaryHistory: history }); setShowSalaryModal(false);
    toast("Salary entry saved");
  };
  const delSalEntry = (month) => {
    update({ salaryHistory: (client.salaryHistory || []).filter(h => h.month !== month) });
    toast("Entry deleted");
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "credentials", label: "Credentials", icon: Key },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "mails", label: "Mails & Contracts", icon: Send },
    { id: "notepad", label: "Notepad", icon: StickyNote },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-blue-50 rounded-xl text-blue-400 hover:text-blue-600 transition-colors"><ChevronRight size={18} className="rotate-180" /></button>
        <div className="flex items-center gap-3 flex-1">
          <Avatar name={client.companyName} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-blue-900">{client.companyName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-400">{client.contactName}</span>
              <Badge label={client.status} color={STATUS_COLORS[client.status]} />
            </div>
          </div>
        </div>
        <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm"><Edit3 size={15} /> Edit</button>
      </div>

      <div className="flex gap-1 bg-blue-50 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-white text-blue-700 shadow-sm" : "text-blue-400 hover:text-blue-600"}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-blue-50 shadow-sm">
              <h3 className="text-sm font-semibold text-blue-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { icon: Mail, label: "Email", value: client.email },
                  { icon: Phone, label: "Phone", value: client.phone },
                  { icon: Smartphone, label: "WhatsApp", value: client.whatsapp },
                  { icon: Globe, label: "Website", value: client.website },
                  { icon: Building2, label: "Industry", value: client.industry },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg"><Icon size={14} className="text-blue-500" /></div>
                    <div><p className="text-xs text-gray-400">{label}</p><p className="text-blue-900 font-medium">{value || "—"}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-blue-50 shadow-sm">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Services</h3>
              <div className="flex flex-wrap gap-2">
                {(client.services || []).map((s, i) => <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{s}</span>)}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-blue-50 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blue-900">Salary History</h3>
                <button onClick={openAddSalary} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100">
                  <CalendarDays size={13} /> Add Entry
                </button>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(client.salaryHistory || []).slice().reverse().map((h, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 border-b border-blue-50 last:border-0 text-sm">
                    <span className="text-gray-500 w-20 shrink-0">{h.month}</span>
                    <span className="font-medium text-blue-900 flex-1">{fmt(h.amount, cur)}</span>
                    <Badge label={h.status} color={SAL_COLORS[h.status]} />
                    <span className="text-gray-400 text-xs w-24 text-right shrink-0">{h.date ? fmtDate(h.date) : "—"}</span>
                    <button onClick={() => openEditSalary(h)} className="p-1 text-blue-400 hover:text-blue-600"><Edit3 size={13}/></button>
                    <button onClick={() => setConfirm({ msg: "Delete this salary entry?", fn: () => delSalEntry(h.month) })} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
                  </div>
                ))}
                {!(client.salaryHistory?.length) && <p className="text-blue-300 text-sm text-center py-4">No history yet</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">Monthly Salary</p>
              <p className="text-3xl font-bold mt-1">{fmt(client.monthlySalary, cur)}</p>
              <p className="text-blue-200 text-sm mt-1">{new Date().toLocaleString("default", { month: "long", year: "numeric" })}</p>
              <div className="mt-4 pt-4 border-t border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm">Status</span>
                  <Badge label={salStatus} color={salStatus === "Received" ? "bg-emerald-400/20 text-emerald-200" : "bg-amber-400/20 text-amber-200"} />
                </div>
                <button onClick={toggleSalary} className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${salStatus === "Received" ? "bg-white/20 hover:bg-white/30 text-white" : "bg-white text-blue-700 hover:bg-blue-50"}`}>
                  {salStatus === "Received" ? "Mark as Pending" : "✓ Mark as Received"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-blue-50 shadow-sm">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => setTab("invoices")} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-sm text-blue-700 text-left"><Receipt size={16} className="text-blue-400" /> Create Invoice</button>
                <button onClick={() => window.open(`mailto:${client.email}`)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-sm text-blue-700 text-left"><Mail size={16} className="text-blue-400" /> Send Email</button>
                <button onClick={() => window.open(`https://wa.me/${client.whatsapp}`)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-sm text-blue-700 text-left"><MessageCircle size={16} className="text-blue-400" /> WhatsApp</button>
                <button onClick={() => setTab("notepad")} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-sm text-blue-700 text-left"><StickyNote size={16} className="text-blue-400" /> Open Notepad</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS */}
      {tab === "credentials" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-xl"><Info size={15} /> Store credentials responsibly. Do not share this app.</div>
            <button onClick={openAddCred} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700"><Plus size={15} /> Add Credential</button>
          </div>
          <div className="grid gap-3">
            {(client.credentials || []).map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-4 border border-blue-50 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2"><Key size={16} className="text-blue-500" /><span className="font-semibold text-blue-900">{c.label}</span></div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditCred(c)} className="text-blue-400 hover:text-blue-600 p-1"><Edit3 size={14} /></button>
                    <button onClick={() => { setConfirm({ msg: "Delete this credential?", fn: () => delCred(c.id) }); }} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[{ label: "Username", value: c.username }, { label: "Password", value: c.password, secret: true }, { label: "URL", value: c.url }, { label: "Notes", value: c.notes }].map(({ label, value, secret }) => value ? (
                    <div key={label}>
                      <p className="text-xs text-gray-400 mb-1">{label}</p>
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                        <span className="flex-1 font-mono text-blue-900 text-xs truncate">{secret && !showCred[c.id + label] ? "••••••••••" : value}</span>
                        <div className="flex items-center gap-1">
                          {secret && <button onClick={() => setShowCred(p => ({ ...p, [c.id + label]: !p[c.id + label] }))} className="text-blue-400 hover:text-blue-600">{showCred[c.id + label] ? <EyeOff size={13} /> : <Eye size={13} />}</button>}
                          <button onClick={() => { navigator.clipboard.writeText(value); toast("Copied!"); }} className="text-blue-400 hover:text-blue-600"><Copy size={13} /></button>
                        </div>
                      </div>
                    </div>
                  ) : null)}
                </div>
              </div>
            ))}
            {!(client.credentials?.length) && <div className="text-center py-12 bg-white rounded-2xl border border-blue-50"><Key size={32} className="text-blue-200 mx-auto mb-2" /><p className="text-blue-300">No credentials stored</p></div>}
          </div>

          <Modal open={showAddCred} onClose={() => { setShowAddCred(false); setEditCredId(null); setCredForm(emptyCredForm); }} title={editCredId ? "Edit Credential" : "Add Credential"}>
            <div className="space-y-4">
              <Input label="Label" value={credForm.label} onChange={e => setCredForm(p => ({ ...p, label: e.target.value }))} placeholder="WordPress Admin" />
              <Input label="Username / Email" value={credForm.username} onChange={e => setCredForm(p => ({ ...p, username: e.target.value }))} />
              <Input label="Password" type="text" value={credForm.password} onChange={e => setCredForm(p => ({ ...p, password: e.target.value }))} />
              <Input label="URL" value={credForm.url} onChange={e => setCredForm(p => ({ ...p, url: e.target.value }))} />
              <Textarea label="Notes" value={credForm.notes} onChange={e => setCredForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
              <button onClick={saveCred} className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Save Credential</button>
            </div>
          </Modal>
        </div>
      )}

      {/* SERVICES */}
      {tab === "services" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openAddSvc} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700"><Plus size={15} /> Add Service</button>
          </div>
          <div className="grid gap-3">
            {(client.servicesList || []).map(s => (
              <div key={s.id} className="bg-white rounded-2xl p-4 border border-blue-50 shadow-sm flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase size={15} className="text-blue-500" />
                    <span className="font-semibold text-blue-900">{s.name}</span>
                    <Badge label={s.status} color={s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"} />
                  </div>
                  <p className="text-sm text-gray-500">{s.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Since {fmtDate(s.startDate)}</span>
                    <span className="text-blue-700 font-semibold">{fmt(s.price, cur)} / {s.pricingType}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditSvc(s)} className="text-blue-400 hover:text-blue-600 p-1"><Edit3 size={14} /></button>
                  <button onClick={() => setConfirm({ msg: "Remove this service?", fn: () => { update({ servicesList: client.servicesList.filter(x => x.id !== s.id) }); toast("Service removed"); }})} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            {!(client.servicesList?.length) && <div className="text-center py-12 bg-white rounded-2xl border border-blue-50"><Briefcase size={32} className="text-blue-200 mx-auto mb-2" /><p className="text-blue-300">No services added yet</p></div>}
          </div>
          <Modal open={showAddSvc} onClose={() => { setShowAddSvc(false); setEditSvcId(null); setSvcForm(emptySvcForm); }} title={editSvcId ? "Edit Service" : "Add Service"}>
            <div className="space-y-4">
              <Input label="Service Name" value={svcForm.name} onChange={e => setSvcForm(p => ({ ...p, name: e.target.value }))} />
              <Textarea label="Description" value={svcForm.description} onChange={e => setSvcForm(p => ({ ...p, description: e.target.value }))} rows={2} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="date" value={svcForm.startDate} onChange={e => setSvcForm(p => ({ ...p, startDate: e.target.value }))} />
                <Select label="Pricing Type" value={svcForm.pricingType} onChange={e => setSvcForm(p => ({ ...p, pricingType: e.target.value }))}>
                  <option>Monthly</option><option>One-time</option><option>Hourly</option>
                </Select>
                <Input label="Price" type="number" value={svcForm.price} onChange={e => setSvcForm(p => ({ ...p, price: e.target.value }))} />
                <Select label="Status" value={svcForm.status} onChange={e => setSvcForm(p => ({ ...p, status: e.target.value }))}>
                  <option>Active</option><option>Completed</option><option>Paused</option>
                </Select>
              </div>
              <button onClick={saveSvc} className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Save Service</button>
            </div>
          </Modal>
        </div>
      )}

      {/* INVOICES */}
      {tab === "invoices" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button onClick={handleAutoGenerateInvoice} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm hover:bg-emerald-100 font-medium transition-colors"><Sparkles size={15} className="text-emerald-500" /> Auto-Generate from Services</button>
            <button onClick={() => { setEditInv(null); setShowInvBuilder(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700"><Plus size={15} /> New Invoice</button>
          </div>
          <div className="space-y-3">
            {(client.invoices || []).map(inv => (
              <div key={inv.id} className="bg-white rounded-2xl p-4 border border-blue-50 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-semibold text-blue-900">{inv.invoiceNumber}</span>
                      <Badge label={inv.status} color={INV_COLORS[inv.status]} />
                    </div>
                    <p className="text-xs text-gray-400">Issued: {fmtDate(inv.issueDate)} · Due: {fmtDate(inv.dueDate)}</p>
                    <p className="text-lg font-bold text-blue-900 mt-1">{fmt(inv.total, cur)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <select value={inv.status} onChange={e => changeInvStatus(inv.id, e.target.value)} className="text-xs border border-blue-100 rounded-lg px-2 py-1.5 bg-white text-blue-700 focus:outline-none">
                      {["Draft","Sent","Paid","Overdue"].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={() => { setEditInv(inv); setShowInvBuilder(true); }} className="p-2 hover:bg-blue-50 rounded-lg text-blue-400"><Edit3 size={15} /></button>
                    <button onClick={() => setConfirm({ msg: "Delete this invoice?", fn: () => delInv(inv.id) })} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
            {!(client.invoices?.length) && <div className="text-center py-12 bg-white rounded-2xl border border-blue-50"><Receipt size={32} className="text-blue-200 mx-auto mb-2" /><p className="text-blue-300">No invoices yet</p></div>}
          </div>
          <Modal open={showInvBuilder} onClose={() => { setShowInvBuilder(false); setEditInv(null); }} title={editInv ? "Edit Invoice" : "New Invoice"} wide>
            <InvoiceBuilder client={client} invoice={editInv} settings={settings} onSave={saveInvoice} onClose={() => { setShowInvBuilder(false); setEditInv(null); }} allInvoices={client.invoices} />
          </Modal>
        </div>
      )}

      {/* MAILS & CONTRACTS */}
      {tab === "mails" && <MailTemplates client={client} settings={settings} />}

      {/* NOTEPAD */}
      {tab === "notepad" && <NotePad client={client} onUpdate={update} />}

      {/* EDIT CLIENT MODAL */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Client" wide>
        <ClientForm client={client} onSave={(data) => { update(data); setEditing(false); toast("Client updated"); }} onCancel={() => setEditing(false)} />
      </Modal>

      <Confirm open={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirm?.fn} message={confirm?.msg} />

      {/* SALARY HISTORY MODAL */}
      <Modal open={showSalaryModal} onClose={() => setShowSalaryModal(false)} title={editSalaryEntry ? "Edit Salary Entry" : "Add Salary Entry"}>
        <div className="space-y-4">
          <Input label="Month (YYYY-MM)" type="month" value={salForm.month} onChange={e => setSalForm(p => ({ ...p, month: e.target.value }))} disabled={!!editSalaryEntry} />
          <Input label="Amount" type="number" value={salForm.amount} onChange={e => setSalForm(p => ({ ...p, amount: e.target.value }))} placeholder={`e.g. ${client.monthlySalary || 0}`} />
          <Select label="Status" value={salForm.status} onChange={e => setSalForm(p => ({ ...p, status: e.target.value }))}>
            <option>Pending</option><option>Received</option><option>Overdue</option>
          </Select>
          {salForm.status === "Received" && (
            <Input label="Date Received" type="date" value={salForm.date} onChange={e => setSalForm(p => ({ ...p, date: e.target.value }))} />
          )}
          <button onClick={saveSalEntry} className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
            {editSalaryEntry ? "Update Entry" : "Save Entry"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════
function MailTemplates({ client, settings }) {
  const [activeTab, setActiveTab] = useState("welcome");
  const cName = client.contactName || client.companyName || "";
  const cCompany = client.companyName || "";
  const owner = settings.ownerName || "NAXWEB Team";
  const ownerEmail = settings.email || "[your email]";
  const ownerPhone = settings.phone || "[your contact number]";
  const ownerAddress = settings.address || "[Your Address]";
  
  const servicesList = (client.servicesList || []).length > 0 
    ? client.servicesList.map(s => `- ${s.name}`).join("\n") 
    : "[ LIST DELIVERED SERVICES HERE ]";

  const templates = {
    welcome: {
      title: "Welcome Mail",
      subject: "Welcome to NAXWEB — Let's Build Something Amazing Together",
      body: `Dear ${cName},

Welcome aboard — and thank you for choosing NAXWEB.

We are genuinely excited to have you with us, and we want to start by saying this: you have made a great decision. From this point forward, you have a dedicated digital partner by your side — one that is fully committed to your growth, your vision, and your success online.

A little about who we are:

NAXWEB is a premium Web Development, Digital Design & Automation Studio trusted by businesses across the UAE, India, Australia, Canada, and beyond. We work with startups, growing businesses, and established enterprises — and every single project we take on receives the same level of care, precision, and excellence.

We don't just build websites. We build digital experiences that perform.

Here is what you can expect from us:

- A transparent, collaborative process from day one
- Regular updates and clear communication throughout your project
- Pixel-perfect design combined with solid technical development
- Timely delivery with no surprises
- Dedicated support even after your project goes live

Our services include:
Web Development · UI/UX Design · eCommerce Solutions · Booking Platforms · API Integrations · SEO Services · Automation Tools · Product & Event Websites · Digital Transformation

Whether you are launching something new or taking your existing business to the next level, we are here to make that journey seamless and impactful.

Your next steps:

Our team will reach out to you shortly to schedule your project discovery call, where we will understand your goals in detail and outline the roadmap ahead. If you have any questions in the meantime, do not hesitate to contact us at any time — we are always available.

Once again, welcome to the NAXWEB family. We look forward to building something exceptional together.

Warm regards,
${owner}
NAXWEB — We Design. We Develop. We Automate.
🌐 www.NAXWEB.co.in
📧 ${ownerEmail}
📱 ${ownerPhone}`
    },
    contract: {
      title: "Service Contract",
      subject: `NAXWEB — Service Agreement for ${cCompany}`,
      body: `SERVICE AGREEMENT

NAXWEB | NAXWEB.co.in
Premium Web Development, Digital Design & Automation Studio

---

AGREEMENT BETWEEN:

Service Provider:
NAXWEB (NAXWEB.co.in)
${ownerAddress}
${ownerEmail}
${ownerPhone}

Client:
${cCompany}
${cName}
${client.email || "[Client Email]"}
${client.phone || "[Client Contact Number]"}

Date of Agreement: ${new Date().toLocaleDateString("en-GB")}
Project Name: Design & Development Project

---

1. SCOPE OF SERVICES

NAXWEB agrees to provide the following services to the Client as part of this engagement:

${servicesList}

A detailed breakdown of deliverables, milestones, and specifications for the above services will be shared separately in the Project Scope Document, which forms an integral part of this agreement.

---

2. PROJECT TIMELINE

- Estimated Start Date: [DD/MM/YYYY]
- Estimated Completion Date: [DD/MM/YYYY]
- Timelines are subject to timely provision of required content, assets, feedback, and approvals by the Client.
- NAXWEB will communicate any delays proactively and in advance.

---

3. PAYMENT TERMS

- Total Project Value: [Amount]
- Advance Payment: 50% due before work commences
- Final Payment: remaining 50% due upon project completion before final delivery
- All payments are non-refundable once the respective phase of work has commenced.
- Invoices are due within 7 days of issuance.

---

4. TOOLS, TECHNOLOGIES & AI-ASSISTED WORKFLOWS

NAXWEB utilises industry-leading technologies, premium software platforms, and advanced AI-powered tools as part of its development and design workflow. These include but are not limited to modern development frameworks, UI/UX design software, SEO tools, automation platforms, and AI-assisted productivity and code tools.

The use of such tools is aimed at delivering superior quality, faster turnaround, and more refined outputs for the Client.

Please note: While NAXWEB applies the highest standards of professional diligence and quality control throughout every project, the use of advanced tools — including AI-assisted technologies — does not guarantee the complete absence of errors, bugs, or imperfections. All deliverables are subject to a review and testing phase, and NAXWEB commits to addressing reported issues within the agreed support period. However, NAXWEB does not warrant that deliverables will be entirely error-free under all conditions or environments beyond those tested.

---

5. CLIENT RESPONSIBILITIES

The Client agrees to:
- Provide all required content, images, branding assets, and information in a timely manner
- Provide prompt feedback and approvals at each project milestone
- Ensure a designated point of contact is available throughout the project duration
- Inform NAXWEB of any changes to requirements as early as possible, noting that scope changes may affect timelines and pricing

---

6. REVISIONS & CHANGE REQUESTS

- This agreement includes 2 rounds of revisions as part of the agreed scope
- Additional revisions or scope changes beyond the agreed limit will be quoted separately
- Significant changes to the original brief after work has commenced may require a revised agreement

---

7. INTELLECTUAL PROPERTY & OWNERSHIP

- Upon receipt of full and final payment, the Client will hold full ownership of all custom deliverables created under this agreement
- NAXWEB retains the right to showcase completed work in its portfolio and marketing materials unless the Client requests otherwise in writing
- Any third-party tools, plugins, themes, or licensed assets used remain subject to their respective license terms

---

8. CONFIDENTIALITY

Both parties agree to keep all shared business information, credentials, strategic details, and project specifics strictly confidential. Neither party shall disclose such information to any third party without prior written consent from the other.

---

9. SUPPORT & MAINTENANCE

- Post-delivery support is included for a period of 30 days from the date of final delivery
- During this period, NAXWEB will address bugs or issues directly related to the delivered work at no additional charge
- Support beyond this period, and ongoing maintenance, will be covered under a separate maintenance agreement

---

10. LIMITATION OF LIABILITY

NAXWEB's total liability under this agreement shall not exceed the total amount paid by the Client for the specific project. NAXWEB shall not be held liable for indirect, incidental, or consequential damages arising from the use of delivered services or any third-party platform, tool, or integration involved in the project.

---

11. TERMINATION

Either party may terminate this agreement with 15 days written notice. In the event of termination:
- The Client will be invoiced for all work completed up to the date of termination
- Any advance payments made are non-refundable for work already in progress
- NAXWEB will provide all completed work files to the Client upon receipt of outstanding payments

---

12. GOVERNING LAW

This agreement shall be governed by the laws of applicable jurisdiction. Any disputes shall first be attempted to be resolved through mutual discussion. If unresolved, disputes shall be referred to the appropriate legal jurisdiction.

---

AGREEMENT & SIGNATURES

By signing below, both parties confirm that they have read, understood, and agree to the terms outlined in this Service Agreement.

Service Provider — NAXWEB
Name: ${owner}
Signature: ___________________________
Date: ${new Date().toLocaleDateString("en-GB")}

Client
Name: ${cName}
Company: ${cCompany}
Signature: ___________________________
Date: ___________________________

---
NAXWEB | NAXWEB.co.in | We Design. We Develop. We Automate.`
    },
    thankyou: {
      title: "Thank You Mail",
      subject: "Thank You from NAXWEB — It Was a Pleasure Working With You",
      body: `Dear ${cName},

On behalf of the entire NAXWEB team, I want to take a moment to sincerely thank you for trusting us with your project.

It has been a genuine pleasure working with you. From the very first conversation to the final delivery, your collaboration, clear communication, and trust in our process made this a rewarding experience for our entire team.

We hope what we have built together truly reflects your vision and sets a strong foundation for your growth online. Seeing a project come to life — and knowing it will make a real difference for your business — is exactly why we do what we do.

A quick reminder of what has been delivered:

${servicesList}

Your post-delivery support period is active until: [30 Days from today]
During this time, if you notice anything that needs attention, please reach out and we will take care of it promptly.

Looking ahead:

Digital success is an ongoing journey, and NAXWEB is here for every step of it. Whether it is future updates, new features, SEO campaigns, automation, or an entirely new project — we are just one message away.

We would truly appreciate it if you could:
- Leave us a short review or testimonial — it means the world to a growing studio like ours
- Refer us to any business in your network that could benefit from our services

Every referral and every kind word helps us continue doing what we love.

Thank you once again, ${cName}. It was an honour working with you, and we look forward to the opportunity to work together again in the future.

Warm regards,
${owner}
NAXWEB — We Design. We Develop. We Automate.
🌐 www.NAXWEB.co.in
📧 ${ownerEmail}
📱 ${ownerPhone}

© NAXWEB | NAXWEB.co.in | Premium Web Development, Design & Automation`
    }
  };

  const [editedSubject, setEditedSubject] = useState(templates["welcome"].subject);
  const [editedBody, setEditedBody] = useState(templates["welcome"].body);
  const [isEditing, setIsEditing] = useState(false);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setEditedSubject(templates[key].subject);
    setEditedBody(templates[key].body);
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditedSubject(templates[activeTab].subject);
    setEditedBody(templates[activeTab].body);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedSubject + "\n\n" + editedBody);
    toast("Template copied to clipboard!");
  };

  const handleEmail = () => {
    const email = client.email || "";
    const subject = encodeURIComponent(editedSubject);
    const body = encodeURIComponent(editedBody);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    toast("Opened in Email Client");
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-50 shadow-sm flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-64 bg-blue-50/30 border-r border-blue-50 flex flex-col p-4 space-y-2">
        <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Mail Templates</h3>
        {Object.entries(templates).map(([key, t]) => (
          <button key={key} onClick={() => handleTabChange(key)} className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === key ? "bg-white text-blue-700 shadow-sm border border-blue-100" : "text-blue-500 hover:bg-blue-50"}`}>
            {t.title}
          </button>
        ))}
      </div>
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-1">Subject</p>
            {isEditing ? (
              <input
                value={editedSubject}
                onChange={e => setEditedSubject(e.target.value)}
                className="w-full text-sm font-bold text-blue-900 border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-blue-50/30"
              />
            ) : (
              <p className="text-sm font-bold text-blue-900 leading-snug">{editedSubject}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            {isEditing ? (
              <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors">
                <RefreshCw size={13} /> Reset
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors">
                <Edit3 size={13} /> Edit
              </button>
            )}
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors"><Copy size={13} /> Copy</button>
            <button onClick={handleEmail} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"><Send size={13} /> Send Mail</button>
          </div>
        </div>
        {isEditing ? (
          <textarea
            value={editedBody}
            onChange={e => setEditedBody(e.target.value)}
            className="flex-1 w-full min-h-[540px] text-gray-700 bg-blue-50/20 p-5 rounded-2xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[13px] font-sans leading-relaxed resize-none"
          />
        ) : (
          <div className="text-gray-600 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 min-h-[540px] overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed text-[13px]">
            {editedBody}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NOTEPAD
// ═══════════════════════════════════════════════════════════════
function NotePad({ client, onUpdate }) {
  const [notes, setNotes] = useState(client.notes || []);
  const [active, setActive] = useState(notes[0]?.id || null);
  const [search, setSearch] = useState("");
  const timerRef = useRef(null);

  const sync = (newNotes) => { setNotes(newNotes); onUpdate({ notes: newNotes }); };
  const addNote = () => {
    const n = { id: uid(), title: "New Note", content: "", isPinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const updated = [n, ...notes]; sync(updated); setActive(n.id);
  };
  const activeNote = notes.find(n => n.id === active);

  const updateNote = (id, patch) => {
    clearTimeout(timerRef.current);
    const updated = notes.map(n => n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n);
    setNotes(updated);
    timerRef.current = setTimeout(() => onUpdate({ notes: updated }), 800);
  };

  const delNote = (id) => { const updated = notes.filter(n => n.id !== id); sync(updated); setActive(updated[0]?.id || null); };
  const pinNote = (id) => { const updated = notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n).sort((a, b) => b.isPinned - a.isPinned); sync(updated); };

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex gap-4 h-[560px]">
      <div className="w-64 flex flex-col bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-blue-50">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-blue-100 bg-blue-50/30 focus:outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(n => (
            <div key={n.id} onClick={() => setActive(n.id)} className={`p-3 cursor-pointer border-b border-blue-50 hover:bg-blue-50 transition-colors ${active === n.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold text-blue-900 truncate flex-1">{n.isPinned ? "📌 " : ""}{n.title}</p>
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">{n.content.slice(0, 40) || "Empty note"}</p>
              <p className="text-xs text-blue-200 mt-1">{fmtDate(n.updatedAt)}</p>
            </div>
          ))}
          {!filtered.length && <div className="p-6 text-center text-blue-200 text-xs">No notes</div>}
        </div>
        <div className="p-3 border-t border-blue-50">
          <button onClick={addNote} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium"><Plus size={13} /> New Note</button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden flex flex-col">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-blue-50">
              <input value={activeNote.title} onChange={e => updateNote(activeNote.id, { title: e.target.value })} className="flex-1 text-base font-semibold text-blue-900 bg-transparent border-none outline-none focus:ring-0" />
              <div className="flex items-center gap-1">
                <button onClick={() => pinNote(activeNote.id)} className={`p-2 rounded-lg text-sm ${activeNote.isPinned ? "text-blue-600 bg-blue-50" : "text-gray-300 hover:text-blue-400"}`}><Pin size={15} /></button>
                <button onClick={() => delNote(activeNote.id)} className="p-2 rounded-lg text-red-300 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            </div>
            <textarea
              value={activeNote.content}
              onChange={e => updateNote(activeNote.id, { content: e.target.value })}
              placeholder="Start typing your note here..."
              className="flex-1 p-4 text-sm text-gray-700 resize-none focus:outline-none leading-relaxed"
            />
            <div className="px-4 py-2 border-t border-blue-50 text-xs text-blue-200 flex justify-between">
              <span>Auto-saved</span>
              <span>Modified {fmtDate(activeNote.updatedAt)}</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center">
            <StickyNote size={40} className="text-blue-100" />
            <p className="text-blue-300 text-sm">Select a note or create a new one</p>
            <button onClick={addNote} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700"><Plus size={14} className="inline mr-1" />New Note</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SALARY TRACKER
// ═══════════════════════════════════════════════════════════════
function SalaryPage({ clients, settings, onUpdateClient }) {
  const [month, setMonth] = useState(currentMonth());
  const cur = settings.currency || "USD";
  const [showModal, setShowModal] = useState(false);
  const [modalClient, setModalClient] = useState(null);
  const [modalEntry, setModalEntry] = useState(null);
  const emptySalForm = (c) => ({ month, amount: c?.monthlySalary || "", status: "Pending", date: "" });
  const [salForm, setSalForm] = useState({ month: "", amount: "", status: "Pending", date: "" });
  const [confirm, setConfirm] = useState(null);

  // Invoices state
  const [editInv, setEditInv] = useState(null);
  const [showInvBuilder, setShowInvBuilder] = useState(false);

  const rows = clients.map(c => {
    const h = c.salaryHistory?.find(x => x.month === month);
    return { client: c, status: h?.status || "Pending", date: h?.date, amount: h?.amount ?? c.monthlySalary, entryExists: !!h };
  });

  const totalExpected = clients.reduce((s, c) => s + (c.monthlySalary || 0), 0);
  const totalReceived = rows.filter(r => r.status === "Received" && r.entryExists).reduce((s, r) => s + (r.amount || 0), 0);
  const totalPending = totalExpected - totalReceived;

  // Bills logic
  const monthlyInvoices = clients.flatMap(c => (c.invoices || []).map(inv => ({ ...inv, client: c })))
    .filter(inv => inv.issueDate.startsWith(month));

  // Unpaid Past Salaries
  const unpaidPastSalaries = clients.flatMap(c => 
    (c.salaryHistory || [])
      .filter(h => h.month !== month && h.status !== "Received")
      .map(h => ({ client: c, ...h }))
  ).sort((a, b) => b.month.localeCompare(a.month));

  const totalInvExpected = monthlyInvoices.reduce((s, i) => s + i.total, 0);
  const totalInvReceived = monthlyInvoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.total, 0);

  const openEdit = (c, overrideEntry) => {
    const existing = overrideEntry || c.salaryHistory?.find(x => x.month === month);
    setModalClient(c);
    setModalEntry(existing || null);
    setSalForm({ month: existing?.month || month, amount: existing?.amount ?? c.monthlySalary ?? "", status: existing?.status || "Pending", date: existing?.date || "" });
    setShowModal(true);
  };

  const openAddCustom = (c) => {
    setModalClient(c);
    setModalEntry(null);
    setSalForm(emptySalForm(c));
    setShowModal(true);
  };

  const saveSalEntry = () => {
    if (!salForm.month) return toast("Month required", "error");
    const history = [...(modalClient.salaryHistory || [])];
    const idx = history.findIndex(x => x.month === salForm.month);
    const entry = {
      month: salForm.month,
      amount: parseFloat(salForm.amount) || 0,
      status: salForm.status,
      date: salForm.status === "Received" && salForm.date ? salForm.date : salForm.status === "Received" ? new Date().toISOString().slice(0, 10) : null
    };
    if (idx >= 0) history[idx] = entry; else history.push(entry);
    history.sort((a, b) => a.month.localeCompare(b.month));
    onUpdateClient({ ...modalClient, salaryHistory: history });
    setShowModal(false); toast("Salary entry saved");
  };

  const quickToggle = (c, overrideMonth) => {
    const m = overrideMonth || month;
    const history = [...(c.salaryHistory || [])];
    const idx = history.findIndex(x => x.month === m);
    const h = history[idx];
    const newStatus = h?.status === "Received" ? "Pending" : "Received";
    const entry = { month: m, amount: h?.amount ?? c.monthlySalary, status: newStatus, date: newStatus === "Received" ? new Date().toISOString().slice(0, 10) : null };
    if (idx >= 0) history[idx] = entry; else history.push(entry);
    onUpdateClient({ ...c, salaryHistory: history });
    toast(newStatus === "Received" ? "Marked as received" : "Marked as pending");
  };

  const changeInvStatus = (c, invId, status) => {
    const invs = c.invoices.map(i => i.id === invId ? { ...i, status } : i);
    onUpdateClient({ ...c, invoices: invs }); toast(`Invoice marked as ${status}`);
  };
  const delInv = (c, invId) => {
    onUpdateClient({ ...c, invoices: c.invoices.filter(i => i.id !== invId) }); toast("Invoice deleted");
  };
  const saveInvoice = (c, inv) => {
    const invs = [...(c.invoices || [])];
    const idx = invs.findIndex(i => i.id === inv.id);
    if (idx >= 0) invs[idx] = inv; else invs.push(inv);
    onUpdateClient({ ...c, invoices: invs }); setShowInvBuilder(false); setEditInv(null);
    toast("Invoice saved");
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-blue-900">Salary & Bills Tracker</h1>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="px-4 py-2 rounded-xl border border-blue-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-700 font-medium shadow-sm" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={TrendingUp} label="Expected Salary" value={fmt(totalExpected, cur)} color="blue" />
          <StatCard icon={CheckCircle2} label="Received Salary" value={fmt(totalReceived, cur)} color="green" />
          <StatCard icon={Receipt} label="Billed (Invoices)" value={fmt(totalInvExpected, cur)} color="indigo" />
          <StatCard icon={Wallet} label="Paid (Invoices)" value={fmt(totalInvReceived, cur)} color="emerald" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-50/50">
              <tr>
                {["Client", "Services", "Salary Amount", "Status", "Date Received", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-blue-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {rows.map(({ client: c, status, date, amount, entryExists }) => (
                <tr key={c.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.companyName} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">{c.companyName}</p>
                        <p className="text-xs text-blue-400/80">{c.contactName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(c.services || []).slice(0, 2).map((s, i) => <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">{s}</span>)}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-blue-900">{fmt(amount, cur)}</td>
                  <td className="px-5 py-4">
                    <Badge label={entryExists ? status : "No Entry"} color={entryExists ? SAL_COLORS[status] : "bg-gray-100 text-gray-400"} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{date ? fmtDate(date) : "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => quickToggle(c)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-sm ${status === "Received" && entryExists ? "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"}`}>
                        {status === "Received" && entryExists ? "Unmark" : "Mark Received"}
                      </button>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Edit entry">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => openAddCustom(c)} className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors" title="Add for another month">
                        <CalendarDays size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {unpaidPastSalaries.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-red-900 mb-4 px-1 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            Unpaid Previous Months
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-red-50 overflow-hidden ring-1 ring-red-100/50">
            <table className="w-full">
              <thead className="bg-red-50/50">
                <tr>
                  {["Month", "Client", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-red-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {unpaidPastSalaries.map(h => (
                  <tr key={`${h.client.id}-${h.month}`} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-5 py-4 font-bold text-red-900">{h.month}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={h.client.companyName} size="sm" />
                        <span className="text-sm font-medium text-red-900">{h.client.companyName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-red-900">{fmt(h.amount, cur)}</td>
                    <td className="px-5 py-4">
                      <Badge label={h.status} color="bg-red-100 text-red-700" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => quickToggle(h.client, h.month)} className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md">
                          Mark Received
                        </button>
                        <button onClick={() => openEdit(h.client, h)} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Edit entry">
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-base font-bold text-blue-900 mb-4 px-1 flex items-center gap-2">
          <Receipt size={18} className="text-blue-500" />
          Bills & Invoices ({month})
        </h2>
        
        {monthlyInvoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-blue-50 p-8 text-center bg-blue-50/20">
            <Receipt size={32} className="text-blue-200 mx-auto mb-2" />
            <p className="text-blue-400 text-sm">No bills added for {month}.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-50/50">
                <tr>
                  {["Invoice", "Client", "Issue Date", "Due Date", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-blue-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {monthlyInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-blue-900">{inv.invoiceNumber}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={inv.client.companyName} size="sm" />
                        <span className="text-sm font-medium text-blue-900">{inv.client.companyName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{fmtDate(inv.issueDate)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{fmtDate(inv.dueDate)}</td>
                    <td className="px-5 py-4 font-bold text-blue-900">{fmt(inv.total, cur)}</td>
                    <td className="px-5 py-4">
                      <select value={inv.status} onChange={e => changeInvStatus(inv.client, inv.id, e.target.value)} className="text-xs border border-blue-100 rounded-lg px-2 py-1.5 bg-white text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm">
                        {["Draft","Sent","Paid","Overdue"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditInv(inv); setShowInvBuilder(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"><Edit3 size={15} /></button>
                        <button onClick={() => setConfirm({ msg: "Delete this bill?", fn: () => delInv(inv.client, inv.id) })} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={`${modalEntry ? "Edit" : "Add"} Salary Entry — ${modalClient?.companyName || ""}`}>
        <div className="space-y-4">
          <Input label="Month (YYYY-MM)" type="month" value={salForm.month} onChange={e => setSalForm(p => ({ ...p, month: e.target.value }))} />
          <Input label="Amount" type="number" value={salForm.amount} onChange={e => setSalForm(p => ({ ...p, amount: e.target.value }))} placeholder={`Default: ${modalClient?.monthlySalary || 0}`} />
          <Select label="Status" value={salForm.status} onChange={e => setSalForm(p => ({ ...p, status: e.target.value }))}>
            <option>Pending</option><option>Received</option><option>Overdue</option>
          </Select>
          {salForm.status === "Received" && (
            <Input label="Date Received" type="date" value={salForm.date} onChange={e => setSalForm(p => ({ ...p, date: e.target.value }))} />
          )}
          <button onClick={saveSalEntry} className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-md shadow-blue-200">
            {modalEntry ? "Update Entry" : "Save Entry"}
          </button>
        </div>
      </Modal>

      <Modal open={showInvBuilder} onClose={() => { setShowInvBuilder(false); setEditInv(null); }} title="Edit Bill" wide>
        {editInv && <InvoiceBuilder client={editInv.client} invoice={editInv} settings={settings} onSave={(updatedInv) => saveInvoice(editInv.client, updatedInv)} onClose={() => { setShowInvBuilder(false); setEditInv(null); }} allInvoices={editInv.client.invoices} />}
      </Modal>

      <Confirm open={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirm?.fn} message={confirm?.msg} />
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════
function SettingsPage({ settings, onSave, clients, onImport }) {
  const [form, setForm] = useState(settings);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const exportData = () => {
    const data = JSON.stringify({ settings, clients }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "freelance-dashboard-backup.json"; a.click();
    toast("Data exported successfully");
  };

  const importData = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { try { const d = JSON.parse(ev.target.result); onImport(d); toast("Data imported!"); } catch { toast("Invalid file", "error"); } };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-blue-900">Settings</h1>

      <div className="bg-white rounded-2xl p-6 border border-blue-50 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-blue-900 border-b border-blue-50 pb-3">Business Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Business Name" value={form.businessName} onChange={e => set("businessName", e.target.value)} />
          <Input label="Your Name" value={form.ownerName} onChange={e => set("ownerName", e.target.value)} />
          <Input label="Email" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
          <Input label="Phone" value={form.phone} onChange={e => set("phone", e.target.value)} />
          <Input label="WhatsApp (digits only)" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} />
          <Select label="Currency" value={form.currency} onChange={e => set("currency", e.target.value)}>
            {["USD", "EUR", "GBP", "AUD", "INR", "AED", "CAD", "SGD"].map(c => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <Textarea label="Business Address" value={form.address} onChange={e => set("address", e.target.value)} rows={2} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-blue-50 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-blue-900 border-b border-blue-50 pb-3">Invoice Defaults</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Default Tax Rate (%)" type="number" value={form.taxRate} onChange={e => set("taxRate", parseFloat(e.target.value) || 0)} />
        </div>
        <Textarea label="Default Payment Terms" value={form.paymentTerms} onChange={e => set("paymentTerms", e.target.value)} />
        <Textarea label="Bank / Payment Details" value={form.bankDetails} onChange={e => set("bankDetails", e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-blue-50 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-blue-900 border-b border-blue-50 pb-3">Data Management</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm"><Download size={15} /> Export JSON</button>
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm cursor-pointer"><Upload size={15} /> Import JSON<input type="file" accept=".json" onChange={importData} className="hidden" /></label>
          <button onClick={() => { if (confirm("Clear ALL data? This cannot be undone.")) { localStorage.clear(); window.location.reload(); } }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm"><Trash2 size={15} /> Clear All Data</button>
        </div>
      </div>

      <button onClick={() => { onSave(form); toast("Settings saved!"); }} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
        <Save size={16} /> Save Settings
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clients, setClients] = useState([]);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);

  // If not authenticated, show auth screen
  if (!isAuthenticated) {
    return <Auth onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const mapSettings = (s) => ({
    id: s.id,
    businessName: s.business_name,
    ownerName: s.owner_name,
    email: s.email,
    phone: s.phone,
    whatsapp: s.whatsapp,
    address: s.address,
    logo: s.logo,
    taxRate: s.tax_rate,
    currency: s.currency,
    paymentTerms: s.payment_terms,
    bankDetails: s.bank_details,
    theme: s.theme
  });

  const unmapSettings = (s) => ({
    business_name: s.businessName,
    owner_name: s.ownerName,
    email: s.email,
    phone: s.phone,
    whatsapp: s.whatsapp,
    address: s.address,
    logo: s.logo,
    tax_rate: s.taxRate,
    currency: s.currency,
    payment_terms: s.paymentTerms,
    bank_details: s.bankDetails,
    theme: s.theme
  });

  const mapClient = (c) => ({
    ...c,
    companyName: c.company_name,
    contactName: c.contact_name,
    monthlySalary: c.monthly_salary,
    createdAt: c.created_at,
    servicesList: c.services_list,
    salaryHistory: c.salary_history
  });

  const unmapClient = (c) => ({
    company_name: c.companyName,
    contact_name: c.contactName,
    email: c.email,
    phone: c.phone,
    whatsapp: c.whatsapp,
    website: c.website,
    industry: c.industry,
    status: c.status,
    monthly_salary: c.monthlySalary,
    services: c.services,
    salary_history: c.salaryHistory,
    credentials: c.credentials,
    services_list: c.servicesList,
    invoices: c.invoices,
    notes: c.notes
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: sData } = await supabase.from("settings").select("*").maybeSingle();
      if (sData) setSettings(mapSettings(sData));

      const { data: cData } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (cData) setClients(cData.map(mapClient));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (data) => {
    const raw = unmapClient({
      ...data,
      salaryHistory: [],
      servicesList: data.servicesList || [],
      invoices: [],
      notes: []
    });
    
    const { data: inserted, error } = await supabase.from("clients").insert([raw]).select();
    
    if (error) {
      toast("Error adding client", "error");
      return;
    }

    setClients(p => [mapClient(inserted[0]), ...p]);
    setShowNewClient(false);
    setPage("clients");
    toast("Client added!");
  };

  const updateClient = async (updated) => {
    const { error } = await supabase.from("clients").update(unmapClient(updated)).eq("id", updated.id);
    
    if (error) {
      toast("Error updating client", "error");
      return;
    }

    setClients(p => p.map(c => c.id === updated.id ? updated : c));
    if (selectedClient?.id === updated.id) setSelectedClient(updated);
  };

  const saveSettings = async (form) => {
    const raw = unmapSettings(form);
    const { data, error } = await supabase.from("settings").upsert({ ...raw, id: settings.id || undefined }).select().single();
    if (error) {
      toast("Error saving settings", "error");
      return;
    }
    setSettings(mapSettings(data));
    toast("Settings saved!");
  };

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clients", label: "Clients", icon: Users },
    { id: "salary", label: "Salary Tracker", icon: DollarSign },
    { id: "naxmail", label: "NaxMail", icon: Mail, href: "https://naxmail.vercel.app" },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const navigate = (p) => { setPage(p); setSidebarOpen(false); };

  const isOnboard = new URLSearchParams(window.location.search).get("onboard") === "true";

  if (isOnboard) {
    return (
      <>
        <ClientOnboardingForm />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-blue-50 shadow-sm flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
        <div className="p-5 border-b border-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
              <Briefcase size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-blue-900 text-sm leading-tight">{settings.businessName}</p>
              <p className="text-xs text-blue-400">Freelance Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(n =>
            n.href ? (
              <a
                key={n.id}
                href={n.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-blue-500 hover:bg-blue-50 hover:text-blue-700"
              >
                <n.icon size={17} />{n.label}
                <ExternalLink size={12} className="ml-auto opacity-50" />
              </a>
            ) : (
              <button key={n.id} onClick={() => navigate(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${page === n.id || (page === "client-detail" && n.id === "clients") ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-blue-500 hover:bg-blue-50 hover:text-blue-700"}`}>
                <n.icon size={17} />{n.label}
              </button>
            )
          )}
        </nav>

        <div className="p-4 border-t border-blue-50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-900 truncate">{settings.ownerName}</p>
              <p className="text-xs text-blue-400 truncate">{settings.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-20 bg-blue-950/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-blue-50 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-blue-50 text-blue-500"><Menu size={20} /></button>
          <div className="flex items-center gap-2">
            {page === "client-detail" && selectedClient && (
              <>
                <button onClick={() => setPage("clients")} className="text-blue-400 hover:text-blue-600 text-sm">Clients</button>
                <ChevronRight size={14} className="text-blue-200" />
                <span className="text-sm font-semibold text-blue-900">{selectedClient.companyName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowNewClient(true)} className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-medium shadow-sm shadow-blue-200 transition-all">
              <Plus size={14} /> New Client
            </button>
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xs font-bold">
              {initials(settings.ownerName)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-blue-400">
              <RefreshCw size={40} className="animate-spin" />
              <p className="font-medium animate-pulse">Syncing with Supabase...</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {page === "dashboard" && <DashboardPage clients={clients} settings={settings} setPage={setPage} setSelectedClient={(c) => { setSelectedClient(c); }} />}
              {page === "clients" && <ClientsPage clients={clients} settings={settings} setPage={setPage} setSelectedClient={(c) => { setSelectedClient(c); }} onAddClient={addClient} />}
              {page === "client-detail" && selectedClient && <ClientDetailPage client={clients.find(c => c.id === selectedClient.id) || selectedClient} settings={settings} onUpdate={updateClient} onBack={() => setPage("clients")} />}
              {page === "salary" && <SalaryPage clients={clients} settings={settings} onUpdateClient={updateClient} />}
              {page === "settings" && <SettingsPage settings={settings} onSave={saveSettings} clients={clients} onImport={({ settings: s, clients: c }) => { if (s) setSettings(s); if (c) setClients(c); }} />}
            </div>
          )}
        </main>
      </div>

      <Modal open={showNewClient} onClose={() => setShowNewClient(false)} title="Add New Client" wide>
        <ClientForm onSave={addClient} onCancel={() => setShowNewClient(false)} />
      </Modal>

      <ToastContainer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC ONBOARDING FORM
// ═══════════════════════════════════════════════════════════════
function ClientOnboardingForm() {
  const [form, setForm] = useState({
    company_name: "", contact_name: "", email: "", phone: "", whatsapp: "", website: "", industry: "",
    status: "Active", monthly_salary: 0, services: [], salary_history: [], credentials: [], services_list: [], invoices: [], notes: []
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.contact_name.trim() || !form.email.trim()) {
      return toast("Please fill in all required fields", "error");
    }
    
    setLoading(true);
    const { error } = await supabase.from("clients").insert([{ ...form, created_at: new Date().toISOString() }]);
    setLoading(false);
    
    if (error) { 
      console.error(error); 
      return toast("Error submitting details. Please try again.", "error"); 
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white max-w-md w-full p-10 rounded-[2rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 text-center space-y-5 animate-in fade-in zoom-in duration-500 delay-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-emerald-950">Thank You!</h2>
          <p className="text-emerald-800/70 leading-relaxed text-sm">Your details have been successfully submitted. We will review your information and be in touch shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-600 to-slate-50 opacity-10"></div>
      
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-blue-50 relative z-10">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200 rotate-3">
            <Briefcase size={28} className="text-white -rotate-3" />
          </div>
          <h1 className="text-3xl font-bold text-blue-950 mb-2 tracking-tight">Welcome Aboard</h1>
          <p className="text-slate-500 text-sm">Please provide your details below to help us set up your dedicated workspace area.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-50 pb-2">Business Information</h3>
            <Input label="Company / Business Name *" value={form.company_name} onChange={e => set("company_name", e.target.value)} placeholder="e.g. Acme Corporation" />
            <Input label="Your Full Name *" value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="e.g. John Doe" />
            <Input label="Industry / Niche" value={form.industry} onChange={e => set("industry", e.target.value)} placeholder="e.g. E-commerce, Real Estate, Technology" />
          </div>

          <div className="space-y-5 pt-4">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-50 pb-2">Contact Details</h3>
            <Input label="Email Address *" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="john@acme.com" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone Number" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 0000" />
              <Input label="WhatsApp Number" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="+1 555 0000" />
            </div>
            <Input label="Website URL" value={form.website} onChange={e => set("website", e.target.value)} placeholder="www.acme.com" />
          </div>
          
          <div className="pt-6">
            <button type="submit" disabled={loading} className="w-full h-14 rounded-xl font-bold text-base bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-200 flex items-center justify-center gap-3">
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
              {loading ? "Submitting Details..." : "Submit My Details"}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5"><Key size={12} /> Your information is securely stored.</p>
          </div>
        </form>
      </div>
    </div>
  );
}

