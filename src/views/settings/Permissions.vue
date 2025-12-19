<template>
  <v-container>
    <v-row>
      <v-col>
        <v-toolbar flat>
          <v-toolbar-title>{{ $t("auth.permissions") }}</v-toolbar-title>
          <v-spacer />
        </v-toolbar>

        <v-card class="mt-4 pa-4">
          <div class="text-subtitle-1 mb-4">
            {{ $t("auth.permissions_intro") }}
          </div>

          <v-table>
            <thead>
              <tr>
                <th>{{ $t("auth.name") }}</th>
                <th>{{ $t("auth.description") }}</th>
                <th>{{ $t("auth.permission_scope") }}</th>
                <th>{{ $t("actions") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in perms" :key="p.scope">
                <td style="white-space: nowrap">{{ p.name }}</td>
                <td>{{ p.description }}</td>
                <td style="white-space: nowrap">
                  <code>{{ p.scope }}</code>
                </td>
                <td>
                  <v-btn small variant="text" @click="copy(p.scope)">{{
                    $t("copy")
                  }}</v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { api } from "@/plugins/api";

const { t } = useI18n();

interface Permission {
  scope: string;
  name: string;
  description: string;
}

const perms = ref<Permission[]>([]);

async function loadPermissions() {
  try {
    const permissions = await api.sendCommand("rbac/permissions");
    perms.value = permissions as Permission[];
  } catch (error) {
    console.error("Failed to load permissions:", error);
  }
}

onMounted(() => {
  loadPermissions();
});

function copy(text: string) {
  try {
    void navigator.clipboard.writeText(text);
    // toast could be added via vuetify-sonner, keep simple for now
    alert(`${t("copied")}: ${text}`);
  } catch (e) {
    alert(t("copy_failed"));
  }
}
</script>
