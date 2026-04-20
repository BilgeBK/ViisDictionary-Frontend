import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WordDashboard() {
    const router = useRouter();

    const menuItems = [
        { title: 'Words List', icon: 'format-list-bulleted', route: '/translation/list', color: '#4A90E2' },
        { title: 'New Word', icon: 'plus-circle', route: '/translation/add', color: '#2ECC71' },
        { title: 'Update Word', icon: 'pencil', route: '/translation/update', color: '#F1C40F' },
        { title: 'Delete Word', icon: 'trash-can', route: '/translation/delete', color: '#E74C3C' },
    ];

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Words</Text>
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