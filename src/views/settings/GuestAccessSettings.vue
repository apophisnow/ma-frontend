<template>
  <Container>
    <div v-if="loading" class="loading-wrapper">
      <v-progress-circular indeterminate size="64" color="primary" />
    </div>
    <div v-else-if="guestAccessInfo" class="guest-access-wrapper">
      <!-- Hero Card -->
      <v-card class="hero-card mb-6" elevation="0" rounded="lg">
        <v-card-item class="hero-content">
          <div class="hero-icon-wrapper">
            <v-icon size="48" color="primary">mdi-account-key</v-icon>
          </div>
          <v-card-title class="hero-title">
            {{ t("settings.guest_access_title") }}
          </v-card-title>
          <p class="hero-description">
            {{ t("settings.guest_access_description") }}
          </p>
          <div class="feature-grid">
            <div class="feature-item">
              <v-icon size="20" color="primary">mdi-check-circle</v-icon>
              <span>{{ t("settings.guest_access_feature_no_password") }}</span>
            </div>
            <div class="feature-item">
              <v-icon size="20" color="primary">mdi-check-circle</v-icon>
              <span>{{ t("settings.guest_access_feature_permissions") }}</span>
            </div>
            <div class="feature-item">
              <v-icon size="20" color="primary">mdi-check-circle</v-icon>
              <span>{{ t("settings.guest_access_feature_qr") }}</span>
            </div>
            <div class="feature-item">
              <v-icon size="20" color="primary">mdi-check-circle</v-icon>
              <span>{{ t("settings.guest_access_feature_control") }}</span>
            </div>
          </div>
        </v-card-item>
      </v-card>

      <!-- Status Card -->
      <v-card class="status-card mb-6" elevation="0" rounded="lg">
        <v-card-item class="status-header">
          <div class="d-flex align-center justify-space-between w-100">
            <div>
              <v-card-title class="status-title">
                {{ t("settings.guest_access_status_title") }}
              </v-card-title>
              <div class="status-text">
                {{
                  guestAccessInfo.enabled
                    ? t("settings.guest_access_enabled")
                    : t("settings.guest_access_disabled")
                }}
              </div>
            </div>
            <v-switch
              :model-value="guestAccessInfo.enabled"
              :loading="switching"
              :disabled="switching"
              color="primary"
              hide-details
              class="status-switch"
              @update:model-value="toggleGuestAccess"
            />
          </div>
        </v-card-item>
      </v-card>

      <!-- Guest URL Card -->
      <v-card
        v-if="guestAccessInfo.enabled && guestAccessInfo.guest_url"
        class="guest-url-card mb-6"
        elevation="0"
        rounded="lg"
      >
        <v-card-item class="guest-url-header">
          <v-icon size="28" color="primary" class="mr-2"
            >mdi-link-variant</v-icon
          >
          <v-card-title class="guest-url-title">
            {{ t("settings.guest_access_link_title") }}
          </v-card-title>
        </v-card-item>
        <v-card-text class="guest-url-content">
          <p class="guest-url-explanation">
            {{ t("settings.guest_access_link_description") }}
          </p>

          <!-- URL Display -->
          <div class="url-display-wrapper">
            <div class="url-box">
              <code class="url-text">{{ guestAccessInfo.guest_url }}</code>
            </div>
            <v-btn
              icon="mdi-content-copy"
              variant="text"
              size="small"
              color="primary"
              class="copy-button"
              :title="t('settings.guest_access_copy_url')"
              @click="copyGuestUrl"
            />
          </div>

          <!-- QR Code Section -->
          <div class="qr-code-section">
            <div class="qr-code-title">
              <v-icon size="20" color="primary" class="mr-2">mdi-qrcode</v-icon>
              {{ t("settings.guest_access_qr_code_title") }}
            </div>
            <p class="qr-code-description">
              {{ t("settings.guest_access_qr_code_description") }}
            </p>
            <div class="qr-code-wrapper">
              <img
                v-if="qrCodeDataUrl"
                :src="qrCodeDataUrl"
                :alt="t('settings.guest_access_qr_code_alt')"
                class="qr-code-image"
              />
              <v-progress-circular
                v-else
                indeterminate
                size="32"
                color="primary"
              />
            </div>
          </div>

          <!-- Regenerate Token Button -->
          <div class="actions-section">
            <v-btn
              color="warning"
              variant="outlined"
              prepend-icon="mdi-refresh"
              :loading="regenerating"
              :disabled="regenerating"
              @click="regenerateToken"
            >
              {{ t("settings.guest_access_regenerate") }}
            </v-btn>
            <p class="action-hint">
              {{ t("settings.guest_access_regenerate_hint") }}
            </p>
          </div>
        </v-card-text>
      </v-card>

      <!-- Permissions Card -->
      <v-card
        v-if="guestAccessInfo.enabled"
        class="permissions-card mb-6"
        elevation="0"
        rounded="lg"
      >
        <v-card-item class="permissions-header">
          <v-icon size="28" color="primary" class="mr-2"
            >mdi-shield-account</v-icon
          >
          <v-card-title class="permissions-title">
            {{ t("settings.guest_access_permissions_title") }}
          </v-card-title>
        </v-card-item>
        <v-card-text class="permissions-content">
          <p class="permissions-explanation">
            {{ t("settings.guest_access_permissions_description") }}
          </p>

          <!-- <div class="permission-item">
            <div class="permission-info">
              <div class="permission-name">
                {{ t("settings.guest_access_permission_play_media") }}
              </div>
              <div class="permission-description">
                {{ t("settings.guest_access_permission_play_media_desc") }}
              </div>
            </div>
            <v-switch
              v-model="permissions.can_play_media"
              color="primary"
              hide-details
              @update:model-value="updatePermissions"
            />
          </div>

          <v-divider class="my-4" />

          <div class="permission-item">
            <div class="permission-info">
              <div class="permission-name">
                {{ t("settings.guest_access_permission_control_queue") }}
              </div>
              <div class="permission-description">
                {{ t("settings.guest_access_permission_control_queue_desc") }}
              </div>
            </div>
            <v-switch
              v-model="permissions.can_control_queue"
              color="primary"
              hide-details
              @update:model-value="updatePermissions"
            />
          </div> -->

          <v-divider class="my-4" />

          <div class="permission-item">
            <div class="permission-info">
              <div class="permission-name">
                {{ t("settings.guest_access_permission_control_playback") }}
              </div>
              <div class="permission-description">
                {{
                  t("settings.guest_access_permission_control_playback_desc")
                }}
              </div>
            </div>
            <v-switch
              v-model="permissions.can_control_playback"
              color="primary"
              hide-details
              @update:model-value="updatePermissions"
            />
          </div>

          <v-divider class="my-4" />

          <div class="permission-item">
            <div class="permission-info">
              <div class="permission-name">
                {{ t("settings.guest_access_permission_control_volume") }}
              </div>
              <div class="permission-description">
                {{ t("settings.guest_access_permission_control_volume_desc") }}
              </div>
            </div>
            <v-switch
              v-model="permissions.can_control_volume"
              color="primary"
              hide-details
              @update:model-value="updatePermissions"
            />
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Error state -->
    <v-alert v-else type="error" variant="tonal" class="error-alert">
      {{ t("settings.guest_access_error_loading") }}
    </v-alert>
  </Container>
</template>

<script setup lang="ts">
import Container from "@/components/Container.vue";
import { copyToClipboard } from "@/helpers/utils";
import { api } from "@/plugins/api";
import type { GuestAccessInfo } from "@/plugins/api/interfaces";
import QRCode from "qrcode";
import { onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vuetify-sonner";

const { t } = useI18n();

const loading = ref(true);
const switching = ref(false);
const regenerating = ref(false);
const guestAccessInfo = ref<GuestAccessInfo | null>(null);
const qrCodeDataUrl = ref<string | null>(null);

const permissions = reactive({
  can_play_media: true,
  can_control_queue: true,
  can_control_playback: true,
  can_control_volume: true,
});

onMounted(async () => {
  await loadGuestAccessInfo();
});

const loadGuestAccessInfo = async (silent = false) => {
  if (!silent) {
    loading.value = true;
  }
  try {
    guestAccessInfo.value = await api.getGuestAccessInfo();
    // Update permissions state
    if (guestAccessInfo.value) {
      permissions.can_play_media = guestAccessInfo.value.can_play_media;
      permissions.can_control_queue = guestAccessInfo.value.can_control_queue;
      permissions.can_control_playback =
        guestAccessInfo.value.can_control_playback;
      permissions.can_control_volume = guestAccessInfo.value.can_control_volume;
    }
  } catch (error) {
    console.error("Error loading guest access info:", error);
    if (!silent) {
      toast.error(t("settings.guest_access_error_loading"));
    }
  } finally {
    if (!silent) {
      loading.value = false;
    }
  }
};

const toggleGuestAccess = async (enabled: boolean | null) => {
  if (!guestAccessInfo.value || enabled === null) return;

  switching.value = true;
  try {
    guestAccessInfo.value = await api.configureGuestAccess(enabled);
    toast.success(
      enabled
        ? t("settings.guest_access_success_enabled")
        : t("settings.guest_access_success_disabled"),
    );
    // Update permissions state
    if (guestAccessInfo.value) {
      permissions.can_play_media = guestAccessInfo.value.can_play_media;
      permissions.can_control_queue = guestAccessInfo.value.can_control_queue;
      permissions.can_control_playback =
        guestAccessInfo.value.can_control_playback;
      permissions.can_control_volume = guestAccessInfo.value.can_control_volume;
    }
  } catch (error) {
    console.error("Error toggling guest access:", error);
    toast.error(t("settings.guest_access_error_toggle"));
  } finally {
    switching.value = false;
  }
};

const updatePermissions = async () => {
  if (!guestAccessInfo.value) return;

  try {
    guestAccessInfo.value = await api.configureGuestAccess(
      true,
      permissions.can_play_media,
      permissions.can_control_queue,
      permissions.can_control_playback,
      permissions.can_control_volume,
    );
    toast.success(t("settings.guest_access_success_permissions"));
  } catch (error) {
    console.error("Error updating permissions:", error);
    toast.error(t("settings.guest_access_error_permissions"));
    // Revert to previous values
    await loadGuestAccessInfo(true);
  }
};

const copyGuestUrl = async () => {
  if (!guestAccessInfo.value?.guest_url) return;

  const success = await copyToClipboard(guestAccessInfo.value.guest_url);
  if (success) {
    toast.success(t("settings.guest_access_success_copy"));
  } else {
    toast.error(t("settings.guest_access_error_copy"));
  }
};

const regenerateToken = async () => {
  if (!guestAccessInfo.value) return;

  regenerating.value = true;
  try {
    guestAccessInfo.value = await api.regenerateGuestToken();
    toast.success(t("settings.guest_access_success_regenerate"));
  } catch (error) {
    console.error("Error regenerating guest token:", error);
    toast.error(t("settings.guest_access_error_regenerate"));
  } finally {
    regenerating.value = false;
  }
};

// QR Code generation
const generateQrCode = async (guestUrl: string) => {
  if (!guestUrl) {
    qrCodeDataUrl.value = null;
    return;
  }

  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(guestUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    qrCodeDataUrl.value = null;
  }
};

// Watch for guest URL changes and regenerate QR code
watch(
  () => guestAccessInfo.value?.guest_url,
  (newGuestUrl) => {
    if (newGuestUrl) {
      generateQrCode(newGuestUrl);
    } else {
      qrCodeDataUrl.value = null;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.guest-access-wrapper {
  padding: 24px 0;
}

.hero-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.hero-content {
  padding: 32px;
}

.hero-icon-wrapper {
  margin-bottom: 16px;
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: rgb(var(--v-theme-on-surface));
}

.hero-description {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 24px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.status-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.status-header {
  padding: 24px;
}

.status-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.status-text {
  font-size: 1rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.status-switch {
  flex-shrink: 0;
}

.guest-url-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.guest-url-header {
  padding: 20px 20px 0 20px;
  display: flex;
  align-items: center;
}

.guest-url-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.guest-url-content {
  padding: 20px;
}

.guest-url-explanation {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 16px;
  line-height: 1.5;
}

.url-display-wrapper {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.url-box {
  flex: 1;
  background: rgba(var(--v-theme-surface), 0.8);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 10px;
  padding: 12px 16px;
  overflow-x: auto;
  transition: all 0.2s ease;
}

.url-box:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-surface), 1);
}

.url-text {
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 0.9rem;
  color: rgb(var(--v-theme-on-surface));
  word-break: break-all;
}

.copy-button {
  flex-shrink: 0;
}

.qr-code-section {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
}

.qr-code-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: rgb(var(--v-theme-on-surface));
  display: flex;
  align-items: center;
}

.qr-code-description {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 16px;
  line-height: 1.5;
}

.qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.qr-code-image {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  background: white;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.actions-section {
  text-align: center;
  padding: 16px 0;
}

.action-hint {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 8px;
}

.permissions-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.permissions-header {
  padding: 20px 20px 0 20px;
  display: flex;
  align-items: center;
}

.permissions-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.permissions-content {
  padding: 20px;
}

.permissions-explanation {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 20px;
  line-height: 1.5;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.permission-info {
  flex: 1;
}

.permission-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 4px;
}

.permission-description {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.4;
}

.error-alert {
  margin: 24px;
}

@media (max-width: 960px) {
  .hero-content {
    padding: 24px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .url-box {
    font-size: 0.8rem;
  }
}
</style>
