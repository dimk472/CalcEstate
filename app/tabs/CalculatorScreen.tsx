import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown
} from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateRatio } from "../data/formulas";
import { CalculateRatiosPropsArray } from "../data/ratios";
import { CustomProperty, DataField, useProperties } from './properties';

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();
  const { ratioId } = useLocalSearchParams<{ ratioId: string }>();
  const ratioIdNum = ratioId ? parseInt(ratioId, 10) : 0;
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<number | null>(null);
  const { properties, setProperties, loadProperties } = useProperties();
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<CustomProperty | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  useFocusEffect(
    useCallback(() => {
      loadProperties();
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const ratioData = CalculateRatiosPropsArray.find((item) => item.id === ratioIdNum);

  useEffect(() => {
    if (ratioData) {
      const initialValues: { [key: string]: string } = {};
      Object.keys(ratioData.inputValues).forEach(key => {
        initialValues[key] = '';
      });
      setInputValues(initialValues);
      setResult(null);
    }
  }, [ratioData]);

  const handleInputChange = (key: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCalculate = () => {
    if (!ratioData) return;
    Keyboard.dismiss();

    const updatedRatioData = {
      ...ratioData,
      inputValues: { ...ratioData.inputValues }
    };

    Object.keys(inputValues).forEach(key => {
      const value = inputValues[key];
      updatedRatioData.inputValues[key] = value !== '' ? parseFloat(value) : 0;
    });

    try {
      const calculatedResult = calculateRatio(ratioIdNum, updatedRatioData);
      setResult(calculatedResult);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd(true);
      }, 300);
    } catch (error) {
      console.error("Calculation error:", error);
      setResult(null);
    }
  };

  const handleSaveResult = () => {
    setSaveModalVisible(true);
    setSaveSuccess(false);
  };

  const handleSelectProperty = async (property: CustomProperty) => {
    if (!result || !ratioData) return;

    const newField: DataField = {
      id: `${property.id}-${Date.now()}`,
      label: `${ratioData.title} Result`,
      value: result.toFixed(2),
      type: 'number',
    };

    const updatedProperties = properties.map(prop => {
      if (prop.id === property.id) {
        return {
          ...prop,
          dataFields: [...prop.dataFields, newField]
        };
      }
      return prop;
    });

    setProperties(updatedProperties);
    setSelectedProperty(property);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveModalVisible(false);
      setSelectedProperty(null);
      setSaveSuccess(false);
    }, 1500);
  };

  const formatResult = (value: number): string => {
    if (value === null || value === undefined || isNaN(value)) return "N/A";

    if ([1, 2, 7, 8, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20, 21].includes(ratioIdNum)) {
      return `${value.toFixed(2)}%`;
    } else if (ratioIdNum === 11) {
      return value.toFixed(2);
    } else if ([3, 4, 14].includes(ratioIdNum)) {
      return value.toFixed(2);
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatInputLabel = (label: string): string => {
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const getResultColor = (result: number): string => {
    if (isNaN(result)) return "#666";
    if (!ratioData) return "#666";

    switch (ratioIdNum) {
      case 1: return result >= 6 ? "#30D158" : result >= 4 ? "#FF9F0A" : "#FF3B30";
      case 2: return result >= 4 ? "#30D158" : result >= 2 ? "#FF9F0A" : "#FF3B30";
      case 7: return result <= 35 ? "#30D158" : result <= 50 ? "#FF9F0A" : "#FF3B30";
      case 8: return result >= 6 ? "#30D158" : result >= 4 ? "#FF9F0A" : "#FF3B30";
      case 9: return result >= 8 ? "#30D158" : result >= 5 ? "#FF9F0A" : "#FF3B30";
      case 10: return result <= 75 ? "#30D158" : result <= 85 ? "#FF9F0A" : "#FF3B30";
      case 11: return result >= 1.25 ? "#30D158" : result >= 1.0 ? "#FF9F0A" : "#FF3B30";
      default: return "#4F46E5";
    }
  };

  const getResultDescription = (result: number): string => {
    const color = getResultColor(result);
    if (color === "#30D158") return "Good";
    if (color === "#FF9F0A") return "Average";
    if (color === "#FF3B30") return "Needs improvement";
    return "Calculated";
  };

  const renderPropertyItem = ({ item }: { item: CustomProperty }) => (
    <Pressable
      style={({ pressed }) => [
        styles.propertyItem,
        pressed && styles.propertyItemPressed,
        selectedProperty?.id === item.id && styles.propertyItemSelected
      ]}
      onPress={() => handleSelectProperty(item)}
    >
      <View style={[styles.propertyDot, { backgroundColor: item.color }]} />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyName}>{item.name}</Text>
        <Text style={styles.propertyFields}>
          {item.dataFields.length} {item.dataFields.length === 1 ? 'field' : 'fields'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#333" />
    </Pressable>
  );

  if (!ratioData) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Not found</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Ratio not found</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style="light" />

        <LinearGradient
          colors={['#000000', '#0A0A0A']}
          style={StyleSheet.absoluteFill}
        />

        <BlurView intensity={80} tint="dark" style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>{ratioData.title}</Text>
          <View style={{ width: 40 }} />
        </BlurView>

        <KeyboardAwareScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 + (insets.bottom > 0 ? insets.bottom : 0) }
          ]}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraHeight={120}
          keyboardOpeningTime={0}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={[styles.iconContainer, { backgroundColor: `${ratioData.color}20` }]}>
                <Ionicons name={ratioData.icon} size={24} color={ratioData.color} />
              </View>
              <View style={styles.infoHeaderText}>
                <Text style={styles.infoTitle}>{ratioData.title}</Text>
                <View style={styles.importanceRow}>
                  <View style={[styles.importanceDot, {
                    backgroundColor: ratioData.importance === "Critical" ? "#FF3B30" :
                      ratioData.importance === "High" ? "#FF9F0A" : "#30D158"
                  }]} />
                  <Text style={styles.importanceText}>{ratioData.importance}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.description}>{ratioData.description}</Text>

            <View style={styles.formulaBox}>
              <Text style={styles.formulaLabel}>Formula</Text>
              <Text style={styles.formulaText}>{ratioData.formula}</Text>
            </View>
          </View>

          <View style={styles.inputsSection}>
            <Text style={styles.sectionTitle}>Inputs</Text>

            {Object.entries(ratioData.inputValues).map(([key]) => (
              <View key={key} style={styles.inputRow}>
                <Text style={styles.inputLabel}>{formatInputLabel(key)}</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={(ref) => { inputRefs.current[key] = ref; }}
                    style={styles.input}
                    value={inputValues[key] || ''}
                    onChangeText={(text) => handleInputChange(key, text)}
                    placeholder="0"
                    placeholderTextColor="#333"
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>
              </View>
            ))}

            <Pressable
              style={styles.calculateButton}
              onPress={handleCalculate}
            >
              <Text style={styles.calculateButtonText}>Calculate</Text>
            </Pressable>
          </View>

          {result !== null && (
            <Animated.View
              entering={FadeIn.duration(400)}
              style={styles.resultSection}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Result</Text>
                <Pressable
                  style={styles.saveResultButton}
                  onPress={handleSaveResult}
                >
                  <Ionicons name="bookmark-outline" size={16} color="#4F46E5" />
                  <Text style={styles.saveResultText}>Save</Text>
                </Pressable>
              </View>

              <View style={styles.resultValueRow}>
                <Text style={styles.resultValue}>{formatResult(result)}</Text>
                <View style={[styles.resultBadge, { backgroundColor: getResultColor(result) }]}>
                  <Text style={styles.resultBadgeText}>{getResultDescription(result)}</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </KeyboardAwareScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={saveModalVisible}
          onRequestClose={() => setSaveModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => !saveSuccess && setSaveModalVisible(false)}
            />
            <Animated.View
              entering={SlideInDown.duration(350)}
              exiting={SlideOutDown.duration(250)}
              style={styles.modalContent}
            >
              <View style={styles.modalSolid}>
                {saveSuccess ? (
                  <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                      <Ionicons name="checkmark-circle" size={48} color="#30D158" />
                    </View>
                    <Text style={styles.successTitle}>Saved!</Text>
                    <Text style={styles.successText}>
                      Result saved to {selectedProperty?.name}
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.modalHeader}>
                      <View>
                        <Text style={styles.modalTitle}>Save Result</Text>
                        <Text style={styles.modalSubtitle}>Select a property</Text>
                      </View>
                      <Pressable
                        onPress={() => setSaveModalVisible(false)}
                        style={styles.modalCloseButton}
                      >
                        <Ionicons name="close" size={20} color="#FFFFFF" />
                      </Pressable>
                    </View>

                    {result !== null && (
                      <View style={styles.modalPreview}>
                        <Text style={styles.modalPreviewLabel}>Result:</Text>
                        <Text style={styles.modalPreviewValue}>{formatResult(result)}</Text>
                      </View>
                    )}

                    {properties.length === 0 ? (
                      <View style={styles.emptyProperties}>
                        <Ionicons name="folder-outline" size={32} color="#333" />
                        <Text style={styles.emptyPropertiesTitle}>No properties</Text>
                        <Text style={styles.emptyPropertiesText}>
                          Create a property first
                        </Text>
                        <Pressable
                          style={styles.createButton}
                          onPress={() => {
                            setSaveModalVisible(false);
                            router.push('./properties');
                          }}
                        >
                          <Text style={styles.createButtonText}>Go to Properties</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <FlatList
                        key={refreshKey}
                        data={properties}
                        renderItem={renderPropertyItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.propertiesList}
                        showsVerticalScrollIndicator={false}
                      />
                    )}
                  </>
                )}
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 50,
    paddingBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  scrollView: {
    flex: 1,
    marginTop: 90,
  },
  scrollContent: {
    padding: 16,
  },

  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoHeaderText: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  importanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  importanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  importanceText: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 16,
  },
  formulaBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: 14,
  },
  formulaLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  formulaText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    lineHeight: 18,
  },

  inputsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 14,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'right',
  },

  calculateButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  resultSection: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultTitle: {
    fontSize: 13,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  saveResultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(79,70,229,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  saveResultText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  resultValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resultBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalSolid: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(79,70,229,0.1)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalPreviewLabel: {
    fontSize: 13,
    color: '#888',
  },
  modalPreviewValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F46E5',
  },

  propertiesList: {
    paddingTop: 8,
    gap: 8,
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  propertyItemPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform: [{ scale: 0.98 }],
  },
  propertyItemSelected: {
    borderColor: '#4F46E5',
    backgroundColor: 'rgba(79,70,229,0.1)',
  },
  propertyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  propertyFields: {
    fontSize: 11,
    color: '#666',
  },

  emptyProperties: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyPropertiesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyPropertiesText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  successContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },

  errorText: {
    fontSize: 14,
    color: '#666',
  },
});