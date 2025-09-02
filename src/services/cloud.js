import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const FILENAME = 'animal-feeder-save.json';

export async function exportSave(state) {
    try { 
        const path = FileSystem.cacheDirectory + FILENAME;
        await FileSystem.writeAsStringAsync(path, JSON.stringify(state, null, 2), {
            encoding: FileSystem.EncodingType.UTF8,
        });
        const can = await Sharing.isAvailableAsync();
        if (can) {
            await Sharing.shareAsync(path, {
                mimeType: 'application/json',
                dialogTitle: 'Export save',
            });
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

export async function importSave() {
    try {
        const res = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            multiple: false,
            copyToCacheDirectory: true,
        });
        if (res.canceled || !res.assets?.length) return null;
        const uri = res.assets[0].uri;
        const txt = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.UTF8,
        });
        const obj = JSON.parse(txt);
        return obj;
    } catch {
        return null;
    }
}