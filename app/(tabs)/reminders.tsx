import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Card, Button } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';

export default function Reminders() {
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [nextReminder, setNextReminder] = useState(30 * 60); // 30 minutes in seconds
  const [checkCount, setCheckCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const REMINDER_INTERVAL = 30 * 60; // 30 minutes in seconds

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1;
          const timeUntilNext = REMINDER_INTERVAL - (newTime % REMINDER_INTERVAL);
          setNextReminder(timeUntilNext);

          // Check if it's time for a reminder
          if (newTime % REMINDER_INTERVAL === 0 && newTime > 0) {
            triggerReminder();
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  const triggerReminder = () => {
    setCheckCount((prev) => prev + 1);
    
    // Show alert for web/development
    if (Platform.OS === 'web') {
      Alert.alert(
        '⏰ Cabin Check Reminder',
        'Time to perform your 30-minute cabin check!',
        [{ text: 'OK', onPress: () => console.log('Check acknowledged') }]
      );
    }
    
    // In production, would use expo-notifications for push notifications
    console.log('🔔 Reminder triggered at', new Date().toLocaleTimeString());
  };

  const handleToggle = (value: boolean) => {
    setIsActive(value);
    if (!value) {
      // Reset when stopping
      setTimeElapsed(0);
      setNextReminder(REMINDER_INTERVAL);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeElapsed(0);
    setNextReminder(REMINDER_INTERVAL);
    setCheckCount(0);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const getProgressPercentage = () => {
    const elapsed = timeElapsed % REMINDER_INTERVAL;
    return (elapsed / REMINDER_INTERVAL) * 100;
  };

  return (
    <Container safeArea edges={['top', 'bottom']} padding="lg">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>30-Minute Reminders</Text>
          <Text style={styles.subtitle}>Cabin check notification system</Text>
        </View>

        <Card variant="elevated" style={styles.mainCard}>
          <Card.Content>
            <View style={styles.toggleContainer}>
              <View>
                <Text style={styles.toggleLabel}>Reminders</Text>
                <Text style={styles.toggleSubtitle}>
                  {isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={handleToggle}
                trackColor={{
                  false: colors.backgroundTertiary,
                  true: colors.secondary,
                }}
                thumbColor={isActive ? colors.secondaryDark : colors.textTertiary}
              />
            </View>
          </Card.Content>
        </Card>

        {isActive && (
          <>
            <Card variant="elevated" style={styles.timerCard}>
              <Card.Content>
                <View style={styles.timerContainer}>
                  <Ionicons name="timer" size={48} color={colors.secondary} />
                  <View style={styles.timerInfo}>
                    <Text style={styles.timerLabel}>Next reminder in</Text>
                    <Text style={styles.timerValue}>{formatTime(nextReminder)}</Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${getProgressPercentage()}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(getProgressPercentage())}% elapsed
                  </Text>
                </View>
              </Card.Content>
            </Card>

            <View style={styles.statsGrid}>
              <Card variant="outline" style={styles.statCard}>
                <Card.Content>
                  <Ionicons name="time" size={32} color={colors.textSecondary} />
                  <Text style={styles.statValue}>{formatTime(timeElapsed)}</Text>
                  <Text style={styles.statLabel}>Total Time</Text>
                </Card.Content>
              </Card>

              <Card variant="outline" style={styles.statCard}>
                <Card.Content>
                  <Ionicons name="notifications" size={32} color={colors.textSecondary} />
                  <Text style={styles.statValue}>{checkCount}</Text>
                  <Text style={styles.statLabel}>Checks Done</Text>
                </Card.Content>
              </Card>
            </View>
          </>
        )}

        <View style={styles.infoCard}>
          <Card variant="outline">
            <Card.Content>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={24} color={colors.info} />
                <Text style={styles.infoTitle}>How it works</Text>
              </View>
              <Text style={styles.infoText}>
                • Toggle reminders on to start the timer{'\n'}
                • You'll be notified every 30 minutes{'\n'}
                • Track total time and number of checks{'\n'}
                • Use reset to clear all counters
              </Text>
            </Card.Content>
          </Card>
        </View>

        {isActive && (
          <View style={styles.actions}>
            <Button
              variant="secondary"
              onPress={handleReset}
              leftIcon={<Ionicons name="refresh" size={18} color={colors.text} />}
            >
              Reset All
            </Button>
          </View>
        )}
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
  mainCard: {
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  toggleSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  timerCard: {
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.lg,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timerInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  timerLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timerValue: {
    ...typography.h2,
    color: colors.secondary,
  },
  progressBarContainer: {
    gap: spacing.sm,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    paddingVertical: spacing.lg,
  },
});
