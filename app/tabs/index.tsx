import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { realEstateRatios } from "../data/ratios";

const LIKED_RATIOS_KEY = 'likedRatios';

export default function Index() {
  const insets = useSafeAreaInsets();
  const [allRatios, setAllRatios] = useState(realEstateRatios);
  const [displayedRatios, setDisplayedRatios] = useState(realEstateRatios);
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLikedRatios();
  }, []);

  const loadLikedRatios = async () => {
    try {
      setIsLoading(true);
      const savedLikedRatios = await AsyncStorage.getItem(LIKED_RATIOS_KEY);

      if (savedLikedRatios !== null) {
        const likedIds = JSON.parse(savedLikedRatios);
        const updatedRatios = realEstateRatios.map(ratio => ({
          ...ratio,
          isLiked: likedIds.includes(ratio.id)
        }));

        setAllRatios(updatedRatios);
        setDisplayedRatios(updatedRatios);
      } else {
        setDisplayedRatios(realEstateRatios);
      }
    } catch (error) {
      console.error('Error loading liked ratios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLikedRatios = async (updatedRatios: typeof realEstateRatios) => {
    try {
      const likedIds = updatedRatios
        .filter(ratio => ratio.isLiked)
        .map(ratio => ratio.id);
      await AsyncStorage.setItem(LIKED_RATIOS_KEY, JSON.stringify(likedIds));
    } catch (error) {
      console.error('Error saving liked ratios:', error);
    }
  };

  const handleLikePress = async (id: number) => {
    const updatedAllRatios = allRatios.map(item =>
      item.id === id
        ? { ...item, isLiked: !item.isLiked }
        : item
    );

    setAllRatios(updatedAllRatios);

    if (showOnlyLiked) {
      setDisplayedRatios(updatedAllRatios.filter(item => item.isLiked));
    } else {
      setDisplayedRatios(updatedAllRatios);
    }

    await saveLikedRatios(updatedAllRatios);
  };

  const toggleShowOnlyLiked = () => {
    setShowOnlyLiked(!showOnlyLiked);
    if (!showOnlyLiked) {
      setDisplayedRatios(allRatios.filter(item => item.isLiked));
    } else {
      setDisplayedRatios(allRatios);
    }
  };

  const filteredRatios = displayedRatios.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#000000', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Simple Header with Search and Favicon */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ratios..."
              placeholderTextColor="#444"
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor="#4F46E5"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={14} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={toggleShowOnlyLiked}
            style={styles.faviconButton}
          >
            <Ionicons
              name={showOnlyLiked ? "heart" : "heart-outline"}
              size={20}
              color={showOnlyLiked ? "#FF3B30" : "#888"}
            />
          </TouchableOpacity>
        </View>
      </BlurView>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 90 + (insets.bottom > 0 ? insets.bottom : 0) }
        ]}
        showsVerticalScrollIndicator={false}
        entering={FadeIn.duration(220)}
        exiting={FadeOut.duration(180)}
      >
        {filteredRatios.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={showOnlyLiked ? "heart-outline" : "search"}
                size={32}
                color="#333"
              />
            </View>
            <Text style={styles.emptyTitle}>
              {showOnlyLiked ? "No liked ratios" : "No results found"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {showOnlyLiked
                ? "Tap the heart icon on any ratio to save it"
                : "Try searching with different keywords"}
            </Text>
          </View>
        ) : (
          filteredRatios.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeIn.delay(index * 100)}
              style={styles.ratioCard}
            >
              <BlurView intensity={60} tint="dark" style={styles.cardBlur}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <View style={styles.titleContainer}>
                      <Text style={styles.ratioTitle}>{item.title}</Text>
                      <View style={styles.categoryRow}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                        <View style={[styles.importanceDot, {
                          backgroundColor: item.importance === "Critical" ? "#FF3B30" :
                            item.importance === "High" ? "#FF9F0A" : "#30D158"
                        }]} />
                        <Text style={styles.importanceText}>{item.importance}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleLikePress(item.id)}
                    style={[
                      styles.cardLikeButton,
                      item.isLiked && styles.cardLikeButtonActive
                    ]}
                  >
                    <Ionicons
                      name={item.isLiked ? "heart" : "heart-outline"}
                      size={16}
                      color={item.isLiked ? "#FF3B30" : "#666"}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.ratioDescription}>
                  {item.description}
                </Text>

                <View style={styles.formulaContainer}>
                  <Text style={styles.formulaLabel}>Formula</Text>
                  <Text style={styles.formulaText}>{item.formula}</Text>
                </View>

                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsText}>{item.details}</Text>
                </View>

                <TouchableOpacity
                  style={styles.calculateButton}
                  onPress={() => {
                    router.navigate({
                      pathname: "/tabs/CalculatorScreen",
                      params: { ratioId: item.id.toString() },
                    });
                  }}
                >
                  <Text style={[styles.calculateText, { color: item.color }]}>Calculate →</Text>
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          ))
        )}

        <View style={[styles.footer, { marginBottom: insets.bottom > 0 ? 0 : 10 }]}>
          <TouchableOpacity onPress={() => router.navigate("/tabs/donateModal")}>
            <Text style={styles.footerLink}>Buy me a coffee</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.navigate("/tabs/disclaimerScreen")}>
            <Text style={styles.footerLink}>Disclaimer</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
  },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  faviconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  scrollView: {
    flex: 1,
    marginTop: 110,
  },
  scrollContent: {
    padding: 16,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  ratioCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardBlur: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  ratioTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  importanceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  importanceText: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardLikeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardLikeButtonActive: {
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderColor: 'rgba(255,59,48,0.2)',
  },

  ratioDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 16,
  },

  formulaContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  formulaLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  formulaText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },

  detailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 16,
  },

  calculateButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    marginTop: 4,
  },
  calculateText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  footerLink: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
});