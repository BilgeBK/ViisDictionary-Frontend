import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { ENDPOINTS } from "@/constants/config";

export default function OnlyList() {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(ENDPOINTS.LANGUAGES)
            .then(res => res.json())
            .then(data => {
                setLanguages(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <ActivityIndicator style={{flex:1}} />;

    return (
        <View style={styles.container}>
            <FlatList
                data={languages}
                keyExtractor={(item: any) => item.languageId.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.name}>{item.languageName}</Text>
                        <Text style={styles.code}>{item.languageCode.toUpperCase()}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#F8FAFC' },
    item: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
    name: { fontSize: 16, fontWeight: '500' },
    code: { color: '#64748B', fontWeight: 'bold' }
});