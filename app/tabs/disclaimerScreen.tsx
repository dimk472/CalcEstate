import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DisclaimerScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={['#000000', '#0A0A0A']}
                style={StyleSheet.absoluteFill}
            />

            {/* Simple Header */}
            <View style={[styles.header, { paddingTop: 50 + insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-down" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Legal</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 90 + Math.max(insets.bottom, 10) }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
                    {/* Warning Icon */}
                    <View style={styles.warningIcon}>
                        <Ionicons name="shield-outline" size={48} color="#4F46E5" />
                    </View>

                    <Text style={styles.title}>Legal Information</Text>

                    {/* Terms of Use Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="document-text-outline" size={24} color="#4F46E5" />
                            <Text style={styles.sectionTitle}>Terms of Use</Text>
                        </View>

                        <Text style={styles.text}>
                            By accessing or using this application, you agree to be bound by these terms. If you disagree with any part, you may not access the app.
                        </Text>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>1. Account Responsibility</Text>
                            <Text style={styles.text}>
                                You are responsible for maintaining the confidentiality of your account and for all activities under your account.
                            </Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>2. Acceptable Use</Text>
                            <Text style={styles.text}>
                                You agree not to use the app for any unlawful purpose or in any way that could damage, disable, or impair the app.
                            </Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>3. Intellectual Property</Text>
                            <Text style={styles.text}>
                                The app and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other laws.
                            </Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>4. Termination</Text>
                            <Text style={styles.text}>
                                We may terminate or suspend your access immediately, without prior notice, for any reason whatsoever.
                            </Text>
                        </View>
                    </View>

                    {/* Privacy Policy Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="lock-closed-outline" size={24} color="#4F46E5" />
                            <Text style={styles.sectionTitle}>Privacy Policy</Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>1. Data Collection</Text>
                            <Text style={styles.text}>
                                We collect information you provide directly to us, such as when you create properties, save calculations, or use app features. This includes:
                            </Text>
                            <View style={styles.bulletPoints}>
                                <Text style={styles.bulletPoint}>• Property names and details</Text>
                                <Text style={styles.bulletPoint}>• Calculation results</Text>
                                <Text style={styles.bulletPoint}>• Your favorites and preferences</Text>
                            </View>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>2. Data Storage</Text>
                            <Text style={styles.text}>
                                All your data is stored locally on your device using AsyncStorage. We do not collect, transmit, or store any personal information on external servers.
                            </Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>3. Third-Party Services</Text>
                            <Text style={styles.text}>
                                The app may contain links to third-party websites. We are not responsible for their privacy practices or content.
                            </Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>4. Data Security</Text>
                            <Text style={styles.text}>
                                While we implement reasonable security measures, no method of electronic storage is 100% secure. You acknowledge that you provide your data at your own risk.
                            </Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>5. Your Rights</Text>
                            <Text style={styles.text}>
                                You can delete all your data at any time by clearing app data or uninstalling the application.
                            </Text>
                        </View>
                    </View>

                    {/* Original Disclaimer Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="warning-outline" size={24} color="#FF9F0A" />
                            <Text style={styles.sectionTitle}>Disclaimer</Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>No Financial Advice</Text>
                            <Text style={styles.text}>
                                The information provided is for general informational purposes only. It does not constitute financial advice, investment advice, or any other type of professional advice.
                            </Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>Accuracy of Calculations</Text>
                            <Text style={styles.text}>
                                While we strive for accuracy, we make no guarantees about the completeness, reliability, or accuracy of any results. Calculations may contain errors.
                            </Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>No Liability</Text>
                            <Text style={styles.text}>
                                To the fullest extent permitted by law, we disclaim all liability for any loss, damage, or inconvenience arising from the use of this application.
                            </Text>
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>User Responsibility</Text>
                            <Text style={styles.text}>
                                You are solely responsible for any decisions you make based on the information provided. Always verify calculations and consult with qualified professionals.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.agreementText}>
                        By using this application, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use, Privacy Policy, and Disclaimer.
                    </Text>

                    <TouchableOpacity
                        style={styles.agreeButton}
                        onPress={() => router.back()}
                    >
                        <LinearGradient
                            colors={['#4F46E5', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.agreeButtonGradient}
                        >
                            <Text style={styles.agreeButtonText}>I Agree</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.dateText}>
                        Last Updated: {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                </Animated.View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '500',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingTop: 100,
    },
    card: {
        backgroundColor: '#0C0C0C',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    warningIcon: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 30,
        letterSpacing: -0.5,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    subSection: {
        marginBottom: 20,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4F46E5',
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        color: '#AAAAAA',
        lineHeight: 22,
        fontWeight: '400',
    },
    bulletPoints: {
        marginTop: 10,
        gap: 6,
        marginLeft: 8,
    },
    bulletPoint: {
        fontSize: 14,
        color: '#AAAAAA',
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 24,
    },
    agreementText: {
        fontSize: 15,
        color: '#FFFFFF',
        lineHeight: 24,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 24,
    },
    agreeButton: {
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 20,
    },
    agreeButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    agreeButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});