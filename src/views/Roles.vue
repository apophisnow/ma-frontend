<template>
  <v-container>
    <v-row>
      <v-col>
        <v-toolbar flat>
          <v-toolbar-title>{{ $t("auth.roles") }}</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" @click="showCreate = true">{{
            $t("create")
          }}</v-btn>
        </v-toolbar>

        <v-card class="mt-4">
          <v-data-table :items="roles" :headers="headers" item-key="role_id">
            <template #item.is_system="{ item }">
              <v-chip v-if="item.is_system" size="small" color="primary">
                {{ $t("auth.system") }}
              </v-chip>
              <v-chip v-else size="small" color="success">
                {{ $t("auth.user") }}
              </v-chip>
            </template>
            <template #item.permissions="{ item }">
              <div style="max-width: 400px; white-space: normal">
                {{ item.permissions.join(", ") }}
              </div>
            </template>
            <template #item.actions="{ item }">
              <div style="display: flex; gap: 4px">
                <v-btn
                  v-if="!item.is_system"
                  icon
                  size="small"
                  @click="editRole(item)"
                  ><v-icon>mdi-pencil</v-icon></v-btn
                >
                <v-btn
                  v-if="!item.is_system"
                  icon
                  size="small"
                  @click="deleteRoleConfirm(item)"
                  ><v-icon color="red">mdi-delete</v-icon></v-btn
                >
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showCreate" max-width="600">
      <v-card>
        <v-card-title>{{ $t("auth.create_role") }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" :label="$t('auth.role_name')" />
          <v-text-field
            v-model="form.description"
            :label="$t('auth.description')"
          />

          <div class="mb-2">
            <div class="text-caption mb-1">
              {{ $t("settings.quick_permissions") }}
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap">
              <v-btn
                v-for="p in quickPerms"
                :key="p.scope"
                small
                variant="outlined"
                @click="addQuickPerm(p.scope)"
              >
                {{ p.label }}
              </v-btn>
            </div>
          </div>

          <v-combobox
            v-model="form.permissions"
            :label="$t('auth.permissions')"
            multiple
            chips
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showCreate = false">{{ $t("cancel") }}</v-btn>
          <v-btn color="primary" @click="handleCreate">{{
            $t("create")
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEdit" max-width="600">
      <v-card>
        <v-card-title>{{ $t("auth.edit_role") }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.name"
            :label="$t('auth.role_name')"
            :disabled="true"
          />
          <v-text-field
            v-model="form.description"
            :label="$t('auth.description')"
          />

          <div class="mb-2">
            <div class="text-caption mb-1">
              {{ $t("settings.quick_permissions") }}
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap">
              <v-btn
                v-for="p in quickPerms"
                :key="p.scope"
                small
                variant="outlined"
                @click="addQuickPerm(p.scope)"
              >
                {{ p.label }}
              </v-btn>
            </div>
          </div>

          <v-combobox
            v-model="form.permissions"
            :label="$t('auth.permissions')"
            multiple
            chips
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showEdit = false">{{ $t("cancel") }}</v-btn>
          <v-btn color="primary" @click="handleUpdate">{{ $t("save") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoles } from "@/composables/useRoles";
import { toast } from "vuetify-sonner";
import { useI18n } from "vue-i18n";
import { PermissionScope } from "@/plugins/api/interfaces";
import type { Role } from "@/plugins/api/interfaces";

const { t } = useI18n();
const { roles, fetchRoles, createRole, updateRole, deleteRole } = useRoles();

const showCreate = ref(false);
const showEdit = ref(false);
const form = ref<{
  role_id?: string;
  name: string;
  description: string;
  permissions: string[];
}>({ name: "", description: "", permissions: [] });

const quickPerms = [
  {
    scope: PermissionScope.PLAYER_CONTROL,
    label: t("perm.player_control"),
  },
  {
    scope: PermissionScope.PLAYER_VOLUME,
    label: t("perm.player_volume"),
  },
  {
    scope: PermissionScope.PLAYER_QUEUE,
    label: t("perm.player_queue"),
  },
  {
    scope: PermissionScope.LIBRARY_READ,
    label: t("perm.library_read"),
  },
  {
    scope: PermissionScope.LIBRARY_WRITE,
    label: t("perm.library_write"),
  },
  {
    scope: PermissionScope.PLAYLIST_READ,
    label: t("perm.playlist_read"),
  },
  {
    scope: PermissionScope.PLAYLIST_WRITE,
    label: t("perm.playlist_write"),
  },
];

function addQuickPerm(scope: PermissionScope) {
  const scopeValue = scope.valueOf();
  if (!form.value.permissions.includes(scopeValue)) {
    form.value.permissions.push(scopeValue);
  }
}

const headers = [
  { title: t("auth.role"), key: "name", value: "name" },
  { title: t("auth.description"), key: "description", value: "description" },
  { title: t("auth.type"), key: "is_system", value: "is_system" },
  { title: t("auth.permissions"), key: "permissions", value: "permissions" },
  { title: t("actions"), key: "actions", value: "actions" },
];

onMounted(() => fetchRoles());

function editRole(item: Role) {
  form.value = {
    role_id: item.role_id,
    name: item.name,
    description: item.description || "",
    permissions: [...(item.permissions || [])],
  };
  showEdit.value = true;
}

async function handleCreate() {
  try {
    const ok = await createRole(
      form.value.name,
      form.value.description,
      form.value.permissions,
    );
    if (ok) {
      toast.success(t("auth.role_created"));
      showCreate.value = false;
      form.value = { name: "", description: "", permissions: [] };
      await fetchRoles();
    } else {
      toast.error(t("auth.failed_to_create_role"));
    }
  } catch (e) {
    toast.error(t("auth.failed_to_create_role"));
  }
}

async function handleUpdate() {
  if (!form.value.role_id) return;
  try {
    const ok = await updateRole(
      form.value.role_id,
      form.value.name,
      form.value.description,
      form.value.permissions,
    );
    if (ok) {
      toast.success(t("auth.role_updated"));
      showEdit.value = false;
      await fetchRoles();
    } else {
      toast.error(t("auth.failed_to_update_role"));
    }
  } catch (e) {
    toast.error(t("auth.failed_to_update_role"));
  }
}

async function deleteRoleConfirm(item: Role) {
  if (item.is_system) {
    toast.error(t("auth.cannot_delete_system_role"));
    return;
  }
  if (!confirm(t("auth.confirm_delete_role", { name: item.name }))) return;
  try {
    const ok = await deleteRole(item.role_id);
    if (ok) {
      toast.success(t("auth.role_deleted"));
      await fetchRoles();
    } else {
      toast.error(t("auth.failed_to_delete_role"));
    }
  } catch (e) {
    toast.error(t("auth.failed_to_delete_role"));
  }
}
</script>
