import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GameStorage } from '@/utils/gameStorage';
import { Play, Trophy, Users, Settings } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    await GameStorage.initializeQuestions();
    const questions = await GameStorage.getQuestionsByCategory();
    const selected = questions.slice(0, 5);
    setSelectedQuestions(selected);
  };

  const handleStartGame = () => {
    if (selectedQuestions.length < 5) {
      Alert.alert('تنبيه', 'يجب اختيار 5 أسئلة على الأقل للبدء');
      return;
    }
    setShowTeamSetup(true);
  };

  const handleTeamSetup = async () => {
    if (!team1Name.trim() || !team2Name.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال أسماء الفريقين');
      return;
    }

    await GameStorage.setTeamNames(team1Name, team2Name);
    await GameStorage.setSelectedQuestions(selectedQuestions);
    setShowTeamSetup(false);
    router.push('/(tabs)/game');
  };

  const handleQuestionSelection = () => {
    router.push('/(tabs)/questions');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e40af', '#3b82f6', '#60a5fa']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Trophy size={80} color="#fbbf24" />
            </View>
            <Text style={styles.title}>عائلتي تربح</Text>
            <Text style={styles.subtitle}>لعبة عائلية تفاعلية</Text>
          </View>

          {/* Main Menu Buttons */}
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuButton} onPress={handleStartGame}>
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                style={styles.buttonGradient}
              >
                <Play size={24} color="#1e40af" />
                <Text style={styles.buttonText}>ابدأ اللعبة</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton} onPress={handleQuestionSelection}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.buttonGradient}
              >
                <Settings size={24} color="white" />
                <Text style={[styles.buttonText, { color: 'white' }]}>إدارة الأسئلة</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => router.push('/(tabs)/admin')}
            >
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={styles.buttonGradient}
              >
                <Users size={24} color="white" />
                <Text style={[styles.buttonText, { color: 'white' }]}>واجهة الإدارة</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Game Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>معلومات اللعبة</Text>
            <Text style={styles.infoText}>• 5 جولات رئيسية</Text>
            <Text style={styles.infoText}>• جولة السرعة النهائية</Text>
            <Text style={styles.infoText}>• أكثر من 100 سؤال</Text>
            <Text style={styles.infoText}>• أسئلة مختارة: {selectedQuestions.length}</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Team Setup Modal */}
      <Modal
        visible={showTeamSetup}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTeamSetup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إعداد الفرق</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>اسم الفريق الأول:</Text>
              <TextInput
                style={styles.textInput}
                value={team1Name}
                onChangeText={setTeam1Name}
                placeholder="أدخل اسم الفريق الأول"
                textAlign="right"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>اسم الفريق الثاني:</Text>
              <TextInput
                style={styles.textInput}
                value={team2Name}
                onChangeText={setTeam2Name}
                placeholder="أدخل اسم الفريق الثاني"
                textAlign="right"
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleTeamSetup}>
                <Text style={styles.modalButtonText}>ابدأ اللعبة</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowTeamSetup(false)}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fbbf24',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#e5e7eb',
    textAlign: 'center',
  },
  menuContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  menuButton: {
    width: width * 0.8,
    height: 60,
    marginBottom: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginLeft: 10,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#e5e7eb',
    marginBottom: 5,
    textAlign: 'right',
    width: '100%',
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
    width: width * 0.9,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    textAlign: 'right',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});