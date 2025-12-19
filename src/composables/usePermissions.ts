import { ref } from "vue";
import { api } from "@/plugins/api";

export function usePermissions() {
  const permissions = ref<
    Array<{
      id: string;
      name: string;
      description?: string;
      patterns: string[];
    }>
  >([]);
  const loading = ref(false);

  async function fetchPermissions() {
    loading.value = true;
    try {
      const res = await api.sendCommand<any[]>("auth/permissions");
      permissions.value = res || [];
    } finally {
      loading.value = false;
    }
  }

  return {
    permissions,
    loading,
    fetchPermissions,
  };
}
