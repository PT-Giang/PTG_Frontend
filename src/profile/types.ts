export interface LocalProfile {
  name: string;
  email: string;
  language: string;
  role: string;
  school: string;
  education: string;
  grade: string;
  avatar: string;
  supportCode: string;
}
export interface ProfileProps {
  profile: LocalProfile;
  onSave(profile: LocalProfile): boolean;
}
