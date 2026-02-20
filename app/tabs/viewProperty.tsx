import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProperties } from "./properties";

export default function ViewPropertyScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { properties, setProperties } = useProperties();
    const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);

    const property = properties.find(p => p.id === id);

    if (!property) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.errorText}>Property not found</Text>
            </View>
        );
    }

    const formatValue = (field: any) => {
        switch (field.type) {
            case 'date':
                return new Date(field.value).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            case 'boolean':
                return field.value === 'true' ? 'Yes' : 'No';
            case 'number':
                return Number(field.value).toLocaleString();
            default:
                return field.value;
        }
    };

    const getFieldIcon = (type: string) => {
        switch (type) {
            case 'text': return 'document-text';
            case 'number': return 'calculator';
            case 'date': return 'calendar';
            case 'boolean': return 'checkbox';
            default: return 'document';
        }
    };

    const handleDeleteField = (fieldId: string, fieldLabel: string) => {
        Alert.alert(
            "Delete Field",
            `Are you sure you want to delete "${fieldLabel}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        setDeletingFieldId(fieldId);

                        setProperties((prev) =>
                            prev.map((prop) => {
                                if (prop.id === property.id) {
                                    return {
                                        ...prop,
                                        dataFields: prop.dataFields.filter((f) => f.id !== fieldId),
                                    };
                                }
                                return prop;
                            })
                        );

                        setTimeout(() => setDeletingFieldId(null), 300);
                    }
                }
            ]
        );
    };

    const isRatioResult = (field: any) => {
        return field.label.includes('Result') || field.label.includes('result');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={['#000000', '#0A0A0A']}
                style={StyleSheet.absoluteFill}
            />

            <BlurView intensity={80} tint="dark" style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="chevron-down" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={[styles.headerDot, { backgroundColor: property.color }]} />
                    <Text style={styles.headerTitle}>{property.name}</Text>
                </View>
                <View style={styles.headerButton} />
            </BlurView>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.contentContainer,
                    { paddingBottom: 90 + (insets.bottom > 0 ? insets.bottom : 0) }
                ]}
            >
                <Animated.View entering={SlideInDown.delay(100)} style={styles.heroSection}>
                    <LinearGradient
                        colors={[`${property.color}20`, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroIcon}>
                            <Ionicons name="home-outline" size={32} color={property.color} />
                        </View>
                        <Text style={styles.heroTitle}>{property.name}</Text>
                        <View style={styles.heroStats}>
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatValue}>{property.dataFields.length}</Text>
                                <Text style={styles.heroStatLabel}>fields</Text>
                            </View>
                            <View style={styles.heroStatDivider} />
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatValue}>
                                    {new Date(property.createdAt).toLocaleDateString('en-US', { day: 'numeric' })}
                                </Text>
                                <Text style={styles.heroStatLabel}>
                                    {new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short' })}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>All Fields</Text>

                    {property.dataFields.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="scan-outline" size={40} color="#333" />
                            <Text style={styles.emptyText}>No fields added</Text>
                        </View>
                    ) : (
                        <View style={styles.fieldsGrid}>
                            {property.dataFields.map((field, index) => (
                                <Animated.View
                                    key={field.id}
                                    entering={FadeIn.delay(200 + index * 50)}
                                    style={[
                                        styles.fieldCard,
                                        deletingFieldId === field.id && styles.fieldCardDeleting
                                    ]}
                                >
                                    <View style={styles.fieldHeader}>
                                        <View style={[styles.fieldIcon, { backgroundColor: `${property.color}15` }]}>
                                            <Ionicons
                                                name={getFieldIcon(field.type)}
                                                size={20}
                                                color={property.color}
                                            />
                                        </View>
                                        <View style={styles.fieldHeaderText}>
                                            <Text style={styles.fieldLabel}>{field.label}</Text>
                                            <View style={styles.fieldMeta}>
                                                {isRatioResult(field) && (
                                                    <View style={[styles.ratioBadge, { backgroundColor: `${property.color}20` }]}>
                                                        <Ionicons name="calculator" size={10} color={property.color} />
                                                        <Text style={[styles.ratioBadgeText, { color: property.color }]}>Ratio</Text>
                                                    </View>
                                                )}
                                                <Text style={styles.fieldType}>{field.type}</Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => handleDeleteField(field.id, field.label)}
                                            style={styles.deleteButton}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.fieldValueContainer}>
                                        <Text style={styles.fieldValue}>
                                            {formatValue(field)}
                                        </Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: "500",
        color: "#FFFFFF",
        letterSpacing: -0.2,
    },
    content: {
        flex: 1,
        marginTop: 90,
    },
    contentContainer: {
        padding: 16,
    },
    heroSection: {
        marginBottom: 32,
        borderRadius: 24,
        overflow: 'hidden',
    },
    heroGradient: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 24,
    },
    heroIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "600",
        color: "#FFFFFF",
        letterSpacing: -0.5,
        marginBottom: 20,
    },
    heroStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 24,
    },
    heroStat: {
        alignItems: 'center',
    },
    heroStatValue: {
        fontSize: 20,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    heroStatLabel: {
        fontSize: 11,
        color: "#666",
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    heroStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    fieldsGrid: {
        gap: 12,
    },
    fieldCard: {
        backgroundColor: '#0C0C0C',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    fieldCardDeleting: {
        opacity: 0.5,
        transform: [{ scale: 0.98 }],
    },
    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    fieldIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fieldHeaderText: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    fieldMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fieldType: {
        fontSize: 11,
        color: "#666",
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    ratioBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ratioBadgeText: {
        fontSize: 9,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    deleteButton: {
        padding: 8,
    },
    fieldValueContainer: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        padding: 14,
    },
    fieldValue: {
        fontSize: 16,
        color: "#FFFFFF",
        lineHeight: 22,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 24,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    errorText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 100,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});