import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    Modal, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ENDPOINTS } from "@/constants/config";

interface Language {
    languageId: number;
    languageName: string;
    languageCode: string;
}

export default function UpdateLanguage() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedLang, setSelectedLang] = useState<Language | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState('');

    const fetchLanguages = async () => {
        try {
            const res = await fetch(ENDPOINTS.LANGUAGES);
            const data = await res.json();
            setLanguages(data);
        } catch (error) {
            Alert.alert("Error", "Languages could not be loaded.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLanguages(); }, []);

    const openUpdateModal = (lang: Language) => {
        setSelectedLang(lang);
        setNewName(lang.languageName);
        setNewCode(lang.languageCode);
        setModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!selectedLang) return;

        try {
            const response = await fetch(`${ENDPOINTS.UPDATE_LANGUAGE}/${selectedLang.languageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    languageId: selectedLang.languageId,
                    languageName: newName,
                    languageCode: newCode.toUpperCase()
                }),
            });

            if (response.ok) {
                Alert.alert("Success", "Updated the language.");
                setModalVisible(false);
                fetchLanguages(); // refresh the language list
            } else {
                Alert.alert("Error", "Update failed.");
            }
        } catch (error) {
            Alert.alert("Connection Error", "The server could not be reached.");
        }
    };

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator size="large" color="#4A90E2" /> : (
                <FlatList
                    data={languages}
                    keyExtractor={(item) => item.languageId.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => openUpdateModal(item)}>
                            <View>
                                <Text style={styles.langName}>{item.languageName}</Text>
                                <Text style={styles.langCode}>{item.languageCode}</Text>
                            </View>
                            <MaterialCommunityIcons name="pencil-box-outline" size={24} color="#4A90E2" />
                        </TouchableOpacity>
                    )}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update the language</Text>

                        <TextInput
                            style={styles.input}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Language Name"
                        />
                        <TextInput
                            style={styles.input}
                            value={newCode}
                            onChangeText={setNewCode}
                            placeholder="Language Code"
                            autoCapitalize="characters"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{color: '#64748B'}}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.btn, styles.btnSave]}
                                onPress={handleUpdate}
                            >
                                <Text style={{color: '#fff', fontWeight: 'bold'}}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 15 },
    card: {
        backgroundColor: '#fff', padding: 15, borderRadius: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10, elevation: 2
    },
    langName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    langCode: { color: '#64748B', fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    btn: { flex: 0.45, padding: 15, borderRadius: 10, alignItems: 'center' },
    btnCancel: { backgroundColor: '#E2E8F0' },
    btnSave: { backgroundColor: '#4A90E2' }
});