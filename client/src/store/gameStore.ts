import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    username: string;
    email: string;
    coins: number;
    loadout: Record<string, string>;
}

export interface InventoryItem {
    id: string;
    name: string;
    type: 'skin' | 'clothing';
    cost: number;
    image_url: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    acquired_at: string;
}

export interface QuestProgress {
    checkpoint_id: string;
    status: 'pending' | 'code_passed' | 'completed';
}

interface GameStore {
    // Auth
    token: string | null;
    user: User | null;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
    updateCoins: (coins: number) => void;

    // Inventory
    inventory: InventoryItem[];
    setInventory: (items: InventoryItem[]) => void;

    // Quest
    questProgress: QuestProgress[];
    setQuestProgress: (progress: QuestProgress[]) => void;
    updateQuestStatus: (checkpointId: string, status: QuestProgress['status']) => void;

    // Game UI overlays
    showIDE: boolean;
    showQuiz: boolean;
    currentCheckpoint: string | null;
    setShowIDE: (show: boolean, checkpointId?: string) => void;
    setShowQuiz: (show: boolean) => void;

    // Code challenge state
    codeOutput: string;
    codePassed: boolean;
    setCodeOutput: (output: string) => void;
    setCodePassed: (passed: boolean) => void;
}

export const useGameStore = create<GameStore>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setAuth: (token, user) => set({ token, user }),
            logout: () => set({ token: null, user: null, inventory: [], questProgress: [] }),
            updateCoins: (coins) => set((state) => ({ user: state.user ? { ...state.user, coins } : null })),

            inventory: [],
            setInventory: (items) => set({ inventory: items }),

            questProgress: [],
            setQuestProgress: (progress) => set({ questProgress: progress }),
            updateQuestStatus: (checkpointId, status) =>
                set((state) => ({
                    questProgress: state.questProgress.map((q) =>
                        q.checkpoint_id === checkpointId ? { ...q, status } : q
                    ),
                })),

            showIDE: false,
            showQuiz: false,
            currentCheckpoint: null,
            setShowIDE: (show, checkpointId) =>
                set({ showIDE: show, currentCheckpoint: checkpointId ?? null }),
            setShowQuiz: (show) => set({ showQuiz: show }),

            codeOutput: '',
            codePassed: false,
            setCodeOutput: (output) => set({ codeOutput: output }),
            setCodePassed: (passed) => set({ codePassed: passed }),
        }),
        {
            name: 'playzle-store',
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
);
