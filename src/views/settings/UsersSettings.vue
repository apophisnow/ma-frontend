<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>{{ $t("auth.user_management") }}</v-toolbar-title>
      <v-spacer />
    </v-toolbar>

    <v-tabs v-model="tab" class="mt-4">
      <v-tab :to="{ name: 'usersettings' }">{{ $t("auth.users") }}</v-tab>
      <v-tab :to="{ name: 'rolesettings' }">{{ $t("auth.roles") }}</v-tab>
      <v-tab :to="{ name: 'permissionsettings' }">{{
        $t("auth.permissions")
      }}</v-tab>
    </v-tabs>

    <div class="mt-4">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const tab = ref(0);
</script>
