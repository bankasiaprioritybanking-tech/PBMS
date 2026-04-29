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
  const [searchTermDetailPerm, setSearchTermDetailPerm] = useState('');
  
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

  const isCircular = (roleId: string, potentialParentId: string): boolean => {
    if (!potentialParentId) return false;
    if (roleId === potentialParentId) return true;
    const parent = roles.find(r => r.id === potentialParentId);
    if (!parent || !parent.parentRoleId) return false;
    return isCircular(roleId, parent.parentRoleId);
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

  const currentUser = users.find(u => u.uid === auth.currentUser?.uid);
  const currentUserPermissions = currentUser ? currentUser.roleIds.flatMap(rid => getEffectivePermissionIds(rid, roles)) : [];
  const hasPermission = (permName: string) => {
    const perm = permissions.find(p => p.name === permName);
    return perm ? currentUserPermissions.includes(perm.id) : false;
  };

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

  const handleUpdateStatus = async (user: User, value: string) => {
    try {
      if (value === 'LOCKED') {
        if (!user.isLocked) {
          await updateDoc(doc(db, 'users', user.id), {
            isLocked: true,
            updatedAt: serverTimestamp()
          });
          await addDoc(collection(db, 'auditLogs'), {
            userId: auth.currentUser?.uid || 'unknown',
            targetUserId: user.uid,
            action: 'lock',
            description: `Account locked for ${user.name}`,
            createdAt: serverTimestamp()
          });
        }
      } else {
        const updates: any = { status: value, updatedAt: serverTimestamp() };
        if (user.isLocked) {
          updates.isLocked = false;
        }
        await updateDoc(doc(db, 'users', user.id), updates);
        await addDoc(collection(db, 'auditLogs'), {
          userId: auth.currentUser?.uid || 'unknown',
          targetUserId: user.uid,
          action: 'update_status',
          description: `Status updated to ${value}${user.isLocked ? ' (and unlocked)' : ''} for ${user.name}`,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

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
        body: JSON.stringify({ 
          email: user.email, 
          userId: user.uid,
          adminId: auth.currentUser?.uid
        })
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
      if (editingRole) {
        await updateDoc(doc(db, 'roles', editingRole.id), {
          name: newRoleName,
          description: newRoleDesc,
          permissionIds: selectedPermissions,
          parentRoleId: selectedInheritedRoleId || null,
          updatedAt: serverTimestamp()
        });
        await addDoc(collection(db, 'auditLogs'), {
          userId: auth.currentUser?.uid || 'unknown',
          targetUserId: editingRole.id,
          action: 'edit_role',
          description: `Role updated: ${newRoleName}`,
          createdAt: serverTimestamp()
        });
      } else {
        const docRef = await addDoc(collection(db, 'roles'), {
          name: newRoleName,
          description: newRoleDesc,
          permissionIds: selectedPermissions,
          parentRoleId: selectedInheritedRoleId || null,
          createdAt: serverTimestamp()
        });
        await addDoc(collection(db, 'auditLogs'), {
          userId: auth.currentUser?.uid || 'unknown',
          targetUserId: docRef.id,
          action: 'create_role',
          description: `New role created: ${newRoleName}`,
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
      { name: 'CREATE_USER', module: 'User Management', description: 'Onboard new staff members' },
      { name: 'EDIT_USER', module: 'User Management', description: 'Modify staff profiles' },
      { name: 'DELETE_USER', module: 'User Management', description: 'Retire staff accounts' },
      { name: 'RESET_PASSWORD', module: 'User Management', description: 'Trigger secure credential reset' },
      { name: 'VIEW_USER', module: 'User Management', description: 'Access staff registry' },
      
      { name: 'VIEW_CUSTOMER', module: 'Customer Analytics', description: 'View detailed customer profiles' },
      { name: 'EDIT_CUSTOMER', module: 'Customer Analytics', description: 'Update customer information' },
      { name: 'EXPORT_CUSTOMER_DATA', module: 'Customer Analytics', description: 'Export sensitive data to CSV/Excel' },
      
      { name: 'CREATE_SERVICE', module: 'Service Requests', description: 'Initiate new VAS requests' },
      { name: 'APPROVE_SERVICE', module: 'Service Requests', description: 'Authorize pending requests' },
      { name: 'REJECT_SERVICE', module: 'Service Requests', description: 'Decline non-compliant requests' },
      
      { name: 'VIEW_BRANCH_STATS', module: 'Branch Operations', description: 'Access regional performance metrics' },
      { name: 'MANAGE_VAULT_LIMITS', module: 'Branch Operations', description: 'Configure branch cash parameters' },
      { name: 'INPUT_PARAMETER', module: 'Branch Operations', description: 'Entry for branch-specific codes' }
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
      render: (user: User) => {
        const displayStatus = user.isLocked ? 'LOCKED' : user.status;
        const mappedStatus = displayStatus === 'ACTIVE' ? 'active' : 
                             displayStatus === 'INACTIVE' ? 'inactive' : 
                             (displayStatus === 'BLOCKED' || displayStatus === 'LOCKED') ? 'blocked' : 'inactive';
        return (
          <StatusBadge status={mappedStatus}>
            <select
              value={displayStatus}
              onChange={(e) => handleUpdateStatus(user, e.target.value)}
              className="bg-transparent border-none p-0 m-0 text-inherit font-inherit uppercase tracking-inherit outline-none cursor-pointer appearance-none text-[10px] font-bold"
            >
              <option value="ACTIVE" className="bg-white text-slate-800">ACTIVE</option>
              <option value="INACTIVE" className="bg-white text-slate-800">INACTIVE</option>
              <option value="BLOCKED" className="bg-white text-slate-800">BLOCKED</option>
              {user.isLocked && <option value="LOCKED" className="bg-white text-slate-800">LOCKED</option>}
            </select>
          </StatusBadge>
        );
      }
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
          {hasPermission('RESET_PASSWORD') && (
            <button 
              onClick={() => setResetingPasswordUser(user)}
              className="p-2 text-[#64748B] hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-[#F1F5F9] shadow-sm transition-all" 
              title="Reset Password"
            >
              <RotateCcw size={16} />
            </button>
          )}
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
                    <div className="flex items-center gap-2 py-2 px-4 bg-white rounded-xl border border-emerald-100 mb-2">
                      <p className="flex-1 text-2xl font-mono font-bold text-[#0F172A] tracking-wider">
                        {tempResetPassword}
                      </p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(tempResetPassword);
                          alert('Password copied to clipboard');
                        }}
                        className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all"
                        title="Copy to Clipboard"
                      >
                        <FileText size={18} />
                      </button>
                    </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0F172A]/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative border border-white/20"
            >
              {/* Header Banner */}
              <div className="h-32 bg-[#0F172A] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] rounded-full -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16" />
                </div>
                <button 
                  onClick={() => setViewingRole(null)}
                  className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all z-20"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-6 left-8 flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-[#0F172A] shadow-xl border-4 border-white/10">
                    <Shield size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white italic font-display">{viewingRole.name}</h3>
                    <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Functional Operational Authority</p>
                  </div>
                </div>
              </div>

              <div className="p-10">
                <div className="grid grid-cols-3 gap-8 mb-10">
                  <div className="col-span-2 space-y-4">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-1">Role Objective</label>
                    <p className="text-sm text-[#334155] leading-relaxed italic border-l-4 border-[#D4AF37] pl-4">
                      {viewingRole.description || 'This role facilitates specific functional operations within the Bank Asia Priority banking ecosystem, governed by granular entitlement codes.'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Inheritance</label>
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9] text-center">
                      <p className="text-[11px] font-bold text-[#0F172A]">
                        {viewingRole.parentRoleId ? roles.find(r => r.id === viewingRole.parentRoleId)?.name : 'Base Identity'}
                      </p>
                      <p className="text-[8px] text-[#94A3B8] uppercase mt-1">Parent Hierarchy</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="flex items-center gap-2">
                        <Key size={16} className="text-[#D4AF37]" />
                        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest">Permission Registry</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={12} />
                          <input 
                            type="text"
                            placeholder="Search rights..."
                            className="pl-8 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[10px] font-medium outline-none focus:border-[#D4AF37] transition-all w-32"
                            value={searchTermDetailPerm}
                            onChange={(e) => setSearchTermDetailPerm(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                           <span className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[9px] font-bold text-[#64748B]">
                             {viewingRole.permissionIds?.length || 0} Direct
                           </span>
                           {viewingRole.parentRoleId && (
                             <span className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg text-[9px] font-bold text-[#D4AF37]">
                               {getInheritedPermissionIds(viewingRole.id, roles).length} Inherited
                             </span>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-[32px] border border-[#F1F5F9] p-6">
                      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Direct Permissions First */}
                        {viewingRole.permissionIds?.filter(pid => {
                          const perm = permissions.find(p => p.id === pid);
                          return !searchTermDetailPerm || (perm?.name.toLowerCase().includes(searchTermDetailPerm.toLowerCase()) || perm?.module.toLowerCase().includes(searchTermDetailPerm.toLowerCase()));
                        }).map(pid => {
                          const perm = permissions.find(p => p.id === pid);
                          return perm ? (
                            <div key={pid} className="group p-4 bg-white border border-[#E2E8F0] rounded-2xl flex items-center gap-3 hover:border-[#D4AF37] hover:shadow-lg transition-all">
                              <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-[#D4AF37]">
                                <ShieldCheck size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-[#0F172A] truncate">{perm.name}</p>
                                <p className="text-[8px] text-[#94A3B8] uppercase font-bold">{perm.module}</p>
                              </div>
                            </div>
                          ) : null;
                        })}

                        {/* Inherited Permissions */}
                        {getInheritedPermissionIds(viewingRole.id, roles).filter(pid => {
                          if (viewingRole.permissionIds?.includes(pid)) return false;
                          const perm = permissions.find(p => p.id === pid);
                          return !searchTermDetailPerm || (perm?.name.toLowerCase().includes(searchTermDetailPerm.toLowerCase()) || perm?.module.toLowerCase().includes(searchTermDetailPerm.toLowerCase()));
                        }).map(pid => {
                          const perm = permissions.find(p => p.id === pid);
                          if (!perm) return null;
                          return (
                            <div key={`inherited-${pid}`} className="p-4 bg-white/50 border border-dashed border-[#E2E8F0] rounded-2xl flex items-center gap-3 opacity-60">
                              <div className="w-8 h-8 rounded-lg bg-[#64748B]/10 flex items-center justify-center text-[#64748B]">
                                <History size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-[#334155] truncate">{perm.name}</p>
                                <p className="text-[8px] text-[#94A3B8] uppercase font-bold">Inherited</p>
                              </div>
                            </div>
                          );
                        })}

                        {viewingRole.permissionIds?.length === 0 && !viewingRole.parentRoleId && (
                          <div className="col-span-2 py-12 text-center">
                            <AlertCircle className="mx-auto text-[#CBD5E1] mb-2" size={32} />
                            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">No Entitlements Defined</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setViewingRole(null)}
                    className="flex-1 py-4 bg-[#F8FAFC] text-[#64748B] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#F1F5F9] transition-all"
                  >
                    Dismiss Details
                  </button>
                  <button 
                    onClick={() => {
                      handleEditRole(viewingRole);
                      setViewingRole(null);
                    }}
                    className="flex-1 py-4 bg-[#0F172A] text-[#D4AF37] rounded-2xl font-bold text-xs uppercase tracking-widest hover:shadow-xl shadow-[#0F172A]/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Modify Authority
                  </button>
                </div>
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
                        .filter(r => {
                          if (!editingRole) return true;
                          return r.id !== editingRole.id && !isCircular(editingRole.id, r.id);
                        })
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
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Entitlement Registry</label>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-[#0F172A] text-[#D4AF37] text-[10px] font-bold rounded-lg" title="Direct Permissions">{selectedPermissions.length}D</span>
                      {selectedInheritedRoleId && (
                        <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold rounded-lg" title="Total Effective Permissions">{getEffectivePermissionIds(selectedInheritedRoleId, roles).length + selectedPermissions.length}T</span>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                    <input 
                      type="text"
                      placeholder="Search granular rights or modules..."
                      value={searchTermPerm}
                      onChange={(e) => setSearchTermPerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-6 border border-[#F1F5F9] rounded-2xl p-4 bg-[#F8FAFC]/50">
                    {Array.from(new Set(permissions.map(p => p.module))).map(module => {
                      const modulePerms = permissions.filter(p => p.module === module);
                      const filteredModulePerms = modulePerms.filter(p => 
                        p.name.toLowerCase().includes(searchTermPerm.toLowerCase()) || 
                        p.module.toLowerCase().includes(searchTermPerm.toLowerCase())
                      );

                      if (filteredModulePerms.length === 0) return null;

                      const inheritedIds = selectedInheritedRoleId ? getEffectivePermissionIds(selectedInheritedRoleId, roles) : [];
                      
                      // Count direct selections (exclude inherited)
                      const directSelectedInModule = filteredModulePerms.filter(p => 
                        selectedPermissions.includes(p.id) && !inheritedIds.includes(p.id)
                      ).length;
                      
                      // Count total selectable in module (ones not inherited)
                      const selectableInModule = filteredModulePerms.filter(p => !inheritedIds.includes(p.id));

                      return (
                        <div key={module} className="space-y-2">
                          <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{module}</span>
                            {selectableInModule.length > 0 && (
                              <button 
                                type="button"
                                onClick={() => {
                                  const selectableIds = selectableInModule.map(p => p.id);
                                  if (directSelectedInModule === selectableInModule.length) {
                                    setSelectedPermissions(prev => prev.filter(id => !selectableIds.includes(id)));
                                  } else {
                                    setSelectedPermissions(prev => Array.from(new Set([...prev, ...selectableIds])));
                                  }
                                }}
                                className="text-[9px] font-bold text-[#D4AF37] hover:underline uppercase tracking-tighter"
                              >
                                {directSelectedInModule === selectableInModule.length ? 'Deselect Module' : 'Select Module'}
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {filteredModulePerms.map(perm => {
                              const isDirectSelected = selectedPermissions.includes(perm.id);
                              const isInherited = inheritedIds.includes(perm.id);
                              
                              return (
                                <button
                                  key={perm.id}
                                  type="button"
                                  disabled={isInherited}
                                  onClick={() => {
                                    setSelectedPermissions(prev => 
                                      isDirectSelected ? prev.filter(id => id !== perm.id) : [...prev, perm.id]
                                    );
                                  }}
                                  className={`p-3 rounded-xl border text-left transition-all relative group ${
                                    isInherited 
                                      ? 'bg-emerald-50/30 border-emerald-100/50 opacity-80 cursor-not-allowed selection:bg-transparent'
                                      : isDirectSelected
                                        ? 'bg-[#0F172A] border-[#0F172A] text-[#D4AF37] shadow-lg shadow-[#0F172A]/10'
                                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#D4AF37]/30'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-[10px] font-bold truncate pr-4">{perm.name}</p>
                                    {isDirectSelected && <ShieldCheck size={10} className="text-[#D4AF37] shrink-0" />}
                                    {isInherited && <Shield size={10} className="text-emerald-500 shrink-0" />}
                                  </div>
                                  <p className={`text-[8px] uppercase truncate ${isDirectSelected ? 'text-white/60' : 'text-[#94A3B8]'}`}>
                                    {isInherited ? 'Inherited Policy' : (perm.description || 'Access Control')}
                                  </p>
                                  
                                  {isInherited && (
                                    <div className="absolute top-1 right-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
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
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-[#E2E8F0] shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                <input 
                  type="text"
                  placeholder="Search functional roles by name or description..."
                  value={searchTermRoles}
                  onChange={(e) => setSearchTermRoles(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-[#F8FAFC] border border-transparent rounded-xl focus:border-[#D4AF37] focus:bg-white transition-all text-sm font-medium outline-none"
                />
                {searchTermRoles && (
                  <button 
                    onClick={() => setSearchTermRoles('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button 
                onClick={() => {
                  setEditingRole(null);
                  setNewRoleName('');
                  setNewRoleDesc('');
                  setSelectedPermissions([]);
                  setSelectedInheritedRoleId('');
                  setIsCreatingRole(true);
                }}
                className="flex items-center justify-center gap-2 bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#1E293B] transition-all shadow-sm"
              >
                <Plus size={16} />
                Create New Role
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedRoleIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl z-50">
            <p className="text-sm font-bold">{selectedRoleIds.length} roles selected</p>
            <button onClick={handleBulkDeleteRoles} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700">Delete Selected</button>
          </div>
        )}

        {roles
          .filter(r => 
            r.name.toLowerCase().includes(searchTermRoles.toLowerCase()) || 
            (r.description || '').toLowerCase().includes(searchTermRoles.toLowerCase())
          ).length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[32px] border border-[#E2E8F0] border-dashed">
              <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#D4AF37] mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">No matching roles</h3>
              <p className="text-[#64748B] text-sm mt-1">Try adjusting your search criteria or create a new role.</p>
              <button 
                onClick={() => setSearchTermRoles('')}
                className="mt-6 text-[#D4AF37] font-bold text-xs uppercase tracking-widest hover:underline"
              >
                Clear Search
              </button>
            </div>
          ) : roles
          .filter(r => 
            r.name.toLowerCase().includes(searchTermRoles.toLowerCase()) || 
            (r.description || '').toLowerCase().includes(searchTermRoles.toLowerCase())
          )
          .map((role) => (
              <div 
                key={role.id} 
                onClick={() => setViewingRole(role)}
                className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:shadow-[#0F172A]/5 transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
                
            <div className="flex items-center justify-between mb-4">
              <input 
                type="checkbox" 
                checked={selectedRoleIds.includes(role.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  setSelectedRoleIds(prev => prev.includes(role.id) ? prev.filter(i => i !== role.id) : [...prev, role.id]);
                }}
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
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingRole(role);
                    }} 
                    className="p-2 bg-[#F8FAFC] rounded-xl hover:bg-[#D4AF37]/10 text-[#64748B] hover:text-[#D4AF37] transition-all"
                  >
                    <ShieldCheck size={18} />
                  </button>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                    <span>Entitlements</span>
                    <div className="flex gap-1">
                      <span className="px-2 py-1 bg-[#F1F5F9] text-[#0F172A] rounded-lg" title="Direct Permissions">{(role.permissionIds || []).length}D</span>
                      {role.parentRoleId && (
                        <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg" title="Total Effective Permissions">{getEffectivePermissionIds(role.id, roles).length}T</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getEffectivePermissionIds(role.id, roles).slice(0, 4).map(pid => {
                      const perm = permissions.find(p => p.id === pid);
                      const isInherited = !(role.permissionIds || []).includes(pid);
                      return perm ? (
                        <span 
                          key={pid} 
                          className={`px-3 py-1.5 border rounded-lg text-[9px] font-bold tracking-wider ${
                            isInherited 
                              ? 'bg-white border-[#E2E8F0] border-dashed text-[#94A3B8]' 
                              : 'bg-[#F8FAFC] border-[#F1F5F9] text-[#334155]'
                          }`}
                        >
                          {perm.name}
                        </span>
                      ) : null;
                    })}
                    {getEffectivePermissionIds(role.id, roles).length > 4 && (
                      <span className="px-3 py-1.5 bg-[#F8FAFC] border border-[#F1F5F9] text-[9px] font-bold text-[#D4AF37] rounded-lg tracking-wider">
                        +{getEffectivePermissionIds(role.id, roles).length - 4} MORE
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#F1F5F9] flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingRole(role);
                    }} 
                    className="text-xs font-bold text-[#0F172A] hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                  >
                    <FileText size={14} />
                    View Details
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRole(role);
                    }} 
                    className="text-xs font-bold text-[#0F172A] hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Modify Role
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRole(role.id);
                    }} 
                    className="text-xs font-bold text-[#64748B] hover:text-red-600 transition-colors flex items-center gap-2"
                  >
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
          </div>
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

