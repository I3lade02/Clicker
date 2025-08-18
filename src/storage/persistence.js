import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVE_KEY = "CLICKER_ANIMALS_SAVE_V1";

export const saveState = async (state) => {
    try {
        const payload = { ...state, lastSavedAt: Date.now() };
        await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch {}
};

export const loadState = async () => {
    try {
        const raw = await AsyncStorage.getItem(SAVE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const clearState = async () => {
    try { await AsyncStorage.removeItem(SAVE_KEY); } catch {}
};