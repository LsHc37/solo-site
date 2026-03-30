import { useToast, ToastType } from "@/lib/toast-context";

/**
 * Hook for handling async operations with automatic toast feedback
 * Usage: const { execute, isLoading } = useToastAction();
 *        await execute(() => fetch(...), { successMsg: "Saved!" })
 */
export function useToastAction() {
  const { addToast } = useToast();
  const isLoading = false; // This would need more complex state management if needed

  const execute = async (
    fn: () => Promise<any>,
    options?: {
      successMsg?: string;
      errorMsg?: string;
      showError?: boolean;
    }
  ) => {
    try {
      const result = await fn();
      if (options?.successMsg !== false) {
        addToast(options?.successMsg || "Operation successful!", "success");
      }
      return result;
    } catch (error) {
      if (options?.showError !== false) {
        const message = error instanceof Error ? error.message : "An error occurred";
        addToast(options?.errorMsg || message, "error");
      }
      throw error;
    }
  };

  return { execute, isLoading };
}

/**
 * Promise-based fetch wrapper with automatic toast feedback
 * Usage: const data = await toastFetch(url, { successMsg: "Loaded!" })
 */
export async function toastFetch(
  url: string,
  options?: {
    method?: string;
    body?: any;
    successMsg?: string;
    errorMsg?: string;
  }
): Promise<any> {
  // Note: This requires manual toast call in the component since we can't use hooks outside components
  // Better to use useToastAction hook instead
  throw new Error("Use useToastAction hook in components instead");
}

/**
 * Handle response with toast feedback
 * Usage: const data = await handleResponse(response, { successMsg: "Saved!" })
 */
export async function handleResponse(
  response: Response,
  _addToast: (message: string, type: ToastType) => void,
  options?: {
    successMsg?: string;
    errorMsg?: string;
  }
): Promise<any> {
  const data = await response.json();

  if (!response.ok) {
    _addToast(
      options?.errorMsg || data.error || "An error occurred",
      "error"
    );
    throw new Error(data.error || "Request failed");
  }

  if (options?.successMsg) {
    _addToast(options.successMsg, "success");
  }

  return data;
}
