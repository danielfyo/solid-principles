import { useEffect, useState } from "react";
import type { Order } from "../types";
import { fetchOrder, type LoadOrder } from "./orderApi";

export type OrderState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly order: Order };

/** Single reason to change: how the UI loads and tracks remote state. */
export function useOrder(orderId: string, loadOrder: LoadOrder = fetchOrder): OrderState {
  const [state, setState] = useState<OrderState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    loadOrder(orderId, controller.signal)
      .then((order) => setState({ status: "ready", order }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: "error", message: String(error) });
      });
    return () => controller.abort();
  }, [orderId, loadOrder]);

  return state;
}
