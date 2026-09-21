import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './ui';

const WEEKDAY_LABELS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const MONTH_LABELS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// JS getDay() vrací 0 = neděle...6 = sobota, appka chce týden od pondělí
function mondayIndexOfFirstDay(year: number, month: number) {
  const jsDay = new Date(year, month, 1).getDay();
  return (jsDay + 6) % 7;
}

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatCzechDate(d: Date): string {
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function DateField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <Pressable style={styles.inputBox} onPress={() => setOpen(true)}>
        <Text style={styles.inputText}>{formatCzechDate(value)}</Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </Pressable>
      <DatePickerModal
        visible={open}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={(d) => {
          onChange(d);
          setOpen(false);
        }}
      />
    </View>
  );
}

function DatePickerModal({
  visible,
  value,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onSelect: (d: Date) => void;
}) {
  const [cursor, setCursor] = useState(new Date(value.getFullYear(), value.getMonth(), 1));

  useEffect(() => {
    if (visible) setCursor(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [visible, value]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const totalDays = daysInMonth(year, month);
  const leadingBlanks = mondayIndexOfFirstDay(year, month);
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => setCursor(new Date(year, month - 1, 1))} style={styles.navButton}>
              <Text style={styles.navText}>‹</Text>
            </Pressable>
            <Text style={styles.monthLabel}>
              {MONTH_LABELS[month]} {year}
            </Text>
            <Pressable onPress={() => setCursor(new Date(year, month + 1, 1))} style={styles.navButton}>
              <Text style={styles.navText}>›</Text>
            </Pressable>
          </View>
          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((w) => (
              <Text key={w} style={styles.weekdayText}>
                {w}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((day, idx) => {
              const selected = day != null && isSameDate(new Date(year, month, day), value);
              return (
                <View key={idx} style={styles.cell}>
                  {day != null && (
                    <Pressable
                      onPress={() => onSelect(new Date(year, month, day))}
                      style={[styles.dayButton, selected && styles.dayButtonSelected]}
                    >
                      <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
          <Pressable onPress={() => onSelect(new Date())} style={styles.todayLink}>
            <Text style={styles.todayLinkText}>Dnes</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  inputBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: { fontSize: 15, color: colors.text },
  calendarIcon: { fontSize: 16 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 18, width: '100%', maxWidth: 340 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navButton: { paddingHorizontal: 12, paddingVertical: 4 },
  navText: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  monthLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  weekdayRow: { flexDirection: 'row', marginBottom: 4 },
  weekdayText: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', justifyContent: 'center', paddingVertical: 3 },
  dayButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayButtonSelected: { backgroundColor: colors.primary },
  dayText: { fontSize: 14, color: colors.text },
  dayTextSelected: { color: 'white', fontWeight: '700' },
  todayLink: { alignSelf: 'center', marginTop: 10, paddingVertical: 6 },
  todayLinkText: { color: '#8A5A00', fontWeight: '700', fontSize: 13 },
});
