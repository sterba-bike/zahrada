import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = {
  bg: '#F3FAF0',
  card: '#FFFFFF',
  primary: '#3FA34D',
  primaryDark: '#2C7A3A',
  primarySoft: '#E3F5E3',
  accent: '#F5A623',
  accentSoft: '#FFF3D6',
  text: '#1F2A1D',
  textMuted: '#5B6B57',
  border: '#DCEAD5',
  warning: '#B8860B',
  danger: '#B3261E',
};

export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const Wrapper = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Wrapper
          style={{ flex: 1 }}
          contentContainerStyle={scroll ? styles.scrollContent : undefined}
        >
          {children}
        </Wrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
    >
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function TextField({
  label,
  required,
  value,
  ...rest
}: {
  label: string;
  required?: boolean;
  value: string;
} & TextInputProps) {
  const filled = value.trim().length > 0;
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>
          {label}
          {required ? ' *' : ''}
        </Text>
        {required && filled && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <TextInput
        value={value}
        style={styles.input}
        placeholderTextColor="#8A9986"
        {...rest}
      />
    </View>
  );
}

export function VarietyTag({ variety }: { variety: string }) {
  return (
    <View style={styles.varietyTag}>
      <Text style={styles.varietyTagText}>{variety}</Text>
    </View>
  );
}

export function HelperNote({ children }: { children: React.ReactNode }) {
  return <Text style={styles.helperNote}>{children}</Text>;
}

export function EmptyState({
  text,
  buttonTitle,
  onPress,
}: {
  text: string;
  buttonTitle?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{text}</Text>
      {buttonTitle && onPress && <PrimaryButton title={buttonTitle} onPress={onPress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: 16, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  buttonDisabled: { backgroundColor: '#A9C2A6', shadowOpacity: 0 },
  buttonPressed: { opacity: 0.85 },
  primaryButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  secondaryButtonText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  fieldWrap: { marginBottom: 14 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  checkmark: { color: colors.primary, marginLeft: 8, fontWeight: '700' },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 14,
  },
  varietyTag: {
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  varietyTagText: {
    color: '#8A5A00',
    fontSize: 12,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  helperNote: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 14,
    lineHeight: 16,
  },
});
