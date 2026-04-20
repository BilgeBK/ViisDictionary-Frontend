import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
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

export default function AdvancedDeleteScreen() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);

    // Dropdown ve search states
    const [sourceLang, setSourceLang] = useState<Language | null>(null);
    const [targetLang, setTargetLang] = useState<Language | null>(null);
    const [isSourceOpen, setIsSourceOpen] = useState(false);
    const [isTargetOpen, setIsTargetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Display all languages when the page opens.
    useEffect(() => {
        fetch(ENDPOINTS.LANGUAGES)
            .then(res => res.json())
            .then(data => setLanguages(Array.isArray(data) ? data : []))
            .catch(() => Alert.alert("Hata", "Diller yüklenemedi."));
    }, []);

    // Retrieve words when both languages are selected.
    useEffect(() => {
        if (sourceLang && targetLang) {
            loadTranslations();
        }
    }, [sourceLang, targetLang]);

    const loadTranslations = () => {
        setLoading(true);
        fetch(`${ENDPOINTS.ALL_TRANSLATE}/${sourceLang?.languageId}/${targetLang?.languageId}`)
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                setTranslations(list);
                setFilteredTranslations(list);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                Alert.alert("Hata", "Kelimeler getirilemedi.");
            });
    };

    // Search within the Keyword List
    const handleWordSearch = (text: string) => {
        setSearchQuery(text);
        const filtered = translations.filter(item =>
            item.originalText.toLowerCase().includes(text.toLowerCase()) ||
            item.translatedText.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredTranslations(filtered);
    };

    // Confirmed Deletion
    const confirmDelete = (item: Translation) => {
        Alert.alert("Are you sure?", `"${item.originalText}" the record will be deleted.`, [
            { text: "Cancel", style: "cancel" },
            { text: "Yes, delete", style: "destructive", onPress: () => deleteItem(item.translationId) }
        ]);
    };

    const deleteItem = async (id: number) => {
        try {
            const res = await fetch(`${ENDPOINTS.DELETE_TRANSLATE}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTranslations(prev => prev.filter(t => t.translationId !== id));
                setFilteredTranslations(prev => prev.filter(t => t.translationId !== id));
            }
        } catch (e) {
            Alert.alert("Hata", "Silinemedi.");
        }
    };

    // Reusable Dropdown Render
    const renderDropdown = (
        label: string,
        selected: Language | null,
        isOpen: boolean,
        setOpen: (v: boolean) => void,
        onSelect: (l: Language) => void
    ) => (
        <View style={styles.dropdownContainer}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setOpen(!isOpen)}>
                <Text style={styles.dropdownText}>{selected ? selected.languageName : "Select language..."}</Text>
                <MaterialCommunityIcons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#4A90E2" />
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
            <View style={styles.headerSection}>
                {renderDropdown("Source Language", sourceLang, isSourceOpen, setIsSourceOpen, (l) => { setSourceLang(l); setIsSourceOpen(false); })}
                <View style={{ width: 10 }} />
                {renderDropdown("Target Language", targetLang, isTargetOpen, setIsTargetOpen, (l) => { setTargetLang(l); setIsTargetOpen(false); })}
            </View>

            {sourceLang && targetLang && (
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                    <TextInput
                        placeholder="Search for words..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={handleWordSearch}
                    />
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredTranslations}
                    keyExtractor={(item) => item.translationId.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.wordCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.origText}>{item.originalText}</Text>
                                <Text style={styles.transText}>{item.translatedText}</Text>
                            </View>
                            <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteBtn}>
                                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {!sourceLang || !targetLang ? "Please select two languages." : "Word not found"}
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 15 },
    headerSection: { flexDirection: 'row', zIndex: 5000, marginBottom: 10 },
    dropdownContainer: { flex: 1 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 5 },
    dropdownTrigger: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dropdownText: { fontSize: 14, color: '#1E293B' },
    dropdownMenu: {
        position: 'absolute',
        top: 65,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        zIndex: 6000,
        elevation: 5
    },
    menuItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        height: 45,
        borderRadius: 10,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    searchInput: { flex: 1, marginLeft: 10 },
    wordCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 1
    },
    origText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    transText: { fontSize: 14, color: '#64748B', marginTop: 2 },
    deleteBtn: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 8 },
    emptyText: { textAlign: 'center', marginTop: 30, color: '#94A3B8' }
});