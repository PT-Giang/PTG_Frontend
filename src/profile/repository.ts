import { avatars } from "./avatars";
import type { LocalProfile } from "./types";
import { isWorkspace } from "@/study/repository";

const storageKey = "thea-profile-v1";
export const profileEvent = "thea-profile-changed";
export const defaultProfile: LocalProfile = {
  name: "Học sinh", email: "hocsinh@example.com", language: "Vietnamese", role: "Học sinh",
  school: "Không áp dụng / Tôi không muốn nói", education: "Trường Đại học", grade: "",
  avatar: avatars[0].src, supportCode: "thea_local_demo",
};
export function readProfile(): LocalProfile {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return defaultProfile;
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || !Object.keys(defaultProfile).every(key => typeof (parsed as Record<string, unknown>)[key] === "string")) throw new Error("Không đọc được hồ sơ đã lưu.");
  const profile = parsed as LocalProfile;
  if (!avatars.some(avatar => avatar.src === profile.avatar && avatar.unlocked)) throw new Error("Ảnh đại diện đã lưu không hợp lệ.");
  return profile;
}
export function saveProfile(profile: LocalProfile) {
  if (!profile.name.trim() || profile.name.length > 120) throw new Error("Tên cần từ 1 đến 120 ký tự.");
  localStorage.setItem(storageKey, JSON.stringify(profile));
  window.dispatchEvent(new Event(profileEvent));
}
export function readProfileStats() {
  let materials = 0, answered = 0, correct = 0, tests = 0, highScores = 0;
  const raw: unknown = JSON.parse(localStorage.getItem("thea-home-demo-v1") || "[]");
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item.id !== "string" || item.deleted) continue;
      materials++;
      const data = localStorage.getItem(`thea-study-v1:${item.id}`);
      if (!data) continue;
      let workspace: unknown;
      try { workspace = JSON.parse(data); } catch { continue; }
      if (!isWorkspace(workspace)) continue;
      answered += workspace.smartAnswered; correct += workspace.smartCorrect; tests += workspace.attempts.length;
      highScores += workspace.attempts.filter(attempt => attempt.questions.length > 0 && attempt.score / attempt.questions.length >= .9).length;
    }
  }
  return { materials, answered, correct, tests, highScores };
}
