import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { store } from "./store/store.ts";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

// const VITE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
createRoot(document.getElementById("root")!).render(
  // <GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
  // </GoogleOAuthProvider>
);
