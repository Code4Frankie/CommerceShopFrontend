import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";

// The payment gateway redirects here with ?reference=... (and trxref).
export default function PaymentCallback() {
  const [sp] = useSearchParams();
  const reference = sp.get("reference") || sp.get("trxref");
  const { reload } = useCart();
  const [state, setState] = useState({ loading: true, status: "", error: "" });

  const verify = useCallback(async () => {
    setState({ loading: true, status: "", error: "" });
    try {
      const d = await api.verifyPayment(reference);
      setState({ loading: false, status: d.status, error: "" });
      reload().catch(() => {});
    } catch (e) {
      setState({ loading: false, status: "", error: e.message });
    }
  }, [reference, reload]);

  useEffect(() => {
    if (reference) verify();
    else setState({ loading: false, status: "", error: "No payment reference found." });
  }, [reference, verify]);

  const paid = /paid|success/i.test(state.status);
  const failed = /fail|abandon|cancel/i.test(state.status);

  return (
    <div className="panel center">
      {state.loading && (
        <>
          <h1>Confirming your payment...</h1>
          <p className="muted">Please do not close this page.</p>
        </>
      )}

      {!state.loading && paid && (
        <>
          <h1>Payment successful</h1>
          <p>Thank you! Your order is confirmed and we are getting it ready.</p>
          <Link to="/orders" className="btn">
            View my orders
          </Link>
        </>
      )}

      {!state.loading && failed && (
        <>
          <h1>Payment not completed</h1>
          <p>The payment did not go through. You can try again from your orders.</p>
          <Link to="/orders" className="btn">
            Go to my orders
          </Link>
        </>
      )}

      {!state.loading && !paid && !failed && !state.error && (
        <>
          <h1>Payment pending</h1>
          <p className="muted">Status: {state.status || "unknown"}. Confirmation can take a moment.</p>
          <div className="row center-row">
            <button className="btn" onClick={verify}>
              Check again
            </button>
            <Link to="/orders" className="btn ghost">
              My orders
            </Link>
          </div>
        </>
      )}

      {!state.loading && state.error && (
        <>
          <h1>We could not confirm the payment</h1>
          <p className="error">{state.error}</p>
          <div className="row center-row">
            {reference && (
              <button className="btn" onClick={verify}>
                Try again
              </button>
            )}
            <Link to="/orders" className="btn ghost">
              My orders
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
