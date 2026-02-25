import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TablatureEntry {
    duration: bigint;
    note: string;
}
export interface Fingering {
    holes: Array<boolean>;
}
export interface Sequence {
    name: string;
    entries: Array<TablatureEntry>;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllFingerings(): Promise<Array<[string, Fingering]>>;
    getAllSequences(): Promise<Array<Sequence>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveFingering(note: string, fingering: Fingering): Promise<void>;
    saveSequence(sequence: Sequence): Promise<void>;
}
