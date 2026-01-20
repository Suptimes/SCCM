import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Card, Button, Input } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/design';

type ShiftResult = {
  shift1Start: string;
  shift1End: string;
  handoverStart: string;
  handoverEnd: string;
  shift2Start: string;
  shift2End: string;
  shift1Duration: number;
  handoverDuration: number;
  shift2Duration: number;
};

export default function Shifts() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [handoverDuration, setHandoverDuration] = useState('30');
  const [result, setResult] = useState<ShiftResult | null>(null);

  const parseTime = (timeStr: string): Date | null => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateShifts = () => {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    const handoverMins = parseInt(handoverDuration) || 0;

    if (!start || !end) {
      return;
    }

    // Calculate total duration
    let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Handle overnight shifts
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    // Calculate split times
    const halfDuration = (totalMinutes - handoverMins) / 2;
    
    // Shift 1
    const shift1End = new Date(start.getTime() + halfDuration * 60 * 1000);
    
    // Handover
    const handoverStart = shift1End;
    const handoverEnd = new Date(handoverStart.getTime() + handoverMins * 60 * 1000);
    
    // Shift 2
    const shift2Start = handoverEnd;
    const shift2End = end;

    setResult({
      shift1Start: formatTime(start),
      shift1End: formatTime(shift1End),
      handoverStart: formatTime(handoverStart),
      handoverEnd: formatTime(handoverEnd),
      shift2Start: formatTime(shift2Start),
      shift2End: formatTime(shift2End),
      shift1Duration: halfDuration,
      handoverDuration: handoverMins,
      shift2Duration: halfDuration,
    });
  };

  const handleReset = () => {
    setStartTime('');
    setEndTime('');
    setHandoverDuration('30');
    setResult(null);
  };

  return (
    <Container safeArea edges={['top', 'bottom']} padding="lg">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Rest Shift Splitter</Text>
          <Text style={styles.subtitle}>Divide rest periods with handover time</Text>
        </View>

        <Card variant="elevated" style={styles.inputCard}>
          <Card.Content>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <Input
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM (e.g., 14:00)"
                keyboardType="numbers-and-punctuation"
                leftIcon={<Ionicons name="time" size={20} color={colors.textSecondary} />}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Time</Text>
              <Input
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM (e.g., 22:00)"
                keyboardType="numbers-and-punctuation"
                leftIcon={<Ionicons name="time" size={20} color={colors.textSecondary} />}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Handover Duration (minutes)</Text>
              <Input
                value={handoverDuration}
                onChangeText={setHandoverDuration}
                placeholder="30"
                keyboardType="number-pad"
                leftIcon={<Ionicons name="swap-horizontal" size={20} color={colors.textSecondary} />}
              />
            </View>

            <View style={styles.actions}>
              <Button
                variant="primary"
                onPress={calculateShifts}
                disabled={!startTime || !endTime}
                leftIcon={<Ionicons name="calculator" size={18} color={colors.background} />}
              >
                Calculate
              </Button>
            </View>
          </Card.Content>
        </Card>

        {result && (
          <>
            <Card variant="elevated" style={styles.resultCard}>
              <Card.Header>
                <View style={styles.resultHeader}>
                  <Ionicons name="moon" size={24} color={colors.secondary} />
                  <Text style={styles.resultTitle}>Shift 1</Text>
                </View>
              </Card.Header>
              <Card.Content>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Start:</Text>
                  <Text style={styles.timeValue}>{result.shift1Start}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>End:</Text>
                  <Text style={styles.timeValue}>{result.shift1End}</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.durationText}>
                  Duration: {formatDuration(result.shift1Duration)}
                </Text>
              </Card.Content>
            </Card>

            <Card variant="elevated" style={styles.handoverCard}>
              <Card.Header>
                <View style={styles.resultHeader}>
                  <Ionicons name="swap-horizontal" size={24} color={colors.warning} />
                  <Text style={styles.resultTitle}>Handover</Text>
                </View>
              </Card.Header>
              <Card.Content>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Start:</Text>
                  <Text style={styles.timeValue}>{result.handoverStart}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>End:</Text>
                  <Text style={styles.timeValue}>{result.handoverEnd}</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.durationText}>
                  Duration: {formatDuration(result.handoverDuration)}
                </Text>
              </Card.Content>
            </Card>

            <Card variant="elevated" style={styles.resultCard}>
              <Card.Header>
                <View style={styles.resultHeader}>
                  <Ionicons name="moon" size={24} color={colors.secondary} />
                  <Text style={styles.resultTitle}>Shift 2</Text>
                </View>
              </Card.Header>
              <Card.Content>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Start:</Text>
                  <Text style={styles.timeValue}>{result.shift2Start}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>End:</Text>
                  <Text style={styles.timeValue}>{result.shift2End}</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.durationText}>
                  Duration: {formatDuration(result.shift2Duration)}
                </Text>
              </Card.Content>
            </Card>

            <View style={styles.resetContainer}>
              <Button
                variant="secondary"
                onPress={handleReset}
                leftIcon={<Ionicons name="refresh" size={18} color={colors.text} />}
              >
                Reset
              </Button>
            </View>
          </>
        )}

        {!result && (
          <View style={styles.infoCard}>
            <Card variant="outline">
              <Card.Content>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={24} color={colors.info} />
                  <Text style={styles.infoTitle}>How to use</Text>
                </View>
                <Text style={styles.infoText}>
                  • Enter start and end times in 24-hour format{'\n'}
                  • Set handover duration in minutes{'\n'}
                  • Rest period is split equally into two shifts{'\n'}
                  • Handover time is placed between shifts{'\n'}
                  • Works with overnight shifts
                </Text>
              </Card.Content>
            </Card>
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
  inputCard: {
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  actions: {
    marginTop: spacing.md,
  },
  resultCard: {
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.md,
  },
  handoverCard: {
    backgroundColor: colors.backgroundSecondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    marginBottom: spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultTitle: {
    ...typography.h3,
    color: colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  timeValue: {
    ...typography.h3,
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  durationText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  resetContainer: {
    marginTop: spacing.lg,
  },
  infoCard: {
    marginTop: spacing.lg,
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
});
