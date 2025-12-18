import { computed } from 'vue';
import { store } from '@/plugins/store';
import { useRoles } from './useRoles';

function patternMatches(pattern: string, command: string) {
  if (!pattern) return false;
  if (pattern === '*') return true;
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return command.startsWith(prefix);
  }
  return pattern === command;
}

export function useAuthorization() {
  const { roles, fetchRoles } = useRoles();

  async function ensureRoles() {
    if (!roles.value || roles.value.length === 0) {
      await fetchRoles();
    }
  }

  function getCurrentRolePermissions(): string[] {
    const roleName = store.currentUser?.role;
    if (!roleName) return [];
    const role = roles.value.find((r: any) => r.role_name === roleName);
    return role?.permissions || [];
  }

  async function isAllowed(command: string): Promise<boolean> {
    await ensureRoles();
    const perms = getCurrentRolePermissions();
    for (const p of perms) {
      if (patternMatches(p, command)) return true;
    }
    return false;
  }

  // synchronous helper using current cached roles (may be stale)
  function isAllowedSynced(command: string): boolean {
    const perms = getCurrentRolePermissions();
    for (const p of perms) {
      if (patternMatches(p, command)) return true;
    }
    return false;
  }

  return {
    roles,
    fetchRoles,
    isAllowed,
    isAllowedSynced,
  };
}
