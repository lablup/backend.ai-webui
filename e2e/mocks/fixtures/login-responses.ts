/**
 * Mock responses for Backend.AI login REST API endpoints.
 *
 * These fixtures simulate the webserver's session-based authentication flow:
 * POST /server/login     -> authenticate user
 * POST /server/login-check -> verify existing session
 * POST /server/logout    -> end session
 */

export type MockRole = 'superadmin' | 'admin' | 'user';

export function getLoginResponse(role: MockRole = 'user') {
  return {
    authenticated: true,
    data: {
      role,
      access_key: 'MOCK_ACCESS_KEY',
    },
    session_id: 'mock-session-id',
  };
}

export function getLoginCheckResponse(role: MockRole = 'user') {
  return {
    authenticated: true,
    data: {
      access_key: 'MOCK_ACCESS_KEY',
      role,
    },
    session_id: 'mock-session-id',
  };
}

export const logoutResponse = {
  authenticated: false,
};
