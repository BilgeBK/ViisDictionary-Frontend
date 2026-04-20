import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    Modal, TextInput, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ENDPOINTS } from "@/constants/config";

interface Language {
    languageId: number;
    languageName: string;
}

interface Translation {
    translationId: number;
    originalText: string;
    translatedText: string;
    sourceLanguageId: number;
    targetLanguageId: number;
}

export default function UpdateTranslation() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [translations, setTranslations] = useState<Translation[]>([]);

    const [sourceLang, setSourceLang] = useState<Language | null>(null);
    const [targetLang, setTargetLang] = useState<Language | null>(null);
    const [isSourceOpen, setIsSourceOpen] = useState(false);
    const [isTargetOpen, setIsTargetOpen] = useState(false);
    const [wordSearch, setWordSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedItem, setSelectedItem] = useState<Translation | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editOriginal, setEditOriginal] = useState('');
    const [editTranslated, setEditTranslated] = useState('');

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        try {
            const res = await fetch(ENDPOINTS.LANGUAGES);
            const data = await res.json();
            setLanguages(Array.isArray(data) ? data : []);
        } catch (error) {
            Alert.alert("Error", "Languages could not be loaded..");
        }
    };

    useEffect(() => {
        if (sourceLang && targetLang) {
            fetchTranslations();
        }
    }, [sourceLang, targetLang]);

    const fetchTranslations = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${ENDPOINTS.ALL_TRANSLATE}/${sourceLang?.languageId}/${targetLang?.languageId}`);
            const data = await res.json();
            setTranslations(Array.isArray(data) ? data : []);
        } catch (error) {
            Alert.alert("Error", "Words could not be loaded.");
        } finally {
            setLoading(false);
        }
    };

    // Search Filter (Client-side)
    const displayList = useMemo(() => {
        return translations.filter(t =>
            t.originalText.toLowerCase().includes(wordSearch.toLowerCase()) ||
            t.translatedText.toLowerCase().includes(wordSearch.toLowerCase())
        );
    }, [translations, wordSearch]);

    const openEditModal = (item: Translation) => {
        setSelectedItem(item);
        setEditOriginal(item.originalText);
        setEditTranslated(item.translatedText);
        setEditModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!selectedItem) return;

        try {
            const response = await fetch(`${ENDPOINTS.UPDATE_TRANSLATE}/${selectedItem.translationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    translationId: selectedItem.translationId,
                    originalText: editOriginal,
                    translatedText: editTranslated,
                    sourceLanguageId: selectedItem.sourceLanguageId,
                    targetLanguageId: selectedItem.targetLanguageId
                }),
            });

            if (response.ok) {
                Alert.alert("Success", "Updated the translation.");
                setEditModalVisible(false);
                fetchTranslations(); // refresh the list
            } else {
                Alert.alert("Error", "Update failed.");
            }
        } catch (error) {
            Alert.alert("Connection Error", "The server could not be reached.");
        }
    };

    // Dil Seçici UI Bileşeni
    const renderLangSelector = (label: string, selected: Language | null, isOpen: boolean, setOpen: (v: boolean) => void, onSelect: (l: Language) => void) => (
        <View style={{ flex: 1 }}>
            <Text style={styles.miniLabel}>{label}</Text>
            <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setOpen(!isOpen)}>
                <Text style={styles.dropdownText} numberOfLines={1}>{selected ? selected.languageName : "Select..."}</Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color="#4A90E2" />
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.dropdownMenu}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                        {languages.map(lang => (
                            <TouchableOpacity key={lang.languageId} style={styles.menuItem} onPress={() => onSelect(lang)}>
                                <Text>{lang.languageName}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerFilters}>
                {renderLangSelector("Source", sourceLang, isSourceOpen, setIsSourceOpen, (l) => { setSourceLang(l); setIsSourceOpen(false); })}
                <View style={{ width: 10 }} />
                {renderLangSelector("Target", targetLang, isTargetOpen, setIsTargetOpen, (l) => { setTargetLang(l); setIsTargetOpen(false); })}
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                <TextInput
                    placeholder="Search in the list..."
                    style={styles.searchInput}
                    value={wordSearch}
                    onChangeText={setWordSearch}
                />
            </View>

            {/* Word list */}
            {loading ? <ActivityIndicator size="large" color="#4A90E2" /> : (
                <FlatList
                    data={displayList}
                    keyExtractor={(item) => item.translationId.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.origText}>{item.originalText}</Text>
                                <Text style={styles.transText}>{item.translatedText}</Text>
                            </View>
                            <MaterialCommunityIcons name="pencil-outline" size={22} color="#4A90E2" />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Word could not found</Text>}
                />
            )}

            <Modal visible={editModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit the word</Text>

                        <Text style={styles.inputLabel}>Original Text ({sourceLang?.languageName})</Text>
                        <TextInput
                            style={styles.input}
                            value={editOriginal}
                            onChangeText={setEditOriginal}
                            multiline
                        />

                        <Text style={styles.inputLabel}>Translation Text ({targetLang?.languageName})</Text>
                        <TextInput
                            style={styles.input}
                            value={editTranslated}
                            onChangeText={setEditTranslated}
                            multiline
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setEditModalVisible(false)}>
                                <Text style={{ color: '#64748B' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleUpdate}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
    headerFilters: { flexDirection: 'row', zIndex: 1000, marginBottom: 15 },
    miniLabel: { fontSize: 11, fontWeight: 'bold', color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase' },
    dropdownTrigger: {
        backgroundColor: '#fff', padding: 12, borderRadius: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: '#E2E8F0'
    },
    dropdownText: { fontSize: 14, color: '#1E293B' },
    dropdownMenu: {
        position: 'absolute', top: 60, left: 0, right: 0,
        backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0',
        zIndex: 2000, elevation: 5
    },
    menuItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        paddingHorizontal: 15, height: 45, borderRadius: 10, marginBottom: 20,
        borderWidth: 1, borderColor: '#E2E8F0'
    },
    searchInput: { flex: 1, marginLeft: 10 },
    card: {
        backgroundColor: '#fff', padding: 15, borderRadius: 15,
        flexDirection: 'row', alignItems: 'center', marginBottom: 12,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05
    },
    origText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    transText: { fontSize: 14, color: '#64748B', marginTop: 3 },
    emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40 },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 25 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    inputLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 5, fontWeight: 'bold' },
    input: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 10, marginBottom: 20, textAlignVertical: 'top' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    btn: { flex: 0.48, padding: 15, borderRadius: 10, alignItems: 'center' },
    btnCancel: { backgroundColor: '#F1F5F9' },
    btnSave: { backgroundColor: '#4A90E2' }
});