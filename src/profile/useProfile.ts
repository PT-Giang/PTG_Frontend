"use client";
import { useEffect, useState } from "react";
import { defaultProfile, profileEvent, readProfile, saveProfile } from "./repository";
import type { LocalProfile } from "./types";
export function useProfile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    function load() {
      try { setProfile(readProfile()); setError(""); }
      catch { setError("Không đọc được hồ sơ cục bộ. Bạn có thể chỉnh sửa và lưu lại thông tin."); }
      setReady(true);
    }
    load(); window.addEventListener(profileEvent, load); window.addEventListener("storage", load);
    return () => { window.removeEventListener(profileEvent, load); window.removeEventListener("storage", load); };
  }, []);
  function save(next: LocalProfile): boolean {
    try { saveProfile(next); setProfile(next); setError(""); return true; }
    catch { setError("Chưa lưu được hồ sơ. Hãy kiểm tra bộ nhớ trình duyệt và thử lại."); return false; }
  }
  return { profile, ready, error, save };
}
