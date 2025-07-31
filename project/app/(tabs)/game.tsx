import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameStorage } from '@/utils/gameStorage';
import { ArrowRight, ArrowLeft, Trophy, Users } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [teamNames, setTeamNames] = useState({ team1: '', team2: '' });
  const [scores, setScores] = useState({ team1: 0, team2: 0 });
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [gamePhase, setGamePhase] = useState('main'); // 'main', 'speed', 'final'
  const [speedQuestions, setSpeedQuestions] = useState([]);
  const [speedAnswers, setSpeedAnswers] = useState({});
  const [currentSpeedQuestion, setCurrentSpeedQuestion] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    const questions = await GameStorage.getSelectedQuestions();
    const names = await GameStorage.getTeamNames();
    setSelectedQuestions(questions);
    setTeamNames(names);
    if (questions.length > 0) {
      setCurrentQuestion(questions[0]);
    }
    
    // Load speed round questions
    const allQuestions = await GameStorage.getQuestionsByCategory();
    const speedQs = allQuestions.slice(5, 10).map(q => ({
      question: q.question,
      answer: q.answers[0].text, // Use first answer as correct answer
      points: 20
    }));
    setSpeedQuestions(speedQs);
  };

  const revealAnswer = (index) => {
    if (revealedAnswers.includes(index)) return;
    
    const newRevealed = [...revealedAnswers, index];
    setRevealedAnswers(newRevealed);
    
    // Animate reveal
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const awardPoints = (team, points) => {
    const finalPoints = points * multiplier;
    setScores(prev => ({
      ...prev,
      [team]: prev[team] + finalPoints
    }));
    
    Alert.alert(
      'نقاط!',
      `${team === 'team1' ? teamNames.team1 : teamNames.team2} حصل على ${finalPoints} نقطة!`
    );
  };

  const nextRound = () => {
    if (currentRound < 5) {
      const nextRoundIndex = currentRound;
      setCurrentRound(currentRound + 1);
      setCurrentQuestion(selectedQuestions[nextRoundIndex]);
      setRevealedAnswers([]);
      setMultiplier(1);
    } else {
      setGamePhase('speed');
    }
  };

  const handleSpeedRound = () => {
    if (currentSpeedQuestion < speedQuestions.length) {
      // Show speed question interface
      return (
        <View style={styles.speedContainer}>
          <Text style={styles.speedTitle}>جولة السرعة النهائية</Text>
          <Text style={styles.speedQuestion}>
            السؤال {currentSpeedQuestion + 1}: {speedQuestions[currentSpeedQuestion].question}
          </Text>
          
          <View style={styles.speedButtonContainer}>
            <TouchableOpacity 
              style={styles.speedButton}
              onPress={() => {
                setCurrentSpeedQuestion(currentSpeedQuestion + 1);
                if (currentSpeedQuestion + 1 >= speedQuestions.length) {
                  setGamePhase('final');
                }
              }}
            >
              <Text style={styles.speedButtonText}>السؤال التالي</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  const calculateFinalWinner = () => {
    const team1Total = scores.team1 + (speedAnswers.team1 || 0);
    const team2Total = scores.team2 + (speedAnswers.team2 || 0);
    
    if (team1Total > team2Total) {
      return { winner: teamNames.team1, score: team1Total };
    } else if (team2Total > team1Total) {
      return { winner: teamNames.team2, score: team2Total };
    } else {
      return { winner: 'تعادل', score: team1Total };
    }
  };

  if (gamePhase === 'speed') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#7c3aed', '#8b5cf6', '#a855f7']} style={styles.gradient}>
          {handleSpeedRound()}
        </LinearGradient>
      </View>
    );
  }

  if (gamePhase === 'final') {
    const result = calculateFinalWinner();
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#059669', '#10b981', '#34d399']} style={styles.gradient}>
          <View style={styles.finalContainer}>
            <Trophy size={100} color="#fbbf24" />
            <Text style={styles.finalTitle}>النتيجة النهائية</Text>
            <Text style={styles.winnerText}>{result.winner}</Text>
            <Text style={styles.finalScore}>النقاط: {result.score}</Text>
            
            <TouchableOpacity 
              style={styles.restartButton}
              onPress={() => {
                setCurrentRound(1);
                setGamePhase('main');
                setScores({ team1: 0, team2: 0 });
                setRevealedAnswers([]);
                setCurrentSpeedQuestion(0);
                if (selectedQuestions.length > 0) {
                  setCurrentQuestion(selectedQuestions[0]);
                }
              }}
            >
              <Text style={styles.restartButtonText}>إعادة اللعب</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل اللعبة...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e40af', '#3b82f6', '#60a5fa']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.roundText}>الجولة {currentRound} من 5</Text>
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

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          {/* Answers Grid */}
          <Animated.View style={[styles.answersGrid, { opacity: fadeAnim }]}>
            {currentQuestion.answers.map((answer, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerCard,
                  revealedAnswers.includes(index) && styles.revealedCard
                ]}
                onPress={() => revealAnswer(index)}
              >
                <View style={styles.answerNumber}>
                  <Text style={styles.answerNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.answerContent}>
                  {revealedAnswers.includes(index) ? (
                    <>
                      <Text style={styles.answerText}>{answer.text}</Text>
                      <Text style={styles.pointsText}>{answer.points}</Text>
                    </>
                  ) : (
                    <Text style={styles.hiddenText}>اضغط للكشف</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <View style={styles.multiplierContainer}>
              <Text style={styles.multiplierLabel}>المضاعف:</Text>
              <TouchableOpacity
                style={[styles.multiplierButton, multiplier === 1 && styles.activeMultiplier]}
                onPress={() => setMultiplier(1)}
              >
                <Text style={styles.multiplierText}>×1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.multiplierButton, multiplier === 2 && styles.activeMultiplier]}
                onPress={() => setMultiplier(2)}
              >
                <Text style={styles.multiplierText}>×2</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.teamButtonsContainer}>
              <TouchableOpacity
                style={[styles.teamButton, styles.team1Button]}
                onPress={() => {
                  const totalPoints = revealedAnswers.reduce((sum, index) => 
                    sum + currentQuestion.answers[index].points, 0
                  );
                  awardPoints('team1', totalPoints);
                }}
              >
                <Users size={20} color="white" />
                <Text style={styles.teamButtonText}>{teamNames.team1}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.teamButton, styles.team2Button]}
                onPress={() => {
                  const totalPoints = revealedAnswers.reduce((sum, index) => 
                    sum + currentQuestion.answers[index].points, 0
                  );
                  awardPoints('team2', totalPoints);
                }}
              >
                <Users size={20} color="white" />
                <Text style={styles.teamButtonText}>{teamNames.team2}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.nextRoundButton} onPress={nextRound}>
              <Text style={styles.nextRoundText}>
                {currentRound < 5 ? 'الجولة التالية' : 'جولة السرعة'}
              </Text>
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  roundText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 15,
    textAlign: 'center',
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
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
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 28,
  },
  answersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  answerCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 10,
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  revealedCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: '#fbbf24',
  },
  answerNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  answerNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  answerContent: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  answerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  hiddenText: {
    fontSize: 12,
    color: '#d1d5db',
    textAlign: 'center',
  },
  controlsContainer: {
    marginTop: 20,
  },
  multiplierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  multiplierLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  multiplierButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  activeMultiplier: {
    backgroundColor: '#fbbf24',
  },
  multiplierText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  teamButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  teamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 120,
    justifyContent: 'center',
  },
  team1Button: {
    backgroundColor: '#dc2626',
  },
  team2Button: {
    backgroundColor: '#059669',
  },
  teamButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
    textAlign: 'center',
  },
  nextRoundButton: {
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  nextRoundText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  speedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  speedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbbf24',
    textAlign: 'center',
    marginBottom: 30,
  },
  speedQuestion: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
  },
  speedButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  speedButton: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  speedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
  },
  finalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fbbf24',
    textAlign: 'center',
    marginVertical: 20,
  },
  winnerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  finalScore: {
    fontSize: 24,
    color: '#fbbf24',
    textAlign: 'center',
    marginBottom: 40,
  },
  restartButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});