import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { isNativeApp } from "../services/mobile";

export default function NativeControls() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isNativeApp) return;
    const back = App.addListener("backButton", () => {
      if (window.history.state?.idx > 0) navigate(-1);
      else App.exitApp();
    });
    const resume = App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) window.dispatchEvent(new Event("focus"));
    });
    return () => {
      void back.then(handle => handle.remove());
      void resume.then(handle => handle.remove());
    };
  }, [navigate]);
  return null;
}
