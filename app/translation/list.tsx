import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { ENDPOINTS } from "@/constants/config";
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Language {
    languageId: number;
    languageName: string;
}

interface Translation {
    translationId: number;
    originalText: string;
    translatedText: string;
}

export default function TranslationList() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [loading, setLoading] = useState(false);

    // UI ve Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLang, setSelectedLang] = useState<Language | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Retrieve languages when the page loads.
    useEffect(() => {
        fetch(ENDPOINTS.LANGUAGES)
            .then(res => res.json())
            .then(data => setLanguages(data))
            .catch(() => Alert.alert("Hata", "Diller yüklenemedi."));
    }, []);

    const handleSelectLanguage = async (lang: Language) => {
        setSelectedLang(lang);
        setIsDropdownOpen(false);
        setSearchQuery('');
        setLoading(true);

        try {
            const response = await fetch(`${ENDPOINTS.GET_TRANSLATE}/${lang.languageId}`);
            if (response.ok) {
                const data = await response.json();
                setTranslations(data);
            } else {
                setTranslations([]);
            }
        } catch (error) {
            Alert.alert("Error", "The words could not be retrieved.");
        } finally {
            setLoading(false);
        }
    };

    const filteredLanguages = languages.filter(l =>
        l.languageName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchSection}>
                <Text style={styles.label}>Which language's words would you like to see?</Text>
                <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <Text style={styles.dropdownTriggerText}>
                        {selectedLang ? selectedLang.languageName : "Search and select a language..."}
                    </Text>
                    <MaterialCommunityIcons
                        name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                        size={22} color="#4A90E2"
                    />
                </TouchableOpacity>

                {isDropdownOpen && (
                    <View style={styles.dropdownContent}>
                        <View style={styles.searchBarWrapper}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Dil ara..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                        </View>
                        <FlatList
                            data={filteredLanguages}
                            keyExtractor={(item) => item.languageId.toString()}
                            style={{ maxHeight: 200 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.langItem}
                                    onPress={() => handleSelectLanguage(item)}
                                >
                                    <Text style={styles.langItemText}>{item.languageName}</Text>
                                    {selectedLang?.languageId === item.languageId && (
                                        <MaterialCommunityIcons name="check" size={18} color="#4A90E2" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </View>

            {/* ---word list--- */}
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#4A90E2" /></View>
            ) : (
                <FlatList
                    data={translations}
                    keyExtractor={(item) => item.translationId.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        selectedLang ? (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="text-search-variant" size={60} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No translation has been added yet in this language.</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="hand-pointing-up" size={60} color="#CBD5E1" />
                                <Text style={styles.emptyText}>Please select a language to list.</Text>
                            </View>
                        )
                    }
                    renderItem={({ item }) => (
                        <View style={styles.wordCard}>
                            <View style={styles.wordHeader}>
                                <Text style={styles.sourceText}>{item.originalText}</Text>
                                <View style={styles.divider} />
                                <Text style={styles.targetText}>{item.translatedText}</Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingTop: 20 },
    center: { marginTop: 100, alignItems: 'center' },
    label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 10, textTransform: 'uppercase' },
    searchSection: { zIndex: 1000, marginBottom: 20 },
    dropdownTrigger: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0',
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05
    },
    dropdownTriggerText: { color: '#1E293B', fontSize: 16, fontWeight: '500' },
    dropdownContent: {
        backgroundColor: '#fff', borderRadius: 14, marginTop: 8,
        borderWidth: 1, borderColor: '#E2E8F0', elevation: 10,
        position: 'absolute', top: 75, left: 0, right: 0, zIndex: 2000, overflow: 'hidden'
    },
    searchBarWrapper: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#F8FAFC'
    },
    searchInput: { flex: 1, padding: 12, fontSize: 15, color: '#1E293B' },
    langItem: {
        padding: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    langItemText: { fontSize: 15, color: '#334155' },
    listContainer: { paddingBottom: 40 },
    wordCard: {
        backgroundColor: '#fff', borderRadius: 18, marginBottom: 15, padding: 20,
        borderLeftWidth: 5, borderLeftColor: '#4A90E2',
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }
    },
    wordHeader: { gap: 8 },
    sourceText: { fontSize: 15, color: '#64748B', fontStyle: 'italic' },
    targetText: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 15, fontSize: 16, paddingHorizontal: 40 }
});