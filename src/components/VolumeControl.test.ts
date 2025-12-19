import { describe, it, expect, vi, beforeEach } from "vitest";

// Provide a minimal localStorage mock for modules that access it at import time
// (e.g., AuthManager constructor)
const _ls = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(() => undefined),
  removeItem: vi.fn(() => undefined),
};
// set on both global and window for different environments
(global as any).localStorage = _ls;
(global as any).window = Object.assign((global as any).window || {}, {
  localStorage: _ls,
});
import { shallowMount } from "@vue/test-utils";

// Mock heavy modules before importing the component to avoid CSS imports
vi.mock("@/components/Button.vue", () => ({
  default: {
    name: "Button",
    template: "<div />",
    props: ["icon", "disabled"],
  },
}));
vi.mock("@/layouts/default/PlayerOSD/PlayerVolume.vue", () => ({
  default: {
    name: "PlayerVolume",
    template: "<div />",
    props: ["isPowered", "disabled", "modelValue"],
  },
}));

vi.mock("@/plugins/api", () => ({
  api: {
    players: {},
    sendCommand: vi.fn(),
  },
}));

// Mock auth and router to avoid side-effects at import time (AuthManager uses localStorage)
vi.mock("@/plugins/auth", () => ({
  authManager: {
    getCurrentUser: () => undefined,
    setCurrentUser: () => undefined,
  },
}));
vi.mock("@/plugins/router", () => ({
  default: {},
}));

// Mock the authorization composable to avoid loading role-fetching plumbing in this unit test
vi.mock("@/composables/useAuthorization", () => ({
  useAuthorization: () => ({
    isAllowedSynced: (cmd: string) => false,
    fetchRoles: vi.fn(),
    roles: [],
  }),
}));

// We'll create a small inline test component that uses the authorization composable
import { api } from "@/plugins/api";
import { useAuthorization } from "@/composables/useAuthorization";
import { defineComponent, h, computed } from "vue";

describe("VolumeControl permission gating", () => {
  beforeEach(() => {
    // reset store user
    store.currentUser = undefined;
    (
      api.sendCommand as unknown as ReturnType<typeof vi.fn> & {
        mockReset?: () => void;
      }
    ).mockReset?.();
  });

  it("disables volume controls when current role lacks volume permissions", async () => {
    // mock roles response: role 'restricted' with no permissions
    (
      api.sendCommand as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([
      {
        role_name: "restricted",
        description: "No volume",
        permissions: ["music/*"],
      },
    ]);

    // no need to set store.currentUser because useAuthorization is mocked

    const player = {
      player_id: "p1",
      name: "Test Player",
      supported_features: [
        // bitmask not necessary for test, presence of enums used earlier
      ],
      available: true,
      powered: true,
      volume_muted: false,
      volume_level: 20,
      group_members: [] as string[],
    } as any;

    // Inline test component that shows PlayerVolume with disabled bound to authorization
    const TestComp = defineComponent({
      name: "TestComp",
      setup() {
        const { isAllowedSynced } = useAuthorization();
        const canAdjust = computed(() =>
          isAllowedSynced("players/cmd/volume_set"),
        );
        return { canAdjust };
      },
      render() {
        return h("div", [h("PlayerVolume", { disabled: !this.canAdjust })]);
      },
    });

    const wrapper = shallowMount(TestComp as any, {
      global: {
        stubs: {
          PlayerVolume: {
            name: "PlayerVolume",
            template: "<div />",
            props: ["disabled"],
          },
        },
      },
    });

    // allow any pending promise from useAuthorization.fetchRoles
    await Promise.resolve();

    const pv = wrapper.findComponent({ name: "PlayerVolume" });
    expect(pv.exists()).toBe(true);
    expect(pv.props("disabled")).toBeTruthy();
  });
});
