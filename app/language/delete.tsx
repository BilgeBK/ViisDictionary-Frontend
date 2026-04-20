import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    ActivityIndicator, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ENDPOINTS } from "@/constants/config";

interface Language {
    languageId: number;
    languageName: string;
    languageCode: string;
}

export default function DeleteLanguage() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);

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

    // Delete confirm pop up
    const confirmDelete = (lang: Language) => {
        Alert.alert(
            "Delete the language",
            `"${lang.languageName}" are you sure you want to delete the language?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, delete",
                    style: "destructive",
                    onPress: () => handleDelete(lang.languageId)
                }
            ]
        );
    };

    const handleDelete = async (id: number) => {
        try {
            // Backend endpoint: /api/languages/delete/{id}
            const response = await fetch(`${ENDPOINTS.DELETE_LANGUAGE}/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Alert.alert("Success", "Deleted the language.");
                // Instead of retrieving the list from the server, we quickly drop it from the local state.
                setLanguages(prev => prev.filter(l => l.languageId !== id));
            } else {
                Alert.alert("Error", "The deletion failed. This language may be associated with other data.");
            }
        } catch (error) {
            Alert.alert("Connection Error", "The server could not be reached.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage the languages</Text>
            {loading ? <ActivityIndicator size="large" color="#EF4444" /> : (
                <FlatList
                    data={languages}
                    keyExtractor={(item) => item.languageId.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View>
                                <Text style={styles.langName}>{item.languageName}</Text>
                                <Text style={styles.langCode}>{item.languageCode}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => confirmDelete(item)}
                            >
                                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No languages have been added yet..</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 15 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15, textAlign: 'center' },
    card: {
        backgroundColor: '#fff', padding: 15, borderRadius: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4
    },
    langName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    langCode: { color: '#64748B', fontSize: 13 },
    deleteBtn: {
        padding: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 8
    },
    emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 20 }
});