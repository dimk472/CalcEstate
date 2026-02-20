import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useState } from "react";

import {
    Alert,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

const { width } = Dimensions.get("window");

// Crypto addresses (replace with your own)
const CRYPTO_ADDRESSES = {
    BTC: "bc1q9n45lwyj0rz9kxk7n0zeqr2hf4hu056aznk8j2",
    ETH: "0x19b2963c6a3a9e674390bab025a96b755137e774",
    SOL: "GB2FU6f7rAfzbGiLBYrmfJRJkKxb9nnzVTQJej2PzSGf",
    USDC: "0x19b2963c6a3a9e674390bab025a96b755137e774",
    USDT: "0x19b2963c6a3a9e674390bab025a96b755137e774",
    BNB: "0x19b2963c6a3a9e674390bab025a96b755137e774",
};

type CryptoType = "BTC" | "ETH" | "SOL" | "USDC" | "USDT" | "BNB";

export default function DonateModalScreen() {
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoType | null>(null);

    const handleDonate = (type: string, url?: string) => {
        if (type === "paypal") {
            Linking.openURL(
                "https://paypal.me/dimkaza"
            );
        } else if (type === "stripe") {
            Linking.openURL("https://buy.stripe.com/YOUR_LINK");
        } else if (type === "googlepay") {
            Linking.openURL(
                "https://pay.google.com/gp/w/u/0/home/paymentmethods"
            );
        } else if (type.startsWith("crypto_")) {
            const crypto = type.replace("crypto_", "") as CryptoType;
            setSelectedCrypto(crypto);
        }
        if (url) {
            Linking.openURL(url);
        }
    };

    const copyToClipboard = async (text: string, currency: string) => {
        await Clipboard.setStringAsync(text);
        Alert.alert("✅ Copied!", `${currency} address copied to clipboard`);
    };

    const renderCryptoDetails = () => {
        if (!selectedCrypto) return null;

        const cryptoData: {
            [key in CryptoType]: {
                name: string;
                address: string;
                color: string;
                image: any;
            };
        } = {
            BTC: {
                name: "Bitcoin",
                address: CRYPTO_ADDRESSES.BTC,
                color: "#F7931A",
                image: require("../../assets/images/cryptoIcons/btc.png"),
            },
            ETH: {
                name: "Ethereum",
                address: CRYPTO_ADDRESSES.ETH,
                color: "#627EEA",
                image: require("../../assets/images/cryptoIcons/eth.png"),
            },
            SOL: {
                name: "Solana",
                address: CRYPTO_ADDRESSES.SOL,
                color: "#14F195",
                image: require("../../assets/images/cryptoIcons/sol.png"),
            },
            BNB: {
                name: "BNB",
                address: CRYPTO_ADDRESSES.BNB,
                color: "#F3BA2F",
                image: require("../../assets/images/cryptoIcons/bnb.png"),
            },
            USDC: {
                name: "USD Coin",
                address: CRYPTO_ADDRESSES.USDC,
                color: "#2775CA",
                image: require("../../assets/images/cryptoIcons/usdc.png"),
            },
            USDT: {
                name: "Tether",
                address: CRYPTO_ADDRESSES.USDT,
                color: "#26A17B",
                image: require("../../assets/images/cryptoIcons/usdt.png"),
            },
        };

        const crypto = cryptoData[selectedCrypto];
        if (!crypto) return null;

        return (
            <View style={styles.cryptoDetailContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedCrypto(null)}
                >
                    <Ionicons name="arrow-back" size={20} color="#1E293B" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.cryptoCard}>
                    <View
                        style={[
                            styles.cryptoIconWrapper,
                            { backgroundColor: crypto.color + "20" },
                        ]}
                    >
                        <Image source={crypto.image} style={styles.cryptoIcon} />
                    </View>

                    <Text style={styles.cryptoTitle}>Donate with {crypto.name}</Text>

                    <View style={styles.qrWrapper}>
                        <View style={styles.qrContainer}>
                            <QRCode value={crypto.address} size={200} />
                        </View>
                    </View>

                    <View style={styles.addressWrapper}>
                        <Text style={styles.addressLabel}>Network address</Text>
                        <View style={styles.addressRow}>
                            <Text style={styles.addressText} numberOfLines={2}>
                                {crypto.address}
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.copyButton,
                                    { backgroundColor: crypto.color + "20" },
                                ]}
                                onPress={() => copyToClipboard(crypto.address, crypto.name)}
                            >
                                <Ionicons name="copy-outline" size={20} color={crypto.color} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.warningContainer}>
                        <Ionicons name="information-circle" size={18} color="#475569" />
                        <Text style={styles.warningText}>
                            Only send {crypto.name} to this address
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const paymentMethods = [
        {
            section: "Traditional",
            methods: [
                {
                    id: "paypal",
                    name: "PayPal",
                    icon: "logo-paypal" as const,
                    color: "#003087",
                },
                {
                    id: "stripe",
                    name: "Stripe",
                    icon: "card" as const,
                    color: "#635BFF",
                },
                {
                    id: "googlepay",
                    name: "Google Pay",
                    icon: "logo-google" as const,
                    color: "#4285F4",
                },
            ],
        },
        {
            section: "Crypto",
            methods: [
                {
                    id: "crypto_BTC",
                    name: "Bitcoin",
                    image: require("../../assets/images/cryptoIcons/btc.png"),
                    color: "#F7931A",
                },
                {
                    id: "crypto_ETH",
                    name: "Ethereum",
                    image: require("../../assets/images/cryptoIcons/eth.png"),
                    color: "#627EEA",
                },
                {
                    id: "crypto_SOL",
                    name: "Solana",
                    image: require("../../assets/images/cryptoIcons/sol.png"),
                    color: "#14F195",
                },
                {
                    id: "crypto_BNB",
                    name: "BNB",
                    image: require("../../assets/images/cryptoIcons/bnb.png"),
                    color: "#F3BA2F",
                },
                {
                    id: "crypto_USDC",
                    name: "USD Coin",
                    image: require("../../assets/images/cryptoIcons/usdc.png"),
                    color: "#2775CA",
                },
                {
                    id: "crypto_USDT",
                    name: "Tether",
                    image: require("../../assets/images/cryptoIcons/usdt.png"),
                    color: "#26A17B",
                },
            ],
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft} />
                <Text style={styles.headerTitle}>Support</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.headerButton}
                >
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {!selectedCrypto ? (
                    <>
                        <Text style={styles.greeting}>👋</Text>
                        <Text style={styles.title}>Support the Creator</Text>
                        <Text style={styles.subtitle}>
                            Choose your preferred way to support our work
                        </Text>

                        <View style={styles.methodsContainer}>
                            {paymentMethods.map((section, idx) => (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.section}</Text>
                                    <View style={styles.methodsGrid}>
                                        {section.methods.map((method) => (
                                            <TouchableOpacity
                                                key={method.id}
                                                style={styles.methodCard}
                                                onPress={() => handleDonate(method.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View
                                                    style={[
                                                        styles.methodIconContainer,
                                                        { backgroundColor: method.color + "20" },
                                                    ]}
                                                >
                                                    {"image" in method ? (
                                                        <Image
                                                            source={method.image}
                                                            style={styles.methodIcon}
                                                        />
                                                    ) : (
                                                        <Ionicons
                                                            name={method.icon}
                                                            size={28}
                                                            color={method.color}
                                                        />
                                                    )}
                                                </View>
                                                <Text style={styles.methodName}>{method.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.footer}>
                            <View style={styles.securityBadge}>
                                <Ionicons name="shield-checkmark" size={16} color="#64748B" />
                                <Text style={styles.securityText}>Secure & Encrypted</Text>
                            </View>
                        </View>
                    </>
                ) : (
                    renderCryptoDetails()
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 12,
        backgroundColor: "#FFFFFF",
    },
    headerLeft: {
        width: 40,
    },
    headerRight: {
        width: 40,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F8F8F8",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
        letterSpacing: -0.3,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    greeting: {
        fontSize: 48,
        textAlign: "center",
        marginTop: 20,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        color: "#000",
        textAlign: "center",
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#666",
        textAlign: "center",
        paddingHorizontal: 40,
        lineHeight: 22,
        marginBottom: 32,
    },
    methodsContainer: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#94A3B8",
        marginBottom: 14,
        letterSpacing: 0.3,
        textTransform: "uppercase",
    },
    methodsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    methodCard: {
        width: (width - 64) / 3,
        aspectRatio: 1,
        backgroundColor: "#F8F8F8",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    methodIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    methodIcon: {
        width: 28,
        height: 28,
    },
    methodName: {
        fontSize: 13,
        fontWeight: "500",
        color: "#1E293B",
    },
    footer: {
        alignItems: "center",
        marginTop: 20,
        paddingBottom: 10,
    },
    securityBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F8F8",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
        gap: 6,
    },
    securityText: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "400",
    },
    // Crypto Detail Styles
    cryptoDetailContainer: {
        padding: 20,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
        alignSelf: "flex-start",
        backgroundColor: "#F8F8F8",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
        gap: 4,
    },
    backText: {
        fontSize: 15,
        color: "#1E293B",
        fontWeight: "500",
    },
    cryptoCard: {
        backgroundColor: "#F8F8F8",
        borderRadius: 32,
        padding: 24,
        alignItems: "center",
    },
    cryptoIconWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    cryptoIcon: {
        width: 56,
        height: 56,
    },
    cryptoTitle: {
        fontSize: 22,
        fontWeight: "600",
        color: "#000",
        letterSpacing: -0.3,
        marginBottom: 24,
    },
    qrWrapper: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 12,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    qrContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
    },
    addressWrapper: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    addressLabel: {
        fontSize: 12,
        color: "#94A3B8",
        marginBottom: 8,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: "#1E293B",
        fontFamily: "monospace",
    },
    copyButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    warningContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        gap: 8,
    },
    warningText: {
        fontSize: 13,
        color: "#475569",
        fontWeight: "400",
    },
});