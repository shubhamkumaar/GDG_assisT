import { persistStore } from "redux-persist";
import {store} from "../store/store";
import { jwtDecode } from "jwt-decode";
const persistor = persistStore(store);

export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const expiry = jwtDecode(token).exp
  const now = new Date();
  if(!expiry) return null;
  if (now.getTime() > expiry * 1000) {
    clearStorageAndReload();
    return null;
  }
  return token;
};

export const clearStorageAndReload = async () => {
  await persistor.purge();
  await persistor.flush(); 

  localStorage.removeItem("persist:root");
  localStorage.clear();
  window.location.reload();
}