import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { ENDPOINTS } from "@/constants/config";
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Language {
    languageId: number;
    languageName: string;
    languageCode: string;
}

export default function AddTranslation() {
    const router = useRouter();
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingLangs, setFetchingLangs] = useState(true);

    // Form States
    const [sourceLangId, setSourceLangId] = useState<number | null>(null);
    const [targetLangId, setTargetLangId] = useState<number | null>(null);
    const [originalText, setOriginalText] = useState('');
    const [translatedText, setTranslatedText] = useState('');

    // Load the languages
    useEffect(() => {
        fetch(ENDPOINTS.LANGUAGES)
            .then(res => res.json())
            .then(data => {
                setLanguages(data);
                if (data.length >= 2) {
                    setSourceLangId(data[0].languageId);
                    setTargetLangId(data[1].languageId);
                }
            })
            .catch(() => Alert.alert("Error", "Language list could not be retrieved."))
            .finally(() => setFetchingLangs(false));
    }, []);

    const handleSave = async () => {
        if (!originalText || !translatedText || !sourceLangId || !targetLangId) {
            Alert.alert("Warning", "Please fill in all fields.");
            return;
        }

        if (sourceLangId === targetLangId) {
            Alert.alert("Warning", "The source and target languages cannot be the same.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(ENDPOINTS.ADD_TRANSLATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceLanguageId: sourceLangId,
                    targetLanguageId: targetLangId,
                    originalText: originalText.trim(),
                    translatedText: translatedText.trim()
                }),
            });

            if (response.ok) {
                Alert.alert("Success", "Translation successfully added.", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("Error", "A problem occurred during registration.");
            }
        } catch (error) {
            Alert.alert("Connection Error", "The server could not be reached.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingLangs) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#4A90E2" /></View>;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="book-plus" size={50} color="#4A90E2" />
                <Text style={styles.title}>Add new translation</Text>
            </View>

            <View style={styles.card}>
                {/* Source Language Selection*/}
                <Text style={styles.label}>Source Language</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={sourceLangId}
                        onValueChange={(val) => setSourceLangId(val)}
                    >
                        {languages.map(lang => (
                            <Picker.Item key={lang.languageId} label={lang.languageName} value={lang.languageId} />
                        ))}
                    </Picker>
                </View>

                {/* Target Language Selection */}
                <Text style={styles.label}>Target Language</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={targetLangId}
                        onValueChange={(val) => setTargetLangId(val)}
                    >
                        {languages.map(lang => (
                            <Picker.Item key={lang.languageId} label={lang.languageName} value={lang.languageId} />
                        ))}
                    </Picker>
                </View>

                {/* Text */}
                <Text style={styles.label}>Original Text</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline numberOfLines={3}
                    value={originalText} onChangeText={setOriginalText}
                    placeholder="Example: Apple"
                />

                <Text style={styles.label}>Translation</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline numberOfLines={3}
                    value={translatedText} onChangeText={setTranslatedText}
                    placeholder="Örn: Elma"
                />

                <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : (
                        <Text style={styles.btnText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#F8FAFC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', marginBottom: 25, marginTop: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginTop: 10 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 4 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#64748B', marginBottom: 8, marginTop: 15 },
    pickerWrapper: { backgroundColor: '#F1F5F9', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
    input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    textArea: { textAlignVertical: 'top', minHeight: 80 },
    btn: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 25 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});