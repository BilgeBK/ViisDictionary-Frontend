import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LanguageDashboard() {
    const router = useRouter();

    const menuItems = [
        { title: 'Languages List', icon: 'format-list-bulleted', route: '/language/list', color: '#4A90E2' },
        { title: 'New Language', icon: 'plus-circle', route: '/language/add', color: '#2ECC71' },
        { title: 'Update Language', icon: 'pencil', route: '/language/update', color: '#F1C40F' },
        { title: 'Delete Language', icon: 'trash-can', route: '/language/delete', color: '#E74C3C' },
    ];

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Languages</Text>
            <View style={styles.grid}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => router.push(item.route as any)}
                    >
                        <MaterialCommunityIcons name={item.icon as any} size={40} color={item.color} />
                        <Text style={styles.cardText}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
    header: { fontSize: 22, fontWeight: 'bold', marginVertical: 30, textAlign: 'center', color: '#1E293B' },
    grid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
    card: {
        backgroundColor: '#fff',
        width: '47%',
        aspectRatio: 1.1,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    cardText: { marginTop: 10, fontWeight: '600', color: '#334155', textAlign: 'center' }
});