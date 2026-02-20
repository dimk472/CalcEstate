import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ------------------ Animated Tab Icon ------------------ */
type TabIconProps = {
    name: keyof typeof Ionicons.glyphMap;
    color: string;
    size: number;
    focused: boolean;
};

const AnimatedTabIcon = ({ name, color, size, focused }: TabIconProps) => {
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    useEffect(() => {
        scale.value = withTiming(focused ? 1 : 1, { duration: 200 });
        translateY.value = withTiming(focused ? -2 : 0, { duration: 200 });
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
        ],
    }));

    return (
        <Animated.View style={[animatedStyle, styles.iconContainer]}>
            <Ionicons name={name} size={size} color={color} />
            {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
        </Animated.View>
    );
};

/* ------------------ Tabs Layout ------------------ */
const TabsLayout = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    height: 43 + Math.max(insets.bottom, 10), // πιο κομψό
                    backgroundColor: "#000",
                    borderTopWidth: 1,
                    borderTopColor: "#111",
                    elevation: 0,
                    shadowOpacity: 0,
                    paddingBottom: Math.max(insets.bottom, 10), // πιο κομψό
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                },
                tabBarItemStyle: {
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 8,
                },
                tabBarActiveTintColor: "#fff",
                tabBarInactiveTintColor: "#979797",
            }}
        >
            {/* -------- Home / Index -------- */}
            <Tabs.Screen
                name="index"
                options={{
                    title: "Ratios",
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon
                            name="stats-chart"
                            color={color}
                            size={24}
                            focused={focused}
                        />
                    ),
                }}
            />

            {/* -------- Hidden Calculator Screen -------- */}
            <Tabs.Screen
                name="CalculatorScreen"
                options={{
                    href: null,
                }}
            />

            {/* -------- Hidden view property Screen -------- */}
            <Tabs.Screen
                name="viewProperty"
                options={{
                    href: null,
                }}
            />

            {/* -------- Hidden Donate Screen -------- */}
            <Tabs.Screen
                name="donateModal"
                options={{
                    href: null,
                }}
            />

            {/* -------- Hidden Disclaimer Screen -------- */}
            <Tabs.Screen
                name="disclaimerScreen"
                options={{
                    href: null,
                }}
            />

            {/* -------- Properties -------- */}
            <Tabs.Screen
                name="properties"
                options={{
                    title: "Properties",
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon
                            name="business"
                            color={color}
                            size={24}
                            focused={focused}
                        />
                    ),
                }}
            />
        </Tabs>
    );
};

export default TabsLayout;

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
    },
    activeDot: {
        position: "absolute",
        bottom: -2,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
});