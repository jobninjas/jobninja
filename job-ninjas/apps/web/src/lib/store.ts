import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, Candidate } from '@/../../shared/types';

interface StoreState {
  roles: Role[];
  candidates: Candidate[];
  isSeeded: boolean;
  seedDemoData: () => void;
  addRole: (role: Role) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
}

export const useDemoStore = create<StoreState>()(
  persist(
    (set) => ({
      roles: [],
      candidates: [],
      isSeeded: true,
      seedDemoData: () => {},
      addRole: (role) => set((state) => ({ roles: [role, ...state.roles] })),
      updateRole: (id, updates) => set((state) => ({
        roles: state.roles.map(r => r.id === id ? { ...r, ...updates } : r)
      })),
      updateCandidate: (id, updates) => set((state) => ({
        candidates: state.candidates.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
    }),
    {
      name: 'job-ninjas-client-storage',
    }
  )
);
