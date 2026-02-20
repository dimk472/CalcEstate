import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  SlideInDown,
  SlideInRight,
  SlideOutDown,
  SlideOutLeft
} from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STORAGE_KEY = "@calcestate_properties";

export interface CustomProperty {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  dataFields: DataField[];
}

export interface DataField {
  id: string;
  label: string;
  value: string;
  type: "text" | "number" | "date" | "boolean";
}

export const useProperties = () => {
  const [properties, setProperties] = useState<CustomProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        const loadedProperties = JSON.parse(jsonValue);
        setProperties(loadedProperties);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProperties = async (newProperties: CustomProperty[]) => {
    try {
      const jsonValue = JSON.stringify(newProperties);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error("Error saving properties:", error);
    }
  };

  const setAndSaveProperties = (
    newProperties:
      | CustomProperty[]
      | ((prev: CustomProperty[]) => CustomProperty[]),
  ) => {
    setProperties((prev) => {
      const updated =
        typeof newProperties === "function"
          ? newProperties(prev)
          : newProperties;
      saveProperties(updated);
      return updated;
    });
  };

  return {
    properties,
    setProperties: setAndSaveProperties,
    isLoading,
    loadProperties,
    saveProperties,
  };
};

const COLOR_PALETTE = [
  "#6366F1", "#EF4444", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"
];

export default function PropertiesScreen() {
  const insets = useSafeAreaInsets();
  const { properties, setProperties, loadProperties, isLoading } = useProperties();
  const [modalVisible, setModalVisible] = useState(false);
  const [dataModalVisible, setDataModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<CustomProperty | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const [newPropertyName, setNewPropertyName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [fieldType, setFieldType] = useState<DataField["type"]>("text");

  const resetPropertyForm = () => {
    setNewPropertyName("");
    setSelectedColor(COLOR_PALETTE[0]);
    setSelectedProperty(null);
    setIsEditMode(false);
  };

  const openCreateModal = () => {
    resetPropertyForm();
    setModalVisible(true);
  };

  const openEditModal = (property: CustomProperty) => {
    setSelectedProperty(property);
    setNewPropertyName(property.name);
    setSelectedColor(property.color);
    setIsEditMode(true);
    setModalVisible(true);
  };

  const openViewModal = (property: CustomProperty) => {
    router.push({
      pathname: "./viewProperty",
      params: { id: property.id }
    });
  };

  const saveProperty = () => {
    if (!newPropertyName.trim()) return;

    if (isEditMode && selectedProperty) {
      setProperties((prev) =>
        prev.map((prop) => {
          if (prop.id === selectedProperty.id) {
            return {
              ...prop,
              name: newPropertyName,
              color: selectedColor,
            };
          }
          return prop;
        }),
      );
    } else {
      const newProperty: CustomProperty = {
        id: Date.now().toString(),
        name: newPropertyName,
        color: selectedColor,
        createdAt: Date.now(),
        dataFields: [],
      };

      setProperties((prev) => [newProperty, ...prev]);
    }

    resetPropertyForm();
    setModalVisible(false);
  };

  const addDataField = () => {
    if (!selectedProperty || !fieldLabel.trim()) return;

    const newField: DataField = {
      id: `${selectedProperty.id}-${Date.now()}`,
      label: fieldLabel,
      value: fieldValue,
      type: fieldType,
    };

    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id === selectedProperty.id) {
          return {
            ...prop,
            dataFields: [...prop.dataFields, newField],
          };
        }
        return prop;
      }),
    );

    setFieldLabel("");
    setFieldValue("");
    setFieldType("text");
    setDataModalVisible(false);
  };

  const deleteProperty = (propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
  };

  const deleteDataField = (propertyId: string, fieldId: string) => {
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id === propertyId) {
          return {
            ...prop,
            dataFields: prop.dataFields.filter((f) => f.id !== fieldId),
          };
        }
        return prop;
      }),
    );
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return 'document-text-outline';
      case 'number': return 'calculator-outline';
      case 'date': return 'calendar-outline';
      case 'boolean': return 'checkbox-outline';
      default: return 'document-outline';
    }
  };

  const formatPreviewValue = (field: DataField) => {
    switch (field.type) {
      case 'date':
        return new Date(field.value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      case 'boolean':
        return field.value === 'true' ? 'Yes' : 'No';
      case 'number':
        return Number(field.value).toLocaleString();
      default:
        return field.value.length > 20 ? field.value.substring(0, 20) + '...' : field.value;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const renderPropertyCard = ({ item, index }: { item: CustomProperty; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 80).springify()}
      exiting={SlideOutLeft}
      style={styles.card}
    >
      <Pressable onPress={() => openViewModal(item)} style={styles.cardPressable}>
        <View style={styles.cardHeader}>
          <View style={[styles.colorBar, { backgroundColor: item.color }]} />
          <View style={styles.cardHeaderContent}>
            <View style={styles.titleSection}>
              <Text style={styles.propertyName}>{item.name}</Text>
              <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
            </View>

            <View style={styles.actionChips}>
              <TouchableOpacity
                onPress={() => openEditModal(item)}
                style={styles.actionChip}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="create-outline" size={16} color="#888" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteProperty(item.id)}
                style={styles.actionChip}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {item.dataFields.length > 0 ? (
          <View style={styles.chipsContainer}>
            {item.dataFields.slice(0, 3).map((field) => (
              <View key={field.id} style={[styles.chip, { backgroundColor: `${item.color}10` }]}>
                <Ionicons name={getFieldIcon(field.type)} size={12} color={item.color} />
                <Text style={[styles.chipLabel, { color: item.color }]}>{field.label}</Text>
                <Text style={styles.chipValue}>• {formatPreviewValue(field)}</Text>
              </View>
            ))}

            {item.dataFields.length > 3 && (
              <View style={styles.moreChip}>
                <Text style={styles.moreChipText}>+{item.dataFields.length - 3}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyFieldsPreview}>
            <Text style={styles.emptyFieldsPreviewText}>No fields yet</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.stat}>
            <Ionicons name="layers-outline" size={14} color="#666" />
            <Text style={styles.statText}>
              {item.dataFields.length} {item.dataFields.length === 1 ? 'field' : 'fields'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setSelectedProperty(item);
              setDataModalVisible(true);
            }}
            style={styles.addChip}
          >
            <Ionicons name="add" size={14} color="#4F46E5" />
            <Text style={styles.addChipText}>Add Field</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#000000', '#0A0A0A']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View entering={FadeIn} style={styles.loaderContainer}>
          <View style={styles.loaderPulse}>
            <Ionicons name="home-outline" size={40} color="#333" />
          </View>
          <Text style={styles.loadingText}>Loading properties...</Text>
        </Animated.View>
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

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Properties</Text>
          <TouchableOpacity onPress={openCreateModal} style={styles.createButton}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{properties.length}</Text>
            <Text style={styles.headerStatLabel}>Total</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>
              {properties.reduce((acc, p) => acc + p.dataFields.length, 0)}
            </Text>
            <Text style={styles.headerStatLabel}>Fields</Text>
          </View>
        </View>
      </View>

      {properties.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIllustration}>
            <Ionicons name="home-outline" size={48} color="#333" />
          </View>
          <Text style={styles.emptyTitle}>No Properties Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first property to start organizing your real estate data
          </Text>
          <TouchableOpacity onPress={openCreateModal} style={styles.emptyButton}>
            <LinearGradient
              colors={['#4F46E5', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Create Property</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={refreshKey}
          data={properties}
          renderItem={renderPropertyCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: 90 + (insets.bottom > 0 ? insets.bottom : 0) }
          ]}
          showsVerticalScrollIndicator={false}
          extraData={properties}
        />
      )}

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          resetPropertyForm();
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              resetPropertyForm();
              setModalVisible(false);
            }}
          />
          <Animated.View
            entering={SlideInDown.duration(350)}
            exiting={SlideOutDown.duration(250)}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditMode ? "Edit Property" : "New Property"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  resetPropertyForm();
                  setModalVisible(false);
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Beach House"
                  placeholderTextColor="#444"
                  value={newPropertyName}
                  onChangeText={setNewPropertyName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Color</Text>
                <View style={styles.colorGrid}>
                  {COLOR_PALETTE.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorSwatchSelected,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  resetPropertyForm();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveProperty}
              >
                <LinearGradient
                  colors={['#4F46E5', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveText}>
                    {isEditMode ? "Save" : "Create"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        animationType="none"
        transparent={true}
        visible={dataModalVisible}
        onRequestClose={() => {
          setDataModalVisible(false);
          setFieldLabel("");
          setFieldValue("");
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setDataModalVisible(false);
              setFieldLabel("");
              setFieldValue("");
            }}
          />
          <Animated.View
            entering={SlideInDown.duration(350)}
            exiting={SlideOutDown.duration(250)}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add Field to {selectedProperty?.name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setDataModalVisible(false);
                  setFieldLabel("");
                  setFieldValue("");
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Field Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Purchase Price"
                  placeholderTextColor="#444"
                  value={fieldLabel}
                  onChangeText={setFieldLabel}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Value</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter value"
                  placeholderTextColor="#444"
                  value={fieldValue}
                  onChangeText={setFieldValue}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <View style={styles.typeGrid}>
                  {(["text", "number", "date", "boolean"] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        fieldType === type && styles.typeChipSelected,
                      ]}
                      onPress={() => setFieldType(type)}
                    >
                      <Ionicons
                        name={
                          type === 'text' ? 'document-text-outline' :
                            type === 'number' ? 'calculator-outline' :
                              type === 'date' ? 'calendar-outline' : 'checkbox-outline'
                        }
                        size={14}
                        color={fieldType === type ? '#4F46E5' : '#666'}
                      />
                      <Text style={[
                        styles.typeChipText,
                        fieldType === type && styles.typeChipTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDataModalVisible(false);
                  setFieldLabel("");
                  setFieldValue("");
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addDataField}
              >
                <LinearGradient
                  colors={['#4F46E5', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveText}>Add Field</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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

  loaderContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loaderPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    padding: 16,
  },
  headerStat: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  list: {
    padding: 16,
    paddingTop: 0,
  },

  card: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#0C0C0C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  cardPressable: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  colorBar: {
    width: 4,
    height: 46,
    borderRadius: 2,
    marginRight: 12,
  },
  cardHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  actionChips: {
    flexDirection: 'row',
    gap: 8,
  },
  actionChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipValue: {
    fontSize: 12,
    color: '#888',
  },
  moreChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  moreChipText: {
    fontSize: 12,
    color: '#666',
  },
  emptyFieldsPreview: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  emptyFieldsPreviewText: {
    fontSize: 13,
    color: '#444',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79,70,229,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addChipText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: "#FFFFFF",
    transform: [{ scale: 1.1 }],
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  typeChipSelected: {
    backgroundColor: 'rgba(79,70,229,0.1)',
    borderColor: '#4F46E5',
  },
  typeChipText: {
    fontSize: 13,
    color: "#888",
    textTransform: "capitalize",
  },
  typeChipTextSelected: {
    color: "#4F46E5",
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
  saveButton: {
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});