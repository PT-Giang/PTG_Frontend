export interface StudyMaterial { id: string; title: string; className: string; deleted: boolean }
export type GroupMode = "Ngày" | "Lớp" | "Không nhóm";
export interface DialogState { type: string; material?: StudyMaterial }
