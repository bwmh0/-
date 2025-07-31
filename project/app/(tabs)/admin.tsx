import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameStorage } from '@/utils/gameStorage';
import { Settings, Eye, EyeOff, Trophy, Users } from 'lucide-react-native';

export default function AdminScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [teamNames, setTeamNames] = useState({ team1: '', team2: '' });
  const [scores, setScores] = useState({ team1: 0, team2: 0 });
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [manualPoints, setManualPoints] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [multiplier, setMultiplier] = useState(1);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const questions = await GameStorage.getSelectedQuestions();
    const names = await GameStorage.getTeamNames();
    setTeamNames(names);
    if (questions.length > 0) {
      setCurrentQuestion(questions[0]);
    }
  };

  const toggleAnswerVisibility = (index) => {
    if (revealedAnswers.includes(index)) {
      setRevealedAnswers(revealedAnswers.filter(i => i !== index));
    } else {
      setRevealedAnswers([...revealedAnswers, index]);
    }
  };

  const revealAllAnswers = () => {
    if (currentQuestion) {
      const allIndexes = currentQuestion.answers.map((_, index) => index);
      setRevealedAnswers(allIndexes);
    }
  };

  const hideAllAnswers = () => {
    setRevealedAnswers([]);
  };

  const addManualPoints = () => {
    if (!selectedTeam || !manualPoints) {
      Alert.alert('خطأ', 'يرجى اختيار الفريق وإدخال النقاط');
      return;
    }

    const points = parseInt(manualPoints) * multiplier;
    setScores(prev => ({
      ...prev,
      [selectedTeam]: prev[selectedTeam] + points
    }));

    Alert.alert(
      'تم إضافة النقاط',
      `تم إضافة ${points} نقطة لفريق ${selectedTeam === 'team1' ? teamNames.team1 : teamNames.team2}`
    );

    setShowScoreModal(false);
    setManualPoints('');
    setSelectedTeam('');
  };

  const resetScores = () => {
    Alert.alert(
      'إعادة تعيين النقاط',
      'هل تريد إعادة تعيين نقاط جميع الفرق؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'نعم', 
          style: 'destructive',
          onPress: () => setScores({ team1: 0, team2: 0 })
        }
      ]
    );
  };

  const calculateRevealedPoints = () => {
    if (!currentQuestion) return 0;
    return revealedAnswers.reduce((sum, index) => 
      sum + currentQuestion.answers[index].points, 0
    );
  };

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#7c3aed', '#8b5cf6']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل واجهة الإدارة...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7c3aed', '#8b5cf6', '#a855f7']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Settings size={40} color="#fbbf24" />
            <Text style={styles.title}>واجهة الإدارة</Text>
          </View>

          {/* Current Scores */}
          <View style={styles.scoresSection}>
            <Text style={styles.sectionTitle}>النقاط الحالية</Text>
            <View style={styles.scoresContainer}>
              <View style={styles.teamScore}>
                <Text style={styles.teamName}>{teamNames.team1}</Text>
                <Text style={styles.score}>{scores.team1}</Text>
              </View>
              <View style={styles.teamScore}>
                <Text style={styles.teamName}>{teamNames.team2}</Text>
                <Text style={styles.score}>{scores.team2}</Text>
              </View>
            </View>
          </View>

          {/* Question Control */}
          <View style={styles.questionSection}>
            <Text style={styles.sectionTitle}>السؤال الحالي</Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
            </View>
          </View>

          {/* Answers Control */}
          <View style={styles.answersSection}>
            <Text style={styles.sectionTitle}>التحكم في الإجابات</Text>
            <View style={styles.answersControlButtons}>
              <TouchableOpacity style={styles.controlButton} onPress={revealAllAnswers}>
                <Eye size={20} color="white" />
                <Text style={styles.controlButtonText}>كشف الكل</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={hideAllAnswers}>
                <EyeOff size={20} color="white" />
                <Text style={styles.controlButtonText}>إخفاء الكل</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.answersGrid}>
              {currentQuestion.answers.map((answer, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.answerControlCard,
                    revealedAnswers.includes(index) && styles.revealedAnswerCard
                  ]}
                  onPress={() => toggleAnswerVisibility(index)}
                >
                  <View style={styles.answerNumber}>
                    <Text style={styles.answerNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.answerInfo}>
                    <Text style={styles.answerText}>{answer.text}</Text>
                    <Text style={styles.answerPoints}>{answer.points} نقطة</Text>
                  </View>
                  <View style={styles.visibilityIcon}>
                    {revealedAnswers.includes(index) ? (
                      <Eye size={20} color="#10b981" />
                    ) : (
                      <EyeOff size={20} color="#6b7280" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Points Summary */}
          <View style={styles.pointsSummary}>
            <Text style={styles.summaryText}>
              النقاط المكشوفة: {calculateRevealedPoints()}
            </Text>
            <Text style={styles.summaryText}>
              مع المضاعف (×{multiplier}): {calculateRevealedPoints() * multiplier}
            </Text>
          </View>

          {/* Multiplier Control */}
          <View style={styles.multiplierSection}>
            <Text style={styles.sectionTitle}>المضاعف</Text>
            <View style={styles.multiplierContainer}>
              {[1, 2].map(mult => (
                <TouchableOpacity
                  key={mult}
                  style={[
                    styles.multiplierButton,
                    multiplier === mult && styles.activeMultiplier
                  ]}
                  onPress={() => setMultiplier(mult)}
                >
                  <Text style={styles.multiplierText}>×{mult}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.scoreButton}
              onPress={() => setShowScoreModal(true)}
            >
              <Trophy size={20} color="white" />
              <Text style={styles.scoreButtonText}>إضافة نقاط يدوياً</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={resetScores}>
              <Text style={styles.resetButtonText}>إعادة تعيين النقاط</Text>
            </TouchableOpacity>
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>الإعدادات</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>تفعيل الأصوات</Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#6b7280', true: '#10b981' }}
                thumbColor={soundEnabled ? '#ffffff' : '#d1d5db'}
              />
            </View>
          </View>
        </ScrollView>

        {/* Manual Score Modal */}
        <Modal
          visible={showScoreModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowScoreModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>إضافة نقاط يدوياً</Text>
              
              <View style={styles.teamSelection}>
                <Text style={styles.inputLabel}>اختر الفريق:</Text>
                <View style={styles.teamButtons}>
                  <TouchableOpacity
                    style={[
                      styles.teamButton,
                      selectedTeam === 'team1' && styles.selectedTeamButton
                    ]}
                    onPress={() => setSelectedTeam('team1')}
                  >
                    <Text style={styles.teamButtonText}>{teamNames.team1}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.teamButton,
                      selectedTeam === 'team2' && styles.selectedTeamButton
                    ]}
                    onPress={() => setSelectedTeam('team2')}
                  >
                    <Text style={styles.teamButtonText}>{teamNames.team2}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>عدد النقاط:</Text>
                <TextInput
                  style={styles.textInput}
                  value={manualPoints}
                  onChangeText={setManualPoints}
                  placeholder="أدخل عدد النقاط"
                  keyboardType="numeric"
                  textAlign="center"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.addButton} onPress={addManualPoints}>
                  <Text style={styles.addButtonText}>إضافة النقاط</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setShowScoreModal(false)}
                >
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginTop: 10,
    textAlign: 'center',
  },
  scoresSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  teamScore: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 120,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  questionSection: {
    marginBottom: 25,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 15,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 26,
  },
  answersSection: {
    marginBottom: 25,
  },
  answersControlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  controlButton: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  answersGrid: {
    gap: 10,
  },
  answerControlCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  revealedAnswerCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
  },
  answerNumber: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  answerNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  answerInfo: {
    flex: 1,
  },
  answerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'right',
  },
  answerPoints: {
    fontSize: 14,
    color: '#fbbf24',
    textAlign: 'right',
  },
  visibilityIcon: {
    marginLeft: 10,
  },
  pointsSummary: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 5,
    textAlign: 'center',
  },
  multiplierSection: {
    marginBottom: 25,
  },
  multiplierContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  multiplierButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeMultiplier: {
    backgroundColor: '#fbbf24',
  },
  multiplierText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  controlsContainer: {
    marginBottom: 25,
  },
  scoreButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  scoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resetButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsSection: {
    marginBottom: 25,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 25,
    textAlign: 'center',
  },
  teamSelection: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center',
  },
  teamButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  teamButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 100,
  },
  selectedTeamButton: {
    backgroundColor: '#1e40af',
  },
  teamButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 25,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});