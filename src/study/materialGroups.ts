import type { GroupMode, StudyMaterial } from "@/components/sites/www-thea-study-18140289/root-8a5edab2/types";

export const classColors = ["#8ccdf3", "#0075ff", "#2d9c3c", "#ff821a", "#ff3232", "#cb9ce7", "#c804a4", "#9e1bbe", "#6200b3", "#3b3a6d"];
export const defaultClassColor = classColors[1];
export function validMaterials(value: unknown): value is StudyMaterial[] {
  return Array.isArray(value) && value.every(item => item && typeof item.id === "string" && typeof item.title === "string" && typeof item.className === "string" && typeof item.deleted === "boolean");
}
export function colorForClass(materials: StudyMaterial[], name: string) {
  return materials.find(item => item.className === name && /^#[a-f0-9]{6}$/i.test(item.classColor || ""))?.classColor || defaultClassColor;
}
export function renameClass(materials: StudyMaterial[], previous: string, next: string) {
  const name = next.trim();
  if (!name) throw new Error("Vui lòng nhập tên lớp.");
  if (name !== previous && materials.some(item => item.className.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi"))) throw new Error("Tên lớp đã tồn tại. Hãy chọn tên khác hoặc chuyển học liệu vào lớp đó.");
  return materials.map(item => item.className === previous ? { ...item, className: name } : item);
}
export function groupMaterials(materials: StudyMaterial[], mode: GroupMode, now = new Date()) {
  if (mode === "Không nhóm") return [{ key: "all", name: "", items: materials }];
  const groups = new Map<string, StudyMaterial[]>();
  for (const item of materials) {
    let name = item.className;
    if (mode === "Ngày") {
      const date = new Date(item.createdAt || "");
      name = Number.isNaN(date.getTime()) ? "Trước đây" : date.toDateString() === now.toDateString() ? "Hôm nay" : date.toLocaleDateString("vi-VN");
    }
    groups.set(name, [...(groups.get(name) || []), item]);
  }
  const result = Array.from(groups, ([key, items]) => ({ key, name: key || "Chưa phân loại", items }));
  return mode === "Lớp" ? result.sort((left, right) => !left.key ? 1 : !right.key ? -1 : left.name.localeCompare(right.name, "vi")) : result;
}
