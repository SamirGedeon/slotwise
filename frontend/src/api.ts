const key = "slotwise.session";
export const getToken = () => sessionStorage.getItem(key);
export const setToken = (token: string | null) =>
  token ? sessionStorage.setItem(key, token) : sessionStorage.removeItem(key);
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`/api/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ errors: ["Servidor indisponível. Tente novamente."] }));
    if (response.status === 401 && token)
      window.dispatchEvent(new Event("session-expired"));
    throw new ApiError(
      body.errors?.join(" · ") || "Não foi possível concluir a operação.",
      response.status,
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
