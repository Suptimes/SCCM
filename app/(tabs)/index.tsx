import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Card, Button, Input } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';

type TimeEvent = {
  id: string;
  label: string;
  time: Date | null;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function TimeTracker() {
  const [events, setEvents] = useState<TimeEvent[]>([
    { id: 'crew-boarded', label: 'Crew Boarded', time: null, icon: 'people' },
    { id: 'clearance', label: 'Clearance', time: null, icon: 'checkmark-circle' },
    { id: 'first-pax', label: 'First Pax', time: null, icon: 'person-add' },
    { id: 'last-pax', label: 'Last Pax', time: null, icon: 'person' },
    { id: 'last-door', label: 'Last Door Closed', time: null, icon: 'lock-closed' },
  ]);

  const [manualTime, setManualTime] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleTrackTime = (eventId: string) => {
    const currentTime = new Date();
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, time: currentTime } : event
      )
    );
  };

  const handleSetManualTime = () => {
    if (!selectedEventId || !manualTime) return;

    const [hours, minutes] = manualTime.split(':').map(Number);
    const now = new Date();
    const manualDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    setEvents((prev) =>
      prev.map((event) =>
        event.id === selectedEventId ? { ...event, time: manualDate } : event
      )
    );

    setManualTime('');
    setSelectedEventId(null);
  };

  const handleClearTime = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, time: null } : event
      )
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Times',
      'Are you sure you want to clear all tracked times? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setEvents((prev) =>
              prev.map((event) => ({ ...event, time: null }))
            );
          },
        },
      ]
    );
  };

  const handleEditClick = (eventId: string) => {
    if (selectedEventId === eventId) {
      // Close if clicking again
      setSelectedEventId(null);
      setManualTime('');
    } else {
      // Open for editing
      setSelectedEventId(eventId);
      setManualTime('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <Container safeArea edges={['top', 'bottom']} padding="lg">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Flight Time Tracker</Text>
          <Text style={styles.subtitle}>Tap to track or set manually</Text>
        </View>

        <View style={styles.eventsContainer}>
          {events.map((event) => (
            <View key={event.id}>
              <Card variant="elevated" style={styles.eventCard}>
                <TouchableOpacity
                  onPress={() => handleTrackTime(event.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.eventContent}>
                    <View style={styles.eventIcon}>
                      <Ionicons name={event.icon} size={24} color={colors.secondary} />
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventLabel}>{event.label}</Text>
                      {event.time ? (
                        <Text style={styles.eventTime}>{formatTime(event.time)}</Text>
                      ) : (
                        <Text style={styles.eventPlaceholder}>Not tracked yet</Text>
                      )}
                    </View>
                    <View style={styles.eventActions}>
                      {event.time && (
                        <TouchableOpacity
                          onPress={() => handleClearTime(event.id)}
                          style={styles.clearButton}
                        >
                          <Ionicons name="close-circle" size={20} color={colors.error} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => handleEditClick(event.id)}
                        style={styles.editButton}
                      >
                        <Ionicons name="create" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>

              {selectedEventId === event.id && (
                <Card variant="elevated" style={styles.manualCard}>
                  <Card.Content>
                    <Text style={styles.manualTitle}>Set Manual Time</Text>
                    <Text style={styles.manualSubtitle}>
                      for {events.find((e) => e.id === selectedEventId)?.label}
                    </Text>
                    <Input
                      value={manualTime}
                      onChangeText={setManualTime}
                      placeholder="HH:MM (24-hour format)"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numbers-and-punctuation"
                      style={styles.manualInput}
                    />
                    <View style={styles.manualActions}>
                      <Button
                        variant="ghost"
                        onPress={() => {
                          setSelectedEventId(null);
                          setManualTime('');
                        }}
                        style={styles.cancelButton}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onPress={handleSetManualTime}
                        disabled={!manualTime}
                        style={styles.setTimeButton}
                      >
                        Set Time
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              )}
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            variant="secondary"
            onPress={handleClearAll}
            leftIcon={<Ionicons name="refresh" size={18} color={colors.text} />}
            style={styles.clearAllButton}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </Button>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  eventsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  eventCard: {
    backgroundColor: colors.backgroundSecondary,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventTime: {
    ...typography.h3,
    color: colors.secondary,
  },
  eventPlaceholder: {
    ...typography.body,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  eventActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  editButton: {
    padding: spacing.xs,
  },
  manualCard: {
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.lg,
  },
  manualTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  manualSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  manualInput: {
    marginBottom: spacing.md,
    color: colors.text,
  },
  manualActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    flex: 0,
  },
  setTimeButton: {
    flex: 0,
    minWidth: 100,
  },
  actions: {
    paddingVertical: spacing.lg,
  },
  clearAllButton: {
    width: '100%',
  },
  clearAllText: {
    ...typography.body,
    color: colors.text,
  },
});
