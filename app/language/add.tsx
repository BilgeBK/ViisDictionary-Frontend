import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ENDPOINTS} from "@/constants/config";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddLanguage() {
    const router = useRouter();

    const [languageName, setLanguageName] = useState('');
    const [languageCode, setLanguageCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!languageName.trim() || !languageCode.trim()) {
            Alert.alert("Warning", "Please enter the language name and language code.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(ENDPOINTS.ADD_LANGUAGE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    languageName: languageName.trim(),
                    languageCode: languageCode.trim().toUpperCase(),
                }),
            });

            if (response.ok) {
                const result = await response.json();
                Alert.alert("Success", `${result.languageName} added successfully.`, [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                // if backend return 400 or 500 code
                Alert.alert("ERROR", "Language could not add. May be this language is already exist.");
            }
        } catch (error) {
            console.error("Request Error:", error);
            Alert.alert("Connection Problem", "The server could not be reached. Please check your internet connection and backend IP address.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="translate" size={40} color="#4A90E2" />
                    </View>
                    <Text style={styles.title}>Add new Language</Text>
                    <Text style={styles.description}>
                        Increase translation capacity by adding a new language to the system.
                    </Text>
                </View>

                {/* Form Section */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Language Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Example: Turkish"
                            value={languageName}
                            onChangeText={setLanguageName}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Language Code(ISO)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Example: TR"
                            autoCapitalize="characters"
                            maxLength={5}
                            value={languageCode}
                            onChangeText={setLanguageCode}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.8 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="content-save-check" size={22} color="#fff" />
                                <Text style={styles.buttonText}>Save language</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F8FAFC', padding: 24, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 40 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    description: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
    form: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
    input: { backgroundColor: '#F1F5F9', padding: 14, borderRadius: 12, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
    saveButton: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});