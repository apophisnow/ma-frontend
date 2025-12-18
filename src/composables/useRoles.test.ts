import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/plugins/api', () => ({
  api: {
    sendCommand: vi.fn(),
  },
}));

import { api } from '@/plugins/api';
import { useRoles } from './useRoles';

describe('useRoles', () => {
  beforeEach(() => {
    (api.sendCommand as unknown as ReturnType<typeof vi.fn> & { mockReset?: () => void }).mockReset?.();
  });

  it('fetchRoles populates roles and toggles loading', async () => {
    const rolesPayload = [
      { role_name: 'admin', description: 'Administrator', permissions: ['*'] },
    ];
    (api.sendCommand as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(rolesPayload);

    const { roles, loading, fetchRoles } = useRoles();

    expect(loading.value).toBe(false);
    const p = fetchRoles();
    // loading should be true immediately after call
    expect(loading.value).toBe(true);
    await p;

    expect(api.sendCommand).toHaveBeenCalledWith('auth/roles');
    expect(roles.value).toEqual(rolesPayload);
    expect(loading.value).toBe(false);
  });

  it('createRole calls api with correct args', async () => {
    (api.sendCommand as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);

    const { createRole } = useRoles();
    const res = await createRole('testrole', 'desc', ['perm.a']);

    expect(api.sendCommand).toHaveBeenCalledWith('auth/role/create', {
      role_name: 'testrole',
      description: 'desc',
      permissions: ['perm.a'],
    });
    expect(res).toBe(true);
  });

  it('updateRole calls api with correct args', async () => {
    (api.sendCommand as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);

    const { updateRole } = useRoles();
    const res = await updateRole('testrole', 'newdesc', ['perm.b']);

    expect(api.sendCommand).toHaveBeenCalledWith('auth/role/update', {
      role_name: 'testrole',
      description: 'newdesc',
      permissions: ['perm.b'],
    });
    expect(res).toBe(true);
  });

  it('deleteRole calls api with correct args', async () => {
    (api.sendCommand as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);

    const { deleteRole } = useRoles();
    const res = await deleteRole('deleteme');

    expect(api.sendCommand).toHaveBeenCalledWith('auth/role/delete', { role_name: 'deleteme' });
    expect(res).toBe(true);
  });
});
