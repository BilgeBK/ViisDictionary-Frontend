import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, SafeAreaView, ScrollView, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ENDPOINTS } from "@/constants/config";

interface Language {
    languageId: number;
    languageCode: string;
    languageName: string;
}

export default function HomeScreen() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTranslating, setIsTranslating] = useState(false);

    // State'ler artık isim değil, ID tutuyor
    const [sourceLangId, setSourceLangId] = useState<number | null>(null);
    const [targetLangId, setTargetLangId] = useState<number | null>(null);

    const [inputText, setInputText] = useState('');
    const [resultText, setResultText] = useState('');

    useEffect(() => {
        fetchLanguages();
    }, []);

    // const fetchLanguages = async () => {
    //     try {
    //         console.log("İstek atılan URL:", `${BASE_URL}/language/allLanguages`);
    //
    //         const response = await fetch(`${BASE_URL}/language/allLanguages`, {
    //             method: 'GET',
    //             headers: {
    //                 'Accept': 'application/json',
    //                 'Content-Type': 'application/json',
    //             },
    //         });
    //
    //         if (!response.ok) {
    //             throw new Error(`Sunucu hatası: ${response.status}`);
    //         }
    //
    //         const data: Language[] = await response.json();
    //         console.log("Gelen diller:", data);
    //
    //         if (data && data.length > 0) {
    //             console.error('data sourceid is ', data[0].languageId);
    //             console.error('data sourceLangid is ', sourceLangId);
    //             console.error('data targetid is ', data[1].languageId);
    //             console.error('data targetLangid is ', targetLangId);
    //             setLanguages(data);
    //             setSourceLangId(data[0].languageId);
    //             setTargetLangId(data[1] ? data[1].languageId : data[0].languageId);
    //         }
    //     } catch (error: any) {
    //         console.error("Yükleme Hatası:", error);
    //         // Hatanın ne olduğunu ekranda tam görelim
    //         Alert.alert("Bağlantı Sorunu", `Hata: ${error.message}\nURL: ${BASE_URL}`);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const fetchLanguages = async () => {
        try {
            const response = await fetch(ENDPOINTS.LANGUAGES);
            const data: Language[] = await response.json();

            if (data && data.length > 0) {
                setLanguages(data);

                // ÖNEMLİ: State'i doğrudan verinin içindeki ID ile dolduruyoruz
                const initialSource = data[0].languageId;
                const initialTarget = data[1] ? data[1].languageId : data[0].languageId;

                setSourceLangId(initialSource);
                setTargetLangId(initialTarget);

                console.log("Başlangıç ID'leri atandı:", initialSource, initialTarget);
            }
        } catch (error) {
            console.error("Diller yüklenirken hata:", error);
        } finally {
            setLoading(false)
        }
    };


    const handleTranslate = async () => {
        // Debug için log basalım, terminalde ne gittiğini gör
        console.log("Gönderilen ID'ler:", sourceLangId, targetLangId);

        if (!inputText.trim() || sourceLangId == null || targetLangId == null) {
            Alert.alert("Uyarı", "Lütfen metin girin ve dilleri seçtiğinizden emin olun.");
            return;
        }

        setIsTranslating(true);
        try {
            const response = await fetch(ENDPOINTS.TRANSLATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalText: inputText,
                    sourceLanguageId: Number(sourceLangId), // Zorunlu sayıya çevir
                    targetLanguageId: Number(targetLangId)  // Zorunlu sayıya çevir
                }),
            });

            const result = await response.text();
            setResultText(result);
        } catch (error) {
            Alert.alert("Hata", "Çeviri isteği başarısız.");
        } finally {
            setIsTranslating(false);
        }
    };

    // const handleTranslate = async () => {
    //     if (!inputText.trim() || sourceLangId === null || targetLangId === null) {
    //         Alert.alert("Uyarı", "Lütfen metin girin ve dilleri seçin.");
    //         return;
    //     }
    //
    //     setIsTranslating(true);
    //
    //     try {
    //         const response = await fetch(`${BASE_URL}/translate`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 originalText: inputText,
    //                 sourceLangId: sourceLangId, // ID gönderiyoruz
    //                 targetLangId: targetLangId  // ID gönderiyoruz
    //             }),
    //         });
    //
    //         // Backend String (Düz metin) döndüğü için .text() kullanıyoruz
    //         const result = await response.text();
    //         setResultText(result);
    //     } catch (error) {
    //         console.error("Çeviri Hatası:", error);
    //         Alert.alert("Hata", "Çeviri sırasında bir sorun oluştu.");
    //     } finally {
    //         setIsTranslating(false);
    //     }
    // };

    const handleSwapLanguages = () => {
        // Mevcut değerleri yedekle (temp)
        const tempId = sourceLangId;
        const tempText = inputText;
        const tempResult = resultText;

        // ID'leri takas et
        setSourceLangId(targetLangId);
        setTargetLangId(tempId);

        // Metinleri takas et (Kullanıcı "merhaba" yazdıysa ve çeviri "hello" ise,
        // ok tuşuna basınca "hello" yukarı çıksın ki tekrar çevirebilsin)
        setInputText(tempResult);
        setResultText(tempText);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={{marginTop: 10}}>Loading Languages</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Viis Dictionary</Text>

                {/* select language section */}
                <View style={styles.pickerRow}>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={sourceLangId}
                            onValueChange={(val) => setSourceLangId(val)}
                        >
                            {languages.map((lang) => (
                                <Picker.Item
                                    key={lang.languageId.toString()}
                                    label={lang.languageName}
                                    value={lang.languageId}
                                />
                            ))}
                        </Picker>
                    </View>

                    <MaterialCommunityIcons name="swap-horizontal" size={24} color="#4A90E2" onPress={handleSwapLanguages} />

                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={targetLangId}
                            onValueChange={(val) => setTargetLangId(val)}
                        >
                            {languages.map((lang) => (
                                <Picker.Item
                                    key={lang.languageId.toString()}
                                    label={lang.languageName}
                                    value={lang.languageId}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Giriş Alanı */}
                <TextInput
                    style={styles.input}
                    placeholder="Metin girin..."
                    multiline
                    value={inputText}
                    onChangeText={setInputText}
                />

                <TouchableOpacity
                    style={[styles.button, isTranslating && { opacity: 0.7 }]}
                    onPress={handleTranslate}
                    disabled={isTranslating}
                >
                    {isTranslating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Translate</Text>
                    )}
                </TouchableOpacity>

                {/* Sonuç Alanı */}
                {resultText !== '' && (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultLabel}>Translatıon</Text>
                        <Text style={styles.resultText}>{resultText}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
    container: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#1E293B' },
    pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    pickerWrapper: { flex: 0.45, backgroundColor: '#fff', borderRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#E2E8F0' },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        height: 120,
        textAlignVertical: 'top',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1
    },
    button: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, marginTop: 15, elevation: 2 },
    buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
    resultBox: { marginTop: 25, padding: 20, backgroundColor: '#EFF6FF', borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE' },
    resultLabel: { fontSize: 12, color: '#3B82F6', fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
    resultText: { fontSize: 18, color: '#1E293B', fontWeight: '500' }
});