import { ref } from "vue";
import { api } from "@/plugins/api";
import type { Role } from "@/plugins/api/interfaces";

export function useRoles() {
  const roles = ref<Role[]>([]);
  const loading = ref(false);

  async function fetchRoles() {
    loading.value = true;
    try {
      const res = await api.getRoles();
      roles.value = res || [];
    } finally {
      loading.value = false;
    }
  }

  async function createRole(
    name: string,
    description: string,
    permissions: string[],
  ) {
    try {
      await api.createRole(name, description, permissions);
      return true;
    } catch (error) {
      console.error("Error creating role:", error);
      return false;
    }
  }

  async function updateRole(
    roleId: string,
    name?: string,
    description?: string,
    permissions?: string[],
  ) {
    try {
      await api.updateRole(roleId, { name, description, permissions });
      return true;
    } catch (error) {
      console.error("Error updating role:", error);
      return false;
    }
  }

  async function deleteRole(roleId: string) {
    try {
      await api.deleteRole(roleId);
      return true;
    } catch (error) {
      console.error("Error deleting role:", error);
      return false;
    }
  }

  return {
    roles,
    loading,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
}
