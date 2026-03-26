"use client";

import { useEffect } from "react";
import { getDeviceId } from "../lib/deviceId";
import { applyThemePreference, THEME_STORAGE_KEY } from "../lib/theme";

const THEME_KEY = "app-theme";
const REDUCED_MOTION_KEY = "reduced-motion";
const COMPACT_UI_KEY = "compact-ui";
const START_PAGE_KEY = "start-page";

export default function ThemeSync() {
  useEffect(() => {
    const localTheme = window.localStorage.getItem(THEME_STORAGE_KEY) || "auto";
    applyThemePreference(localTheme);

    const deviceId = getDeviceId();

    async function fetchSettings() {
      const [
        themeResponse,
        reducedMotionResponse,
        compactUiResponse,
        startPageResponse,
      ] = await Promise.all([
        fetch(`/api/settings/${THEME_KEY}`, {
          headers: { "x-device-id": deviceId },
          cache: "no-store",
        }),
        fetch(`/api/settings/${REDUCED_MOTION_KEY}`, {
          headers: { "x-device-id": deviceId },
          cache: "no-store",
        }),
        fetch(`/api/settings/${COMPACT_UI_KEY}`, {
          headers: { "x-device-id": deviceId },
          cache: "no-store",
        }),
        fetch(`/api/settings/${START_PAGE_KEY}`, {
          headers: { "x-device-id": deviceId },
          cache: "no-store",
        }),
      ]);

      if (themeResponse.ok) {
        const themeData = await themeResponse.json();
        const savedTheme = themeData?.value || "auto";
        applyThemePreference(savedTheme);
      }

      if (reducedMotionResponse.ok) {
        const reducedMotionData = await reducedMotionResponse.json();
        document.documentElement.dataset.reducedMotion =
          reducedMotionData?.value ? "1" : "0";
      }

      if (compactUiResponse.ok) {
        const compactUiData = await compactUiResponse.json();
        document.documentElement.dataset.compactUi = compactUiData?.value
          ? "1"
          : "0";
      }

      if (startPageResponse.ok && window.location.pathname === "/home") {
        const startPageData = await startPageResponse.json();
        const startPage = startPageData?.value || "/home";

        if (startPage !== "/home" && startPage.startsWith("/home/")) {
          const redirected = window.sessionStorage.getItem(
            "rpg-start-page-redirected",
          );
          if (!redirected) {
            window.sessionStorage.setItem("rpg-start-page-redirected", "1");
            window.location.replace(startPage);
          }
        }
      }
    }

    fetchSettings();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      const preference =
        window.localStorage.getItem(THEME_STORAGE_KEY) || "auto";
      if (preference === "auto") {
        applyThemePreference("auto");
      }
    };

    const onThemeEvent = (event) => {
      const detail = event?.detail;
      if (typeof detail === "string") {
        applyThemePreference(detail);
      }
    };

    media.addEventListener("change", onMediaChange);
    window.addEventListener("rpg-theme-change", onThemeEvent);

    return () => {
      media.removeEventListener("change", onMediaChange);
      window.removeEventListener("rpg-theme-change", onThemeEvent);
    };
  }, []);

  return null;
}
