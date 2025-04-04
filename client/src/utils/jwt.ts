import { persistStore } from "redux-persist";
import {store} from "../store/store";

const persistor = persistStore(store);

export const getToken = () => {
  const itemStr = localStorage.getItem("user");
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    persistor.purge().then(() => {
      localStorage.removeItem("persist:root");
      window.location.reload();
      alert("Session expired. Please log in again.");
    });

    localStorage.clear();
    return null;
  }
  const token = localStorage.getItem("token");
  return token;
};