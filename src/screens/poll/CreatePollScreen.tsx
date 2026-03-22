import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CandidateInput } from '../../components/CandidateInput';
import { CounterControl } from '../../components/CounterControl';
import { Button } from '../../components/Button';
import { usePollStore } from '../../stores/pollStore';
import { colors, spacing, fontSizes, fonts, limits } from '../../lib/constants';
import { PollStackParamList } from '../../navigation/PollStackNavigator';

type CreatePollNavProp = NativeStackNavigationProp<
  PollStackParamList,
  'CreatePoll'
>;

export function CreatePollScreen() {
  const navigation = useNavigation<CreatePollNavProp>();

  const {
    draftTitle,
    draftCandidates,
    draftMaxRankChoices,
    setDraftTitle,
    addDraftCandidate,
    removeDraftCandidate,
    updateDraftCandidate,
    setDraftMaxRankChoices,
    createPoll,
    supabasePollId,
    shareCode,
  } = usePollStore();

  const validCandidates = draftCandidates.filter((c) => c.trim() !== '');
  const canCreate = validCandidates.length >= limits.minCandidates;

  const handleCreate = async () => {
    if (!canCreate) {
      Alert.alert(
        'Missing Info',
        `Need at least ${limits.minCandidates} candidates.`
      );
      return;
    }
    await createPoll();

    // Get the latest store values after async createPoll
    const store = usePollStore.getState();
    if (store.supabasePollId && store.shareCode) {
      navigation.navigate('PollLobby', {
        pollId: store.supabasePollId,
        shareCode: store.shareCode,
        isCreator: true,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Poll Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Poll Title</Text>
          <TextInput
            style={styles.titleInput}
            value={draftTitle}
            onChangeText={setDraftTitle}
            placeholder="What are we voting on?"
            placeholderTextColor={colors.gray[400]}
          />
        </View>

        {/* Candidates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Candidates ({validCandidates.length})
          </Text>
          {draftCandidates.map((candidate, index) => (
            <CandidateInput
              key={index}
              value={candidate}
              index={index}
              onChangeText={(text) => updateDraftCandidate(index, text)}
              onRemove={() => removeDraftCandidate(index)}
              canRemove={draftCandidates.length > limits.minCandidates}
            />
          ))}
          <Button
            title="+ Add Candidate"
            variant="outline"
            onPress={() => addDraftCandidate('')}
            style={styles.addButton}
          />
        </View>

        {/* Rank Choices */}
        <View style={styles.section}>
          <CounterControl
            label="Choices to rank"
            value={draftMaxRankChoices}
            min={1}
            max={Math.max(validCandidates.length - 1, 1)}
            onIncrement={() =>
              setDraftMaxRankChoices(draftMaxRankChoices + 1)
            }
            onDecrement={() =>
              setDraftMaxRankChoices(draftMaxRankChoices - 1)
            }
          />
        </View>

        {/* Create Button */}
        <Button
          title="Start Voting"
          onPress={handleCreate}
          disabled={!canCreate}
          style={styles.createButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    fontFamily: fonts.heading,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[800],
    backgroundColor: colors.white,
  },
  addButton: {
    marginTop: spacing.sm,
  },
  createButton: {
    marginTop: spacing.lg,
  },
});
