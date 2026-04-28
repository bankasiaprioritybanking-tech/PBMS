import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus,
  ShieldCheck,
  History,
  Trash2,
  Edit,
  Lock,
  Unlock,
  Users as UsersIcon,
  Shield,
  FileText,
  X,
  Key,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, FormEvent } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { format } from 'date-fns';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import DataTable from '../components/shared/DataTable';


interface Permission {
  id: string;
  name: string;
  module: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissionIds: string[];
  parentRoleId?: string;
}

interface User {
  id: string;
  uid: string;
  userId: string;
  name: string;
  email: string;
  roleIds: string[];
  branch: string;
  functionalDesignation: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  isLocked: boolean;
}

interface UserLeave {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  userName?: string;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress: string;
  createdAt: any;
  userName?: string;
}

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('All Users');
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [isBulkAssigningRoles, setIsBulkAssigningRoles] = useState(false);
  const [bulkSelectedRoleIds, setBulkSelectedRoleIds] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [leaves, setLeaves] = useState<UserLeave[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Change password form state
  const [passwordForm, setPasswordForm] = useState({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const handleChangePassword = async (e: FormEvent) => {
      e.preventDefault();
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          setPasswordMessage({ text: 'Passwords do not match.', type: 'error' });
          return;
      }
      // Password validation: 1 capital letter, 1 small letter, 1 numeric, min 8 chars
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!re.test(passwordForm.newPassword)) {
          setPasswordMessage({ text: 'Password must be at least 8 chars, include 1 uppercase, 1 lowercase and 1 number.', type: 'error' });
          return;
      }
      
      setIsLoading(true);
      try {
          const user = auth.currentUser;
          if (user) {
              await updatePassword(user, passwordForm.newPassword);
              // Update metadata
              const usersRef = collection(db, 'users');
              const q = query(usersRef, where('uid', '==', user.uid));
              const snap = await getDocs(q);
              if (!snap.empty) {
                  await updateDoc(doc(db, 'users', snap.docs[0].id), {
                      passwordLastChanged: serverTimestamp(),
                      mustChangePassword: false,
                      updatedAt: serverTimestamp()
                  });
              }
              
              setPasswordMessage({ text: 'Successfully Saved', type: 'success' });
              setTimeout(() => {
                  setIsChangingPassword(false);
                  setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordMessage(null);
              }, 2000);
          }
      } catch (error: any) {
          setPasswordMessage({ text: error.message || 'Failed to update password.', type: 'error' });
      } finally {
          setIsLoading(false);
      }
  };
  
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedInheritedRoleId, setSelectedInheritedRoleId] = useState<string>('');
  const [searchTermRoles, setSearchTermRoles] = useState('');
  const [searchTermPerm, setSearchTermPerm] = useState('');
  
  const [idToInspect, setIdToInspect] = useState<string | null>(null);
  const [inspectingRights, setInspectingRights] = useState<any>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [assigningRolesToUser, setAssigningRolesToUser] = useState<User | null>(null);
  const [resetingPasswordUser, setResetingPasswordUser] = useState<User | null>(null);
  const [tempResetPassword, setTempResetPassword] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const [showInheritedInView, setShowInheritedInView] = useState(false);
  const [showInheritedInEdit, setShowInheritedInEdit] = useState(false);
  
  const handleAssignRoles = async (userId: string, roleIds: string[]) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        roleIds: roleIds,
        updatedAt: serverTimestamp()
      });
      await addDoc(collection(db, 'auditLogs'), {
        userId: auth.currentUser?.uid || 'unknown',
        targetUserId: assigningRolesToUser?.uid || userId,
        action: 'assign_roles',
        description: `Roles assigned to ${assigningRolesToUser?.name || 'user'}: ${roleIds.join(', ')}`,
        createdAt: serverTimestamp()
      });
      setAssigningRolesToUser(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };
  
  const handleBulkDeleteRoles = async () => {
    if (!confirm(`Are you sure you want to retire these ${selectedRoleIds.length} roles?`)) return;
    try {
      const promises = selectedRoleIds.map(async (roleId) => {
        await deleteDoc(doc(db, 'roles', roleId));
        await addDoc(collection(db, 'auditLogs'), {
          userId: auth.currentUser?.uid || 'unknown',
          targetUserId: roleId,
          action: 'delete_role',
          description: `Bulk deleted role: ${roleId}`,
          createdAt: serverTimestamp()
        });
      });
      await Promise.all(promises);
      setSelectedRoleIds([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'roles');
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRoleName(role.name);
    setNewRoleDesc(role.description || '');
    setSelectedPermissions(role.permissionIds || []);
    setSelectedInheritedRoleId(role.parentRoleId || '');
    setIsCreatingRole(true);
  };
  
  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to retire this role?')) return;
    try {
      // Assuming you have deleteDoc imported, if not add it
      // import { ... deleteDoc ... }
      await deleteDoc(doc(db, 'roles', roleId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'roles');
    }
  };
  
  const fetchEffectiveRights = async (staffId: string) => {
    setIsInspecting(true);
    setIdToInspect(staffId);
    try {
      const response = await fetch(`/api/v1/users/${staffId}/rights`);
      const data = await response.json();
      setInspectingRights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsInspecting(false);
    }
  };

  const getEffectivePermissionIds = (roleId: string, currentRoles: Role[]): string[] => {
    const role = currentRoles.find(r => r.id === roleId);
    if (!role) return [];
    
    let effectiveIds = new Set(role.permissionIds || []);
    if (role.parentRoleId) {
      const parentIds = getEffectivePermissionIds(role.parentRoleId, currentRoles);
      parentIds.forEach(id => effectiveIds.add(id));
    }
    return Array.from(effectiveIds);
  };

  const getInheritedPermissionIds = (roleId: string, currentRoles: Role[]): string[] => {
    const role = currentRoles.find(r => r.id === roleId);
    if (!role || !role.parentRoleId) return [];
    return getEffectivePermissionIds(role.parentRoleId, currentRoles);
  };

  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    userId: '',
    email: '',
    phone: '',
    branch: '',
    division: '',
    functionalDesignation: '',
    roleIds: [] as string[]
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const unsubRoles = onSnapshot(collection(db, 'roles'), (snap) => {
      setRoles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Role));
    });
    const unsubPerms = onSnapshot(collection(db, 'permissions'), (snap) => {
      setPermissions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Permission));
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User));
      setIsLoading(false);
    });
    const unsubLeaves = onSnapshot(collection(db, 'userLeaves'), (snap) => {
      setLeaves(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserLeave));
    });
    const unsubAudit = onSnapshot(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc')), (snap) => {
      setAuditLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AuditLog));
    });

    return () => {
      unsubRoles();
      unsubPerms();
      unsubUsers();
      unsubLeaves();
      unsubAudit();
    };
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeaves = leaves.filter(leave => {
    const user = users.find(u => u.uid === leave.userId);
    const userName = user?.name || '';
    const userId = user?.userId || '';
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const user = users.find(u => u.uid === log.userId);
    const userName = user?.name || '';
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggleLock = async (user: User) => {
    try {
      const isLocking = !user.isLocked;
      await updateDoc(doc(db, 'users', user.id), {
        isLocked: isLocking,
        updatedAt: serverTimestamp()
      });
      await addDoc(collection(db, 'auditLogs'), {
        userId: auth.currentUser?.uid || 'unknown',
        targetUserId: user.uid,
        action: isLocking ? 'lock' : 'unlock',
        description: `Account ${isLocking ? 'locked' : 'unlocked'} for ${user.name}`,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleResetPassword = async (user: User) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, userId: user.uid })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      // Force change on next login
      await updateDoc(doc(db, 'users', user.id), {
        mustChangePassword: true,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'auditLogs'), {
        userId: auth.currentUser?.uid || 'unknown',
        targetUserId: user.uid,
        action: 'reset_password',
        description: `Password reset initiated by Admin for ${user.name}`,
        createdAt: serverTimestamp()
      });

      setTempResetPassword(result.tempPassword);
    } catch (error: any) {
      alert(`Reset failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAssignRoles = async () => {
    try {
      const promises = selectedUserIds.map(async (id) => {
        const user = users.find(u => u.id === id);
        if (user) {
          await updateDoc(doc(db, 'users', user.id), {
            roleIds: bulkSelectedRoleIds,
            updatedAt: serverTimestamp()
          });
          await addDoc(collection(db, 'auditLogs'), {
            userId: auth.currentUser?.uid || 'unknown',
            targetUserId: user.uid,
            action: 'assign_roles',
            description: `Bulk roles assigned to ${user.name}: ${bulkSelectedRoleIds.join(', ')}`,
            createdAt: serverTimestamp()
          });
        }
      });
      await Promise.all(promises);
      setIsBulkAssigningRoles(false);
      setBulkSelectedRoleIds([]);
      setSelectedUserIds([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleBulkToggleLock = async (shouldLock: boolean) => {
    try {
      const promises = selectedUserIds.map(async (id) => {
        const user = users.find(u => u.id === id);
        if (user && user.isLocked !== shouldLock) {
          await updateDoc(doc(db, 'users', user.id), {
            isLocked: shouldLock,
            updatedAt: serverTimestamp()
          });
          await addDoc(collection(db, 'auditLogs'), {
            userId: auth.currentUser?.uid || 'unknown',
            targetUserId: user.uid,
            action: shouldLock ? 'lock' : 'unlock',
            description: `Bulk account ${shouldLock ? 'locked' : 'unlocked'} for ${user.name}`,
            createdAt: serverTimestamp()
          });
        }
      });
      await Promise.all(promises);
      setSelectedUserIds([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleCreateRole = async (e: FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const inheritedRole = roles.find(r => r.id === selectedInheritedRoleId);
      const allPermissionIds = Array.from(new Set([
        ...selectedPermissions,
        ...(inheritedRole ? inheritedRole.permissionIds : [])
      ]));

      if (editingRole) {
        await updateDoc(doc(db, 'roles', editingRole.id), {
          name: newRoleName,
          description: newRoleDesc,
          permissionIds: allPermissionIds,
          parentRoleId: selectedInheritedRoleId || null,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'roles'), {
          name: newRoleName,
          description: newRoleDesc,
          permissionIds: allPermissionIds,
          parentRoleId: selectedInheritedRoleId || null,
          createdAt: serverTimestamp()
        });
      }
      setNewRoleName('');
      setNewRoleDesc('');
      setSelectedPermissions([]);
      setSelectedInheritedRoleId('');
      setEditingRole(null);
      setIsCreatingRole(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'roles');
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const email = userForm.email.trim();
    const isValidDomain = email.endsWith('@bankasia-bd.com') || email === 'bankasia.prioritybanking@gmail.com';
    
    if (!isValidDomain) {
      setEmailError('Email must be a @bankasia-bd.com domain or the priority banking gmail.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Call Onboarding API for password generation (and mock email)
      const response = await fetch('/api/v1/users/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);

      // 2. Since we can't create Auth users from client without admin, 
      // we assume the IT admin will use the temp password provided in the mock API 
      // or we just save the profile. In a real app, the server would handle Auth creation.
      
      await addDoc(collection(db, 'users'), {
        ...userForm,
        uid: `auto_${Date.now()}`, // In reality, this would be the actual Auth UID from the server
        status: 'ACTIVE',
        isLocked: false,
        mustChangePassword: true,
        passwordLastChanged: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      alert(`User onboarding initiated. Temporary password: ${result.tempPassword} (Logged to console)`);
      
      setIsCreatingUser(false);
      setUserForm({
        name: '',
        userId: '',
        email: '',
        phone: '',
        branch: '',
        division: '',
        functionalDesignation: '',
        roleIds: []
      });
    } catch (error: any) {
      alert(`Onboarding failed: ${error.message}`);
      handleFirestoreError(error, OperationType.CREATE, 'users');
    } finally {
      setIsLoading(false);
    }
  };

  const seedData = async () => {
    const rolesToSeed = [
      'Admin',
      'Priority Relationship Manager (PRM)',
      'Priority Service Relationship Manager (PSRM)',
      'Center Manager (CM)',
      'Head Of Branch (HOB)',
      'Branch Service Relationship Manager',
      'Proposition Team',
      'Head Of Proposition',
      'Head Of Priority Banking',
      'Head Of Retail Banking'
    ];

    const permissionsToSeed = [
      { name: 'CREATE_USER', module: 'User Management' },
      { name: 'EDIT_USER', module: 'User Management' },
      { name: 'DELETE_USER', module: 'User Management' },
      { name: 'RESET_PASSWORD', module: 'User Management' },
      { name: 'SET_USER_RIGHTS', module: 'User Management' },
      { name: 'VIEW_USER', module: 'User Management' }
    ];

    try {
      for (const p of permissionsToSeed) {
        await addDoc(collection(db, 'permissions'), p);
      }
      for (const r of rolesToSeed) {
        await addDoc(collection(db, 'roles'), { name: r, permissionIds: [] });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const userColumns = [
    { 
      header: "User Details", 
      accessor: "name",
      render: (user: User) => (
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#0F172A] flex items-center justify-center font-bold text-[#D4AF37] shadow-xl shadow-[#0F172A]/5 border border-white/10 text-xs">
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F172A]">{user.name}</p>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-0.5">Staff ID: {user.userId}</p>
          </div>
        </div>
      )
    },
    { 
      header: "Group / Role", 
      accessor: "roleIds",
      render: (user: User) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {user.roleIds?.map(rid => {
            const role = roles.find(r => r.id === rid);
            return (
              <span key={rid} className="px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-[9px] font-bold text-[#64748B] uppercase">
                {role?.name || rid}
              </span>
            );
          })}
        </div>
      )
    },
    { 
      header: "Branch", 
      accessor: "branch",
      render: (user: User) => <span className="text-[11px] font-bold text-[#334155] uppercase tracking-widest bg-[#F1F5F9] px-2 py-1 rounded-md">{user.branch}</span>
    },
    { 
      header: "Status", 
      accessor: "status",
      render: (user: User) => (
        <StatusBadge status={user.isLocked ? 'locked' : user.status}>
          {user.isLocked ? 'Locked' : user.status}
        </StatusBadge>
      )
    },
    { 
      header: "Actions", 
      accessor: "id",
      className: "text-right",
      render: (user: User) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white rounded-xl border border-transparent hover:border-[#F1F5F9] shadow-sm transition-all" title="Edit">
            <Edit size={16} />
          </button>
          <button 
            onClick={() => setViewingUser(user)}
            className="p-2 text-[#64748B] hover:text-[#D4AF37] hover:bg-white rounded-xl border border-transparent hover:border-[#F1F5F9] shadow-sm transition-all" 
            title="View Details"
          >
            <FileText size={16} />
          </button>
          <button 
            onClick={() => setAssigningRolesToUser(user)}
            className="p-2 text-[#64748B] hover:text-[#D4AF37] hover:bg-white rounded-xl border border-transparent hover:border-[#F1F5F9] shadow-sm transition-all" 
            title="Manage Roles"
          >
            <Key size={16} />
          </button>
          <button 
            onClick={() => fetchEffectiveRights(user.userId)}
            className="p-2 text-[#64748B] hover:text-[#D4AF37] hover:bg-white rounded-xl border border-transparent hover:border-[#F1F5F9] shadow-sm transition-all" 
            title="Rights Mapping Audit"
          >
            <ShieldCheck size={16} />
          </button>
          <button 
            onClick={() => setResetingPasswordUser(user)}
            className="p-2 text-[#64748B] hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-[#F1F5F9] shadow-sm transition-all" 
            title="Reset Password"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={() => handleToggleLock(user)}
            className="p-2 text-[#64748B] hover:text-amber-600 hover:bg-white rounded-xl border border-transparent hover:border-[#F1F5F9] shadow-sm transition-all" 
            title={user.isLocked ? 'Unlock' : 'Lock'}
          >
            {user.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
          </button>
          <button className="p-2 text-[#64748B] hover:text-red-600 hover:bg-white rounded-xl border border-transparent hover:border-[#F1F5F9] shadow-sm transition-all" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const leaveColumns = [
    { 
      header: "Employee", 
      accessor: "userId",
      render: (leave: UserLeave) => {
        const user = users.find(u => u.uid === leave.userId);
        return (
          <div>
            <p className="text-[13px] font-bold text-[#1E293B]">{user?.name || 'Unknown Staff'}</p>
            <p className="text-[10px] text-[#64748B] uppercase">ID: {user?.userId}</p>
          </div>
        );
      }
    },
    { 
      header: "Duration", 
      accessor: "startDate",
      render: (leave: UserLeave) => <p className="text-[12px] font-medium text-[#1E293B]">{leave.startDate} to {leave.endDate}</p>
    },
    { 
      header: "Reason", 
      accessor: "reason"
    }
  ];

  const auditColumns = [
    { 
      header: "Timestamp", 
      accessor: "createdAt",
      render: (log: AuditLog) => (
        <p className="text-[11px] font-mono text-[#64748B]">
          {log.createdAt?.toDate ? format(log.createdAt.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'Recent'}
        </p>
      )
    },
    { 
      header: "Principal", 
      accessor: "userId",
      render: (log: AuditLog) => {
        const user = users.find(u => u.uid === log.userId);
        return <p className="text-[12px] font-bold text-[#1E293B]">{user?.name || 'System'}</p>;
      }
    },
    { 
      header: "Action Code", 
      accessor: "action",
      render: (log: AuditLog) => (
        <span className="px-2 py-1 bg-[#0F172A] text-[#D4AF37] rounded text-[9px] font-bold uppercase tracking-wider">{log.action}</span>
      )
    },
    { 
      header: "Trail Details", 
      accessor: "description"
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title={activeTab}
        description={
          activeTab === 'All Users' ? "Identity Lifecycle & Policy Enforcement" :
          activeTab === 'Roles & Rights' ? "Define staff entitlements and operational codes." :
          activeTab === 'User Leaves' ? "Manage staff leave schedules and coverage." :
          activeTab === 'Audit Log' ? "Banking-grade audit traceability and event logging." : ""
        }
        actions={
          <>
            {roles.length === 0 && (
              <button 
                onClick={seedData}
                className="px-6 py-3 bg-white border border-[#E2E8F0] rounded-2xl text-[#64748B] hover:text-[#D4AF37] transition-all text-[11px] font-bold uppercase tracking-widest"
              >
                Seed Standard Roles
              </button>
            )}
            <button 
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#0F172A] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#F8FAFC] transition-all shadow-sm"
            >
              <Key size={18} />
              Change Password
            </button>
            <button 
              onClick={() => setIsCreatingUser(true)}
              className="flex items-center gap-2 bg-[#D4AF37] text-[#0F172A] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#D4AF37]/90 transition-all shadow-sm"
            >
              <UserPlus size={18} />
              Onboard Staff
            </button>
            <button 
              onClick={() => setIsCreatingRole(true)}
              className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1E293B] transition-all shadow-sm"
            >
              <Plus size={18} />
              Design New Role
            </button>
          </>
        }
      />

      <AnimatePresence>
        {resetingPasswordUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 relative"
            >
              <button 
                onClick={() => {
                  setResetingPasswordUser(null);
                  setTempResetPassword(null);
                }}
                className="absolute top-6 right-6 p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <RotateCcw size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Reset Password</h3>
                <p className="text-sm text-[#64748B] mt-2">
                  Initiate a secure password reset for <span className="font-bold text-[#0F172A]">{resetingPasswordUser.name}</span>.
                </p>
              </div>

              {tempResetPassword ? (
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Temporary Password Generated</p>
                    <p className="text-2xl font-mono font-bold text-[#0F172A] tracking-wider py-2 bg-white rounded-xl border border-emerald-100 mb-2">
                      {tempResetPassword}
                    </p>
                    <p className="text-[10px] text-[#64748B]">Please provide this password to the staff member. They will be forced to change it upon login.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setResetingPasswordUser(null);
                      setTempResetPassword(null);
                    }}
                    className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:shadow-xl transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 italic">
                     <AlertCircle className="text-amber-600 shrink-0" size={18} />
                     <p className="text-[11px] text-amber-800 leading-relaxed">
                       This action will invalidate the current password immediately. A temporary password will be shown once confirmed.
                     </p>
                   </div>
                   
                   <div className="flex gap-3">
                     <button 
                       onClick={() => setResetingPasswordUser(null)}
                       className="flex-1 py-4 bg-[#F8FAFC] text-[#64748B] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#F1F5F9] transition-all"
                     >
                       Cancel
                     </button>
                     <button 
                        onClick={() => handleResetPassword(resetingPasswordUser)}
                        disabled={isLoading}
                        className="flex-1 py-4 bg-[#0F172A] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#1E293B] shadow-lg shadow-[#0F172A]/20 transition-all flex items-center justify-center gap-2"
                     >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Confirm Reset</>
                        )}
                     </button>
                   </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {idToInspect && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setIdToInspect(null)}
                className="absolute top-6 right-6 p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                  <Shield className="text-[#D4AF37]" size={24} />
                  <h3 className="text-xl font-bold text-[#0F172A]">RBAC Mapping Audit</h3>
                </div>
                <p className="text-sm text-[#64748B]">Effective Rights Catalog for Staff ID: {idToInspect}</p>
              </div>

              {isInspecting ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest italic text-animate-pulse">Traversing Relational Schema...</p>
                </div>
              ) : inspectingRights ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Principal</p>
                      <p className="text-sm font-bold text-[#0F172A]">{inspectingRights.fullName}</p>
                    </div>
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Branch</p>
                      <p className="text-sm font-bold text-[#0F172A]">{inspectingRights.branch || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Entitlement Profile</p>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-4">
                         {inspectingRights.roles?.map((r: any) => (
                           <span key={r.id} className="px-3 py-1 bg-[#0F172A] text-[#D4AF37] rounded-lg text-[10px] font-bold uppercase tracking-widest">
                             {r.name}
                           </span>
                         ))}
                       </div>
                       <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                         {inspectingRights.effectiveRights?.map((right: string) => (
                           <div key={right} className="flex items-center gap-2 p-3 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl text-[#334155]">
                             <ShieldCheck size={14} className="text-emerald-500" />
                             <span className="text-[11px] font-bold tracking-tight">{right}</span>
                           </div>
                         ))}
                         {inspectingRights.effectiveRights?.length === 0 && (
                           <div className="col-span-2 py-8 text-center bg-[#FEF2F2] border border-red-100 rounded-2xl">
                             <p className="text-xs font-bold text-red-600 uppercase tracking-widest">No Rights Assigned</p>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#F1F5F9]">
                    <button 
                      onClick={() => setIdToInspect(null)}
                      className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:shadow-xl transition-all"
                    >
                      Close Audit View
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}

        {!!viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setViewingUser(null)}
                className="absolute top-6 right-6 p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#0F172A]">{viewingUser.name}</h3>
                <p className="text-sm text-[#64748B]">{viewingUser.functionalDesignation}</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Status</label>
                      <div className="mt-1">
                        <StatusBadge status={viewingUser.isLocked ? 'locked' : viewingUser.status}>
                          {viewingUser.isLocked ? 'Locked' : viewingUser.status}
                        </StatusBadge>
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Branch</label>
                      <p className="text-xs font-bold text-[#1E293B]">{viewingUser.branch}</p>
                   </div>
                </div>
                 <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Roles</label>
                 <div className="flex flex-wrap gap-2">
                    {viewingUser.roleIds.map(rid => {
                        const role = roles.find(r => r.id === rid);
                        return <span key={rid} className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[10px] font-bold text-[#0F172A] uppercase">{role?.name || rid}</span>
                    })}
                 </div>
                 <button
                   onClick={() => {
                     setAssigningRolesToUser(viewingUser);
                     setViewingUser(null);
                   }}
                   className="flex items-center gap-2 mt-4 px-4 py-2 border border-[#E2E8F0] rounded-xl text-[10px] font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
                 >
                   <ShieldCheck size={14} />
                   Assign Roles
                 </button>
              </div>
            </motion.div>
          </div>
        )}

        {!!viewingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setViewingRole(null)}
                className="absolute top-6 right-6 p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#0F172A]">{viewingRole.name}</h3>
                {viewingRole.parentRoleId && roles.find(r => r.id === viewingRole.parentRoleId) && (
                    <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                        Inherits from: {roles.find(r => r.id === viewingRole.parentRoleId)?.name}
                    </p>
                )}
                <p className="text-sm text-[#64748B]">{viewingRole.description || 'Functional role mapping.'}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Direct Permissions</label>
                  <span className="text-[10px] font-bold text-[#D4AF37] px-2 py-0.5 bg-[#0F172A] rounded-lg">
                    {(viewingRole.permissionIds || []).length}
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {(viewingRole.permissionIds || []).map(pid => {
                     const perm = permissions.find(p => p.id === pid);
                     return perm ? (
                       <div key={pid} className="p-3 bg-white border border-[#F1F5F9] rounded-xl flex items-center justify-between shadow-sm">
                         <p className="text-xs font-bold text-[#1E293B]">{perm.name}</p>
                         <p className="text-[9px] font-bold text-[#94A3B8] uppercase">{perm.module}</p>
                       </div>
                     ) : null;
                  })}
                  {(viewingRole.permissionIds || []).length === 0 && (
                    <p className="text-xs text-[#94A3B8] italic p-4 text-center">No direct permissions assigned.</p>
                  )}
                </div>

                {viewingRole.parentRoleId && (
                  <div className="space-y-3 mt-4 border-t border-[#F1F5F9] pt-4">
                    <button 
                      onClick={() => setShowInheritedInView(!showInheritedInView)}
                      className="flex items-center justify-between w-full px-4 py-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <History size={14} className="text-[#D4AF37]" />
                        <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider">Inherited from {roles.find(r => r.id === viewingRole.parentRoleId)?.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                        {getInheritedPermissionIds(viewingRole.id, roles).length} Rights
                      </span>
                    </button>
                    
                    <AnimatePresence>
                      {showInheritedInView && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {getInheritedPermissionIds(viewingRole.id, roles).map(pid => {
                              const perm = permissions.find(p => p.id === pid);
                              return perm ? (
                                <div key={pid} className="p-2 border border-dashed border-[#E2E8F0] rounded-lg bg-[#FDFCFB]">
                                  <p className="text-[9px] font-bold text-[#334155]">{perm.name}</p>
                                  <p className="text-[7px] text-[#94A3B8] uppercase font-bold">{perm.module}</p>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {!!assigningRolesToUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setAssigningRolesToUser(null)}
                className="absolute top-6 right-6 p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#0F172A]">Assign Roles</h3>
                <p className="text-sm text-[#64748B]">Manage roles for {assigningRolesToUser.name}</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Available Roles</label>
                <div className="flex flex-wrap gap-2">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        const exists = assigningRolesToUser.roleIds.includes(role.id);
                        setAssigningRolesToUser({
                          ...assigningRolesToUser,
                          roleIds: exists 
                            ? assigningRolesToUser.roleIds.filter(id => id !== role.id) 
                            : [...assigningRolesToUser.roleIds, role.id]
                        });
                      }}
                      className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                        assigningRolesToUser.roleIds.includes(role.id)
                          ? 'bg-[#0F172A] border-[#0F172A] text-[#D4AF37]'
                          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#D4AF37]/30'
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-8">
                  <button 
                    type="button"
                    onClick={() => setAssigningRolesToUser(null)}
                    className="flex-1 py-4 text-xs font-bold text-[#64748B] uppercase tracking-widest hover:bg-[#F8FAFC] rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleAssignRoles(assigningRolesToUser.id, assigningRolesToUser.roleIds)}
                    className="flex-1 bg-[#D4AF37] text-[#0F172A] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#D4AF37]/10 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
            </motion.div>
          </div>
        )}

        {isChangingPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsChangingPassword(false)}
                className="absolute top-6 right-6 p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#0F172A]">Change Password</h3>
                <p className="text-sm text-[#64748B]">Update your PBMS credentials.</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                {passwordMessage && (
                    <div className={`p-4 rounded-xl text-xs font-bold ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {passwordMessage.text}
                    </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Old Password</label>
                  <input 
                    required
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">New Password</label>
                  <input 
                    required
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Confirm New Password</label>
                  <input 
                    required
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="flex-1 py-4 text-xs font-bold text-[#64748B] uppercase tracking-widest hover:bg-[#F8FAFC] rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#0F172A] text-[#D4AF37] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#0F172A]/10 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isBulkAssigningRoles && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsBulkAssigningRoles(false)}
                className="absolute top-6 right-6 p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#0F172A]">Bulk Assign Roles</h3>
                <p className="text-sm text-[#64748B]">Assign roles to {selectedUserIds.length} users</p>
              </div>

              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="Search roles..."
                  value={searchTermRoles}
                  onChange={(e) => setSearchTermRoles(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D4AF37]"
                />
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Available Roles</label>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {roles.filter(r => r.name.toLowerCase().includes(searchTermRoles.toLowerCase())).map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        const exists = bulkSelectedRoleIds.includes(role.id);
                        setBulkSelectedRoleIds(exists 
                          ? bulkSelectedRoleIds.filter(id => id !== role.id) 
                          : [...bulkSelectedRoleIds, role.id]
                        );
                      }}
                      className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                        bulkSelectedRoleIds.includes(role.id)
                          ? 'bg-[#0F172A] border-[#0F172A] text-[#D4AF37]'
                          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#D4AF37]/30'
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-8">
                  <button 
                    type="button"
                    onClick={() => setIsBulkAssigningRoles(false)}
                    className="flex-1 py-4 text-xs font-bold text-[#64748B] uppercase tracking-widest hover:bg-[#F8FAFC] rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleBulkAssignRoles}
                    className="flex-1 bg-[#D4AF37] text-[#0F172A] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#D4AF37]/10 transition-all"
                  >
                    Apply Roles
                  </button>
                </div>
            </motion.div>
          </div>
        )}

        {isCreatingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsCreatingUser(false)}
                className="absolute top-6 right-6 p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#0F172A]">Onboard New Staff</h3>
                <p className="text-sm text-[#64748B]">Configure baseline identity for banking operations</p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Full Name</label>
                    <input 
                      required
                      value={userForm.name}
                      onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                      className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Staff ID</label>
                    <input 
                      required
                      value={userForm.userId}
                      onChange={(e) => setUserForm({...userForm, userId: e.target.value})}
                      placeholder="Ex: 2024001"
                      className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Email Address</label>
                    <input 
                      required
                      type="email"
                      value={userForm.email}
                      onChange={(e) => {
                        setUserForm({...userForm, email: e.target.value});
                        if (emailError) setEmailError(null);
                      }}
                      className={`w-full px-6 py-4 bg-[#F8FAFC] border ${emailError ? 'border-red-500' : 'border-[#E2E8F0]'} rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium`}
                    />
                    {emailError && (
                      <p className="text-[10px] font-bold text-red-500 ml-2 animate-shake">{emailError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Contact Number</label>
                    <input 
                      required
                      value={userForm.phone}
                      onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Branch</label>
                    <input 
                      required
                      value={userForm.branch}
                      onChange={(e) => setUserForm({...userForm, branch: e.target.value})}
                      className="w-full px-4 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-[11px] font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Division</label>
                    <input 
                      required
                      value={userForm.division}
                      onChange={(e) => setUserForm({...userForm, division: e.target.value})}
                      className="w-full px-4 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-[11px] font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Designation</label>
                    <input 
                      required
                      value={userForm.functionalDesignation}
                      onChange={(e) => setUserForm({...userForm, functionalDesignation: e.target.value})}
                      className="w-full px-4 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-[11px] font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Assigned Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          const exists = userForm.roleIds.includes(role.id);
                          setUserForm({
                            ...userForm,
                            roleIds: exists 
                              ? userForm.roleIds.filter(id => id !== role.id) 
                              : [...userForm.roleIds, role.id]
                          });
                        }}
                        className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                          userForm.roleIds.includes(role.id)
                            ? 'bg-[#0F172A] border-[#0F172A] text-[#D4AF37]'
                            : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#D4AF37]/30'
                        }`}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreatingUser(false)}
                    className="flex-1 py-4 text-xs font-bold text-[#64748B] uppercase tracking-widest hover:bg-[#F8FAFC] rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#0F172A] text-[#D4AF37] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#0F172A]/10 transition-all"
                  >
                    Confirm Onboarding
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isCreatingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => {
                  setIsCreatingRole(false);
                  setSearchTermPerm('');
                }}
                className="absolute top-6 right-6 p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#0F172A]">{editingRole ? 'Edit Role' : 'Design New Role'}</h3>
                <p className="text-sm text-[#64748B]">{editingRole ? 'Update functional entitlements' : 'Assign granular rights to a functional role'}</p>
              </div>

              <form onSubmit={handleCreateRole} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Role Name</label>
                  <input 
                    required
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Ex: Priority RM"
                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Description</label>
                  <textarea 
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Responsibilities..."
                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium h-24 resize-none"
                  />
                </div>
                
                
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Inherit Rights From</label>
                  <select 
                    value={selectedInheritedRoleId}
                    onChange={(e) => {
                      setSelectedInheritedRoleId(e.target.value);
                      if (e.target.value) {
                         setShowInheritedInEdit(true);
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                  >
                    <option value="">None (Base Role)</option>
                    {roles
                        .filter(r => r.id !== editingRole?.id)
                        .map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  
                  {selectedInheritedRoleId && (
                    <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#F1F5F9]">
                      <button 
                        type="button"
                        onClick={() => setShowInheritedInEdit(!showInheritedInEdit)}
                        className="flex items-center justify-between w-full"
                      >
                         <div className="flex items-center gap-2">
                            <Shield className="text-[#D4AF37]" size={14} />
                            <span className="text-[10px] font-bold text-[#334155] uppercase tracking-wider">Preview Inherited Permissions</span>
                         </div>
                         <Plus size={14} className={`text-[#94A3B8] transition-transform ${showInheritedInEdit ? 'rotate-45' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {showInheritedInEdit && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-2 mt-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                              {getEffectivePermissionIds(selectedInheritedRoleId, roles).map(pid => {
                                 const perm = permissions.find(p => p.id === pid);
                                 return perm ? (
                                   <div key={pid} className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                     <span className="text-[9px] font-bold text-[#64748B]">{perm.name}</span>
                                   </div>
                                 ) : null;
                              })}
                            </div>
                            <p className="mt-3 text-[8px] font-medium text-[#94A3B8] italic leading-tight">
                              * These permissions will be included in the effective rights of this role automatically.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Entitlement Codes</label>
                    <span className="text-[10px] font-bold text-[#D4AF37] bg-[#0F172A] px-2 py-0.5 rounded-lg">
                      {selectedPermissions.length} selected
                    </span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      value={searchTermPerm}
                      onChange={(e) => setSearchTermPerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {permissions
                      .filter(p => p.name.toLowerCase().includes(searchTermPerm.toLowerCase()) || p.module.toLowerCase().includes(searchTermPerm.toLowerCase()))
                      .map(perm => (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => setSelectedPermissions(p => p.includes(perm.id) ? p.filter(id => id !== perm.id) : [...p, perm.id])}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedPermissions.includes(perm.id)
                            ? 'bg-[#0F172A] border-[#0F172A] text-[#D4AF37]'
                            : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#F1F5F9]'
                        }`}
                      >
                        <p className="text-[10px] font-bold truncate">{perm.name}</p>
                        <p className="text-[8px] opacity-70 uppercase">{perm.module}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsCreatingRole(false);
                      setSearchTermPerm('');
                    }}
                    className="flex-1 py-4 text-xs font-bold text-[#64748B] uppercase tracking-widest hover:bg-[#F8FAFC] rounded-2xl transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#0F172A] text-[#D4AF37] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    {editingRole ? 'Update Role' : 'Save Role'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All Users', 'Roles & Rights', 'User Leaves', 'Audit Log'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
              activeTab === tab 
                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-[#0F172A]/10' 
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#D4AF37]/30 hover:text-[#0F172A]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'All Users' ? (
          <motion.div
            key="users-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <DataTable 
              data={filteredUsers}
              columns={userColumns}
              isLoading={isLoading}
              onSearch={setSearchTerm}
              searchPlaceholder="Search by ID, name or email..."
              selectedIds={selectedUserIds}
              onToggleSelect={(id) => setSelectedUserIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
              onToggleSelectAll={() => setSelectedUserIds(prev => prev.length === filteredUsers.length ? [] : filteredUsers.map(u => u.id))}
            />
            {selectedUserIds.length > 0 && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl">
                <p className="text-sm font-bold">{selectedUserIds.length} users selected</p>
                <div className="flex gap-2">
                  <button onClick={() => handleBulkToggleLock(true)} className="px-4 py-2 bg-white text-[#0F172A] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-opacity-90">Lock Selected</button>
                  <button onClick={() => handleBulkToggleLock(false)} className="px-4 py-2 bg-white text-[#0F172A] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-opacity-90">Unlock Selected</button>
                  <button onClick={() => setIsBulkAssigningRoles(true)} className="px-4 py-2 bg-[#D4AF37] text-[#0F172A] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-opacity-90">Assign Roles</button>
                </div>
              </div>
            )}
          </motion.div>
        ) : activeTab === 'Roles & Rights' ? (
          <motion.div
            key="roles-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {selectedRoleIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl z-50">
            <p className="text-sm font-bold">{selectedRoleIds.length} roles selected</p>
            <button onClick={handleBulkDeleteRoles} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700">Delete Selected</button>
          </div>
        )}

        {roles.map((role) => (
              <div key={role.id} className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:shadow-[#0F172A]/5 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
                
            <div className="flex items-center justify-between mb-4">
              <input 
                type="checkbox" 
                checked={selectedRoleIds.includes(role.id)}
                onChange={() => setSelectedRoleIds(prev => prev.includes(role.id) ? prev.filter(i => i !== role.id) : [...prev, role.id])}
                className="w-5 h-5 rounded border-[#E2E8F0] text-[#D4AF37] focus:ring-0"
              />
              <div className="w-14 h-14 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#0F172A] border border-[#F1F5F9] group-hover:bg-[#0F172A] group-hover:text-[#D4AF37] transition-colors">
                <Key size={24} />
              </div>
            </div>

                <div className="relative z-10 mb-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-1">{role.name}</h3>
                    {role.parentRoleId && roles.find(r => r.id === role.parentRoleId) && (
                      <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                        Inherits from: {roles.find(r => r.id === role.parentRoleId)?.name}
                      </p>
                    )}
                    <p className="text-sm text-[#64748B] leading-relaxed line-clamp-2">{role.description || 'System-wide functional role mapping.'}</p>
                  </div>
                  <button onClick={() => setViewingRole(role)} className="p-2 bg-[#F8FAFC] rounded-xl hover:bg-[#D4AF37]/10 text-[#64748B] hover:text-[#D4AF37] transition-all">
                    <ShieldCheck size={18} />
                  </button>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                    <span>Entitlements</span>
                    <span className="px-2 py-1 bg-[#F1F5F9] text-[#0F172A] rounded-lg">{(role.permissionIds || []).length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(role.permissionIds || []).slice(0, 4).map(pid => {
                      const perm = permissions.find(p => p.id === pid);
                      return perm ? (
                        <span key={pid} className="px-3 py-1.5 bg-[#F8FAFC] border border-[#F1F5F9] text-[9px] font-bold text-[#334155] rounded-lg tracking-wider">
                          {perm.name}
                        </span>
                      ) : null;
                    })}
                    {(role.permissionIds || []).length > 4 && (
                      <span className="px-3 py-1.5 bg-[#F8FAFC] border border-[#F1F5F9] text-[9px] font-bold text-[#D4AF37] rounded-lg tracking-wider">
                        +{(role.permissionIds || []).length - 4} MORE
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#F1F5F9] flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setViewingRole(role)} className="text-xs font-bold text-[#0F172A] hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                    <FileText size={14} />
                    View Details
                  </button>
                  <button onClick={() => handleEditRole(role)} className="text-xs font-bold text-[#0F172A] hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                    <Edit size={14} />
                    Modify Role
                  </button>
                  <button onClick={() => handleDeleteRole(role.id)} className="text-xs font-bold text-[#64748B] hover:text-red-600 transition-colors flex items-center gap-2">
                    <Trash2 size={14} />
                    Retire
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => setIsCreatingRole(true)}
              className="border-2 border-dashed border-[#E2E8F0] p-10 rounded-[32px] flex flex-col items-center justify-center gap-4 text-[#64748B] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all group"
            >
               <div className="w-16 h-16 rounded-full bg-[#F8FAFC] flex items-center justify-center group-hover:bg-white transition-colors">
                 <Plus size={32} className="group-hover:text-[#D4AF37] transition-colors" />
               </div>
               <div className="text-center">
                 <p className="font-bold text-[#0F172A]">Design New Role</p>
                 <p className="text-xs">Establish functional entitlement policy</p>
               </div>
            </button>
          </motion.div>
        ) : activeTab === 'User Leaves' ? (
          <motion.div
            key="leaves-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <DataTable 
              data={filteredLeaves}
              columns={leaveColumns}
              isLoading={isLoading}
              onSearch={setSearchTerm}
              searchPlaceholder="Search leave records..."
            />
          </motion.div>
        ) : activeTab === 'Audit Log' ? (
          <motion.div
            key="audit-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <DataTable 
              data={filteredAuditLogs}
              columns={auditColumns}
              isLoading={isLoading}
              onSearch={setSearchTerm}
              searchPlaceholder="Audit trails..."
            />
          </motion.div>
        ) : (
          <div />
        )}
      </AnimatePresence>
    </div>
  );
}

