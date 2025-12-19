import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/plugins/api", () => ({
  api: {
    sendCommand: vi.fn(),
  },
}));

import { api } from "@/plugins/api";
import { usePermissions } from "./usePermissions";

describe("usePermissions", () => {
  beforeEach(() => {
    (
      api.sendCommand as unknown as ReturnType<typeof vi.fn> & {
        mockReset?: () => void;
      }
    ).mockReset?.();
  });

  it("fetchPermissions populates permissions and toggles loading", async () => {
    const payload = [
      {
        id: "adjust_volume",
        name: "Adjust Volume",
        description: "Adjust player volume",
        patterns: ["players/cmd/volume_*"],
      },
    ];
    (
      api.sendCommand as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(payload);

    const { permissions, loading, fetchPermissions } = usePermissions();

    expect(loading.value).toBe(false);
    const p = fetchPermissions();
    expect(loading.value).toBe(true);
    await p;

    expect(api.sendCommand).toHaveBeenCalledWith("auth/permissions");
    expect(permissions.value).toEqual(payload);
    expect(loading.value).toBe(false);
  });
});
