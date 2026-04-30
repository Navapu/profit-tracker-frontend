import { BACKEND_URL } from "../config/config.js";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../helpers/tokens.js";

let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      return null;
    }
    const refreshTokenObj = JSON.parse(refreshToken);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenObj.refreshToken }),
      });
      if (!res.ok) throw new Error("Failed to refresh token");

      const data = await res.json();

      setTokens(data.data.accessToken, refreshToken);

      isRefreshing = false;
      return data.data.accessToken;
    } catch{
      // console.error("Refresh token failed → clearing tokens: ", error);
      clearTokens();
      isRefreshing = false;
      return null;
    }finally{
        isRefreshing = false;
        refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiClient(path, options = {}) {
  const accessToken = getAccessToken();

  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers),
  };

  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) return response;

    const retryHeaders = {
      ...headers,
      Authorization: `Bearer ${newToken}`,
    };

    response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: retryHeaders,
    });
  }

  return response;
}
