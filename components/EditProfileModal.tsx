import "@/global.css";
import { useUser } from "@clerk/expo";
import * as ImagePicker from "expo-image-picker";
import clsx from "clsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { usePostHog } from "posthog-react-native";
import { colors } from "@/constants/theme";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const EditProfileModal = ({ visible, onClose }: EditProfileModalProps) => {
  const { user } = useUser();
  const posthog = usePostHog();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<
    string | null
  >(null);
  const [saving, setSaving] = useState(false);

  /* ── Sync form when modal opens ── */
  useEffect(() => {
    if (visible && user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setSelectedImageUri(null);
      setSelectedImageBase64(null);
    }
  }, [visible, user]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      firstName.trim() !== (user.firstName ?? "") ||
      lastName.trim() !== (user.lastName ?? "") ||
      selectedImageUri !== null
    );
  }, [user, firstName, lastName, selectedImageUri]);

  /* ── Pick image from library ── */
  const handlePickImage = useCallback(async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Allow access to your photo library to change your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImageUri(result.assets[0].uri);
      setSelectedImageBase64(result.assets[0].base64 ?? null);
    }
  }, []);

  /* ── Remove existing profile photo ── */
  const handleRemoveImage = useCallback(() => {
    if (!user) return;

    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove your profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            try {
              await user.setProfileImage({ file: null });
              posthog?.capture("profile_image_removed");
              onClose();
            } catch {
              Alert.alert("Error", "Failed to remove photo. Please try again.");
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  }, [user, posthog, onClose]);

  /* ── Save all changes ── */
  const handleSave = useCallback(async () => {
    if (!user || !hasChanges) return;
    setSaving(true);

    try {
      const nameChanged =
        firstName.trim() !== (user.firstName ?? "") ||
        lastName.trim() !== (user.lastName ?? "");

      if (nameChanged) {
        await user.update({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      }

      if (selectedImageBase64) {
        await user.setProfileImage({
          file: `data:image/jpeg;base64,${selectedImageBase64}`,
        });
      }

      posthog?.capture("profile_updated", {
        name_changed: nameChanged,
        image_changed: !!selectedImageBase64,
      });

      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      Alert.alert("Update Failed", message);
    } finally {
      setSaving(false);
    }
  }, [user, firstName, lastName, selectedImageBase64, hasChanges, posthog, onClose]);

  /* ── Determine which image to display ── */
  const displayImageUri = selectedImageUri ?? user?.imageUrl ?? null;
  const initials = (
    firstName?.[0] ||
    user?.emailAddresses[0]?.emailAddress?.[0] ||
    "U"
  ).toUpperCase();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable className="modal-overlay" onPress={onClose}>
          <Pressable
            className="modal-container"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="modal-header">
              <Text className="modal-title">Edit Profile</Text>
              <Pressable className="modal-close" onPress={onClose}>
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            {/* Body */}
            <ScrollView
              contentContainerClassName="modal-body"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── Avatar picker ── */}
              <View style={{ alignItems: "center", gap: 12 }}>
                <Pressable onPress={handlePickImage}>
                  <View style={{ position: "relative" }}>
                    {displayImageUri ? (
                      <Image
                        source={{ uri: displayImageUri }}
                        style={{
                          width: 96,
                          height: 96,
                          borderRadius: 48,
                        }}
                      />
                    ) : (
                      <View
                        className="settings-profile-avatar"
                        style={{ width: 96, height: 96 }}
                      >
                        <Text
                          style={{ fontSize: 32 }}
                          className="font-sans-bold text-background"
                        >
                          {initials}
                        </Text>
                      </View>
                    )}

                    {/* Camera badge */}
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.accent,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 3,
                        borderColor: colors.background,
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>📷</Text>
                    </View>
                  </View>
                </Pressable>

                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Tap to change photo
                </Text>

                {/* Remove photo option (only when user has an existing image and hasn't selected a new one) */}
                {user?.imageUrl && !selectedImageUri && (
                  <Pressable onPress={handleRemoveImage}>
                    <Text className="text-sm font-sans-semibold text-destructive">
                      Remove Photo
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* ── First Name ── */}
              <View className="auth-field">
                <Text className="auth-label">First Name</Text>
                <TextInput
                  className="auth-input outline-none"
                  placeholder="First name"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {/* ── Last Name ── */}
              <View className="auth-field">
                <Text className="auth-label">Last Name</Text>
                <TextInput
                  className="auth-input outline-none"
                  placeholder="Last name"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
              </View>

              {/* ── Email (read-only) ── */}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <View
                  className="auth-input"
                  style={{ opacity: 0.5 }}
                >
                  <Text className="text-base font-sans-medium text-primary">
                    {user?.emailAddresses[0]?.emailAddress ?? "—"}
                  </Text>
                </View>
                <Text className="auth-helper">
                  Email can be changed from your Clerk dashboard.
                </Text>
              </View>

              {/* ── Save button ── */}
              <Pressable
                onPress={handleSave}
                disabled={!hasChanges || saving}
                className={clsx(
                  "auth-button",
                  (!hasChanges || saving) && "auth-button-disabled",
                )}
              >
                {saving ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text className="auth-button-text">Save Changes</Text>
                )}
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditProfileModal;
