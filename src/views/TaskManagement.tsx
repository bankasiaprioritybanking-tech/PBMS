import React, { useMemo, useState, useEffect } from "react";
import {
  AlertCircle,
  Clock,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  Calendar,
  X,
  ListTodo,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date: string | null;
  task_date?: string | null;
  assigned_to: string;
  linked_request_id?: string;
  linked_visit_id?: string;
  linked_lead_id?: string;
  task_type: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface ServiceRequest {
  id: string;
  request_id: string;
  customer_name: string;
  service_type: string;
  status: string;
  priority: string;
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [selectedRequestIdForNewTask, setSelectedRequestIdForNewTask] =
    useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Load from Firestore
  useEffect(() => {
    const unsubTasks = onSnapshot(
      collection(db, "tasks"),
      (snapshot) => {
        const loaded: Task[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as Task);
        });
        setTasks(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "tasks");
      },
    );

    const unsubRequests = onSnapshot(
      collection(db, "serviceRequests"),
      (snapshot) => {
        const loaded: ServiceRequest[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as ServiceRequest);
        });
        // Fallback mocks if DB is empty
        if (loaded.length === 0) {
          setRequests([
            {
              id: "req_1",
              request_id: "REQ-001",
              customer_name: "John Doe",
              service_type: "airport-greet",
              status: "pending_cm",
              priority: "high",
            },
          ]);
        } else {
          setRequests(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "serviceRequests");
      },
    );

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const loaded: User[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as User);
        });
        setUsers(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "users");
      },
    );

    return () => {
      unsubTasks();
      unsubRequests();
      unsubUsers();
    };
  }, []);

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await deleteDoc(doc(db, "tasks", taskToDelete));
        setTaskToDelete(null);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, "tasks");
      }
    }
  };

  const tasksByRequest = useMemo(() => {
    const map: Record<string, Task> = {};
    tasks.forEach((task) => {
      if (task.linked_request_id) {
        map[task.linked_request_id] = task;
      }
    });
    return map;
  }, [tasks]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchSearch =
        req.request_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || req.status === statusFilter;
      const matchPriority =
        priorityFilter === "all" || req.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = tasks.filter((t) => {
      if (!t.due_date || t.status === "completed") return false;
      const [year, month, day] = t.due_date.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.getTime() < today.getTime();
    }).length;

    const dueToday = tasks.filter((t) => {
      if (!t.due_date || t.status === "completed") return false;
      const [year, month, day] = t.due_date.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.getTime() === today.getTime();
    }).length;

    const pending = tasks.filter((t) => t.status === "pending").length;
    const requestsWithoutTasks = requests.filter(
      (r) =>
        !["completed", "resolved", "approved"].includes(r.status) &&
        !tasksByRequest[r.id],
    ).length;
    return { overdue, dueToday, pending, requestsWithoutTasks };
  }, [tasks, requests, tasksByRequest]);

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]",
      medium: "bg-blue-50 text-blue-600 border-blue-200",
      high: "bg-amber-50 text-amber-600 border-amber-200",
      urgent: "bg-red-50 text-red-600 border-red-200",
    };
    return colors[priority?.toLowerCase()] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-slate-100 text-slate-600 border-slate-200",
      pending_cm: "bg-purple-50 text-purple-600 border-purple-200",
      pending_hopb: "bg-indigo-50 text-indigo-600 border-indigo-200",
      in_progress: "bg-blue-50 text-blue-600 border-blue-200",
      completed: "bg-green-50 text-green-600 border-green-200",
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const getDueDateInfo = (dueDate: string | null) => {
    if (!dueDate) return null;

    // Parse the date components to avoid timezone shift issues from ISO strings
    const [year, month, day] = dueDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date.getTime() < today.getTime()) {
      return {
        label: "Overdue",
        color:
          "text-red-700 bg-red-100 px-2 py-0.5 rounded-md border border-red-200 shadow-sm animate-pulse",
      };
    }
    if (date.getTime() === today.getTime()) {
      return {
        label: "Today",
        color:
          "text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 shadow-sm",
      };
    }

    const days = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days <= 3)
      return {
        label: `${days} days left`,
        color:
          "text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200",
      };

    return { label: format(date, "MMM d"), color: "text-[#64748B]" };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-medium text-[#0F172A] italic">
            Task Management
          </h1>
          <p className="text-[#64748B]">
            Create and manage follow-up tasks for service requests.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTask(null);
            setSelectedRequestIdForNewTask(null);
            setShowCreateDialog(true);
          }}
          className="px-6 py-3 bg-[#0F172A] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1E293B] shadow-lg shadow-[#0F172A]/10 transition-all"
        >
          <Plus size={18} />
          <span>Create Task</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Overdue Tasks",
            value: stats.overdue,
            icon: AlertCircle,
            color: "text-red-500",
            bg: "bg-red-500/10",
          },
          {
            label: "Due Today",
            value: stats.dueToday,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Pending Tasks",
            value: stats.pending,
            icon: CheckCircle2,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Requests Needing Tasks",
            value: stats.requestsWithoutTasks,
            icon: ListTodo,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white border md:border-[#E2E8F0] p-6 rounded-[24px] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                {kpi.label}
              </p>
              <h3 className="text-3xl font-display font-bold text-[#0F172A]">
                {kpi.value}
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}
            >
              <kpi.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-2 flex flex-col md:flex-row gap-2 shadow-sm">
        <div className="relative flex-1 md:w-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            size={18}
          />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border-none rounded-[24px] text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all font-medium"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-[#F8FAFC] border-none rounded-[24px] text-sm font-bold text-[#475569] uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_cm">Pending CM</option>
            <option value="pending_hopb">Pending HOPB</option>
            <option value="in_progress">In Progress</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 bg-[#F8FAFC] border-none rounded-[24px] text-sm font-bold text-[#475569] uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tasks / Requests List */}
      <div className="bg-white border border-[#E2E8F0] rounded-[32px] overflow-hidden shadow-xl shadow-[#0F172A]/5 relative">
        <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-widest">
            Service Requests ({filteredRequests.length})
          </h2>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-[#64748B] text-sm">
              No service requests found matching your criteria.
            </div>
          ) : (
            filteredRequests.map((req) => {
              const linkedTask = tasksByRequest[req.id];
              const dueDateInfo = linkedTask
                ? getDueDateInfo(linkedTask.due_date)
                : null;

              return (
                <div
                  key={req.id}
                  className="p-6 hover:bg-[#F8FAFC]/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-[#0F172A] text-lg">
                          {req.request_id}
                        </span>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider bg-[#F1F5F9] px-2 py-1 rounded-md">
                          {req.service_type.replace(/-/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#475569] flex items-center gap-2">
                        {req.customer_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${getPriorityColor(req.priority)}`}
                      >
                        {req.priority}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${getStatusColor(req.status)}`}
                      >
                        {req.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {linkedTask ? (
                    <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-[#0F172A]">
                              {linkedTask.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${getStatusColor(linkedTask.status)}`}
                            >
                              {linkedTask.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs font-semibold text-[#64748B]">
                              Assigned to:{" "}
                              <span className="text-[#0F172A]">
                                {linkedTask.assigned_to.split("@")[0]}
                              </span>
                            </p>
                            {linkedTask.due_date && dueDateInfo && (
                              <div
                                className={`text-xs font-bold flex items-center gap-1.5 ${dueDateInfo.color}`}
                              >
                                <Calendar size={14} />
                                {dueDateInfo.label}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTask(linkedTask);
                              setSelectedRequestIdForNewTask(req.id);
                              setShowCreateDialog(true);
                            }}
                            className="p-2 bg-white border border-[#E2E8F0] shadow-sm text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(linkedTask.id)}
                            className="p-2 bg-white border border-[#E2E8F0] shadow-sm text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedTask(null);
                        setSelectedRequestIdForNewTask(req.id);
                        setShowCreateDialog(true);
                      }}
                      className="w-full py-3 border border-dashed border-[#CBD5E1] rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-all"
                    >
                      <Plus size={16} />
                      <span>Create Follow-up Task</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showCreateDialog && (
        <CreateTaskModal
          onClose={() => setShowCreateDialog(false)}
          initialTask={selectedTask}
          preselectedRequestId={selectedRequestIdForNewTask || ""}
          requests={requests}
          users={users}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {taskToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 relative"
            >
              <h2 className="text-xl font-bold text-[#0F172A] mb-2">
                Delete Task
              </h2>
              <p className="text-sm font-medium text-[#64748B] mb-6">
                Are you sure you want to delete this task? This action cannot be
                undone.
              </p>

              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#64748B] hover:bg-[#F1F5F9] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTask}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline modal component to maintain portability
function CreateTaskModal({
  onClose,
  initialTask,
  preselectedRequestId,
  requests,
  users,
}: {
  onClose: () => void;
  initialTask: Task | null;
  preselectedRequestId: string;
  requests: ServiceRequest[];
  users: User[];
}) {
  const [formData, setFormData] = useState<Partial<Task>>(
    initialTask || {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      due_date: "",
      task_date: format(new Date(), "yyyy-MM-dd"),
      assigned_to: "",
      task_type: "follow_up",
      linked_request_id: preselectedRequestId,
    },
  );

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const selectedRequestDetails = React.useMemo(() => {
    return requests.find((r) => r.id === formData.linked_request_id);
  }, [formData.linked_request_id, requests]);

  useEffect(() => {
    if (!initialTask && preselectedRequestId) {
      setFormData((prev) => ({
        ...prev,
        linked_request_id: preselectedRequestId,
        linked_visit_id: "",
        linked_lead_id: "",
      }));
    }
  }, [preselectedRequestId, initialTask]);

  const TASK_TYPES = [
    { value: "follow_up", label: "Follow Up" },
    { value: "reminder", label: "Reminder" },
    { value: "call", label: "Call" },
    { value: "meeting", label: "Meeting" },
    { value: "document", label: "Document Required" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialTask?.id) {
        await updateDoc(doc(db, "tasks", initialTask.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        const newRef = doc(collection(db, "tasks"));
        await setDoc(newRef, {
          ...formData,
          createdAt: serverTimestamp(),
        });
      }

      const isNewAssignment =
        !initialTask || initialTask.assigned_to !== formData.assigned_to;
      if (isNewAssignment && formData.assigned_to) {
        try {
          const mailRef = doc(collection(db, "mail"));
          await setDoc(mailRef, {
            to: formData.assigned_to,
            message: {
              subject: `Task Assigned: ${formData.title}`,
              text: `You have been assigned a new task: ${formData.title}\nPriority: ${formData.priority}\nDue Date: ${formData.due_date || formData.task_date || "N/A"}`,
              html: `<div><p>You have been assigned a new task: <strong>${formData.title}</strong></p><p>Priority: <span style="text-transform: uppercase;">${formData.priority}</span></p><p>Due Date: ${formData.due_date || formData.task_date || "N/A"}</p></div>`,
            },
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("Failed to send assignment notification email", err);
        }
      }

      onClose();
    } catch (err) {
      handleFirestoreError(
        err,
        initialTask ? OperationType.UPDATE : OperationType.CREATE,
        "tasks",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col"
        style={{ maxHeight: "calc(100vh - 32px)" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="text-xl font-bold text-[#0F172A]">
            {initialTask ? "Edit Task" : "Create Task"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
              Task Title
            </label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
                Task Type
              </label>
              <select
                value={formData.task_type}
                onChange={(e) =>
                  setFormData({ ...formData, task_type: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium"
              >
                {TASK_TYPES.map((tt) => (
                  <option key={tt.value} value={tt.value}>
                    {tt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
                Linked Request
              </label>
              <select
                value={formData.linked_request_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    linked_request_id: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium"
              >
                <option value="">None</option>
                {requests.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.request_id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
                Linked Visit ID
              </label>
              <input
                type="text"
                value={formData.linked_visit_id || ""}
                onChange={(e) =>
                  setFormData({ ...formData, linked_visit_id: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
                Linked Lead ID
              </label>
              <input
                type="text"
                value={formData.linked_lead_id || ""}
                onChange={(e) =>
                  setFormData({ ...formData, linked_lead_id: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          {selectedRequestDetails && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
              <p className="font-bold mb-2 border-b border-blue-200 pb-2">
                Request Details ({selectedRequestDetails.request_id})
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <p>
                  <span className="text-blue-700 font-semibold display-inline">
                    Customer:
                  </span>{" "}
                  {selectedRequestDetails.customer_name}
                </p>
                <p>
                  <span className="text-blue-700 font-semibold display-inline">
                    Service:
                  </span>{" "}
                  {selectedRequestDetails.service_type.replace(/-/g, " ")}
                </p>
                <p>
                  <span className="text-blue-700 font-semibold display-inline">
                    Priority:
                  </span>{" "}
                  <span className="uppercase text-[10px] bg-blue-200 px-1 py-0.5 rounded">
                    {selectedRequestDetails.priority}
                  </span>
                </p>
                <p>
                  <span className="text-blue-700 font-semibold display-inline">
                    Status:
                  </span>{" "}
                  <span className="uppercase text-[10px] bg-blue-200 px-1 py-0.5 rounded">
                    {selectedRequestDetails.status.replace(/_/g, " ")}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm focus:ring-2 focus:ring-[#D4AF37]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
                Task Entry (Backdate)
              </label>
              <input
                type="date"
                value={formData.task_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, task_date: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
              Assign To
            </label>
            <input
              type="text"
              placeholder="Email or Name"
              value={formData.assigned_to}
              onChange={(e) => {
                setFormData({ ...formData, assigned_to: e.target.value });
                setShowUserDropdown(true);
              }}
              onFocus={() => setShowUserDropdown(true)}
              onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium"
            />
            {showUserDropdown && formData.assigned_to && users.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                {users
                  .filter(
                    (u) =>
                      u.name
                        .toLowerCase()
                        .includes((formData.assigned_to || "").toLowerCase()) ||
                      u.email
                        .toLowerCase()
                        .includes((formData.assigned_to || "").toLowerCase()),
                  )
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, assigned_to: u.email });
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] flex flex-col transition-colors border-b last:border-b-0 border-[#E2E8F0]"
                    >
                      <span className="text-sm font-bold text-[#0F172A]">
                        {u.name}
                      </span>
                      <span className="text-xs text-[#64748B]">{u.email}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm font-medium"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#F1F5F9] text-[#64748B] font-bold rounded-xl hover:bg-[#E2E8F0] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B] shadow-lg shadow-[#0F172A]/10 transition-colors"
            >
              {initialTask ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
