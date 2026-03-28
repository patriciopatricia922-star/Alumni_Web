export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const roleLabel = (role) => {
  return role === 'superadmin' ? 'Super Admin' : 'Admin';
};

export const statusBadge = (status) => {
  const map = {
    active:   { bg: '#00A63E', color: '#FFFFFF', label: 'Active' },
    inactive: { bg: '#FEF9C2', color: '#A65F00', label: 'Inactive' },
    disabled: { bg: '#FFE2E2', color: '#C10007', label: 'Disabled' },
  };
  return map[status] || { bg: '#F1F5F9', color: '#314158', label: status || '—' };
};

export const isEnabled = (user) => {
  return user.account_status === 'active';
};