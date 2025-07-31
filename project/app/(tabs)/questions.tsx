import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Picker,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameStorage } from '@/utils/gameStorage';
import { Plus, CreditCard as Edit, Trash2, Check, X } from 'lucide-react-native';

export default function QuestionsScreen() {
  const [questions, setQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  
  // Form states
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState('ثقافة عامة');
  const [newAnswers, setNewAnswers] = useState(Array(8).fill().map(() => ({ text: '', points: 0 })));

  const categories = [
    'الكل', 'ثقافة عامة', 'رياضة', 'أفلام ومسلسلات', 'طعام وشراب', 
    'أماكن ومدن', 'أشياء في المنزل', 'حيوانات', 'تكنولوجيا', 
    'شخصيات مشهورة', 'عادات وتقاليد', 'تعليم', 'ترفيه', 
    'تاريخ', 'جغرافيا', 'وظائف ومهن'
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const allQuestions = await GameStorage.getQuestionsByCategory(
      selectedCategory === 'الكل' ? null : selectedCategory
    );
    setQuestions(allQuestions);
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory]);

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال نص السؤال');
      return;
    }

    const validAnswers = newAnswers.filter(answer => answer.text.trim() !== '');
    if (validAnswers.length < 4) {
      Alert.alert('خطأ', 'يجب إدخال 4 إجابات على الأقل');
      return;
    }

    const questionData = {
      question: newQuestion,
      category: newCategory,
      answers: newAnswers.map(answer => ({
        text: answer.text || 'إجابة فارغة',
        points: parseInt(answer.points) || 0
      }))
    };

    await GameStorage.addQuestion(questionData);
    Alert.alert('نجح', 'تم إضافة السؤال بنجاح');
    
    // Reset form
    setNewQuestion('');
    setNewAnswers(Array(8).fill().map(() => ({ text: '', points: 0 })));
    setShowAddModal(false);
    loadQuestions();
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setNewQuestion(question.question);
    setNewCategory(question.category);
    setNewAnswers(question.answers.map(answer => ({ ...answer })));
    setShowEditModal(true);
  };

  const handleUpdateQuestion = async () => {
    if (!newQuestion.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال نص السؤال');
      return;
    }

    const questionData = {
      ...editingQuestion,
      question: newQuestion,
      category: newCategory,
      answers: newAnswers.map(answer => ({
        text: answer.text || 'إجابة فارغة',
        points: parseInt(answer.points) || 0
      }))
    };

    await GameStorage.updateQuestion(questionData);
    Alert.alert('نجح', 'تم تحديث السؤال بنجاح');
    
    setShowEditModal(false);
    setEditingQuestion(null);
    loadQuestions();
  };

  const handleDeleteQuestion = async (question) => {
    Alert.alert(
      'حذف السؤال',
      'هل تريد حذف هذا السؤال نهائياً؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: async () => {
            await GameStorage.deleteQuestion(question.id);
            Alert.alert('تم', 'تم حذف السؤال');
            loadQuestions();
          }
        }
      ]
    );
  };

  const toggleQuestionSelection = (question) => {
    const isSelected = selectedQuestions.find(q => q.id === question.id);
    if (isSelected) {
      setSelectedQuestions(selectedQuestions.filter(q => q.id !== question.id));
    } else {
      if (selectedQuestions.length < 5) {
        setSelectedQuestions([...selectedQuestions, question]);
      } else {
        Alert.alert('تنبيه', 'يمكن اختيار 5 أسئلة فقط للعبة');
      }
    }
  };

  const saveSelectedQuestions = async () => {
    if (selectedQuestions.length !== 5) {
      Alert.alert('خطأ', 'يجب اختيار 5 أسئلة بالضبط');
      return;
    }

    await GameStorage.setSelectedQuestions(selectedQuestions);
    Alert.alert('نجح', 'تم حفظ الأسئلة المختارة للعبة');
  };

  const renderQuestionItem = ({ item }) => {
    const isSelected = selectedQuestions.find(q => q.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.questionCard, isSelected && styles.selectedQuestionCard]}
        onPress={() => toggleQuestionSelection(item)}
      >
        <View style={styles.questionHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Check size={16} color="white" />
            </View>
          )}
        </View>
        
        <Text style={styles.questionItemText}>{item.question}</Text>
        
        <View style={styles.questionActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditQuestion(item)}
          >
            <Edit size={16} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteQuestion(item)}
          >
            <Trash2 size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAnswerInput = (answer, index) => (
    <View key={index} style={styles.answerInputContainer}>
      <Text style={styles.answerLabel}>الإجابة {index + 1}:</Text>
      <TextInput
        style={styles.answerTextInput}
        value={answer.text}
        onChangeText={(text) => {
          const updatedAnswers = [...newAnswers];
          updatedAnswers[index].text = text;
          setNewAnswers(updatedAnswers);
        }}
        placeholder={`إدخال الإجابة ${index + 1}`}
        textAlign="right"
      />
      <TextInput
        style={styles.pointsInput}
        value={answer.points.toString()}
        onChangeText={(points) => {
          const updatedAnswers = [...newAnswers];
          updatedAnswers[index].points = parseInt(points) || 0;
          setNewAnswers(updatedAnswers);
        }}
        placeholder="النقاط"
        keyboardType="numeric"
        textAlign="center"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#10b981', '#059669', '#047857']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>إدارة الأسئلة</Text>
          <Text style={styles.subtitle}>
            المجموع: {questions.length} | المختار: {selectedQuestions.length}/5
          </Text>
        </View>

        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>التصنيف:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryFilter,
                  selectedCategory === category && styles.activeCategoryFilter
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryFilterText,
                  selectedCategory === category && styles.activeCategoryFilterText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>إضافة سؤال جديد</Text>
          </TouchableOpacity>

          {selectedQuestions.length === 5 && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveSelectedQuestions}
            >
              <Check size={20} color="white" />
              <Text style={styles.saveButtonText}>حفظ الأسئلة المختارة</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Questions List */}
        <FlatList
          data={questions}
          renderItem={renderQuestionItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.questionsList}
          showsVerticalScrollIndicator={false}
        />

        {/* Add Question Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalContainer}>
            <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.modalGradient}>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalTitle}>إضافة سؤال جديد</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>السؤال:</Text>
                  <TextInput
                    style={styles.questionInput}
                    value={newQuestion}
                    onChangeText={setNewQuestion}
                    placeholder="أدخل نص السؤال"
                    multiline
                    textAlign="right"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>التصنيف:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newCategory}
                      onValueChange={setNewCategory}
                      style={styles.picker}
                    >
                      {categories.slice(1).map(category => (
                        <Picker.Item key={category} label={category} value={category} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <Text style={styles.answersTitle}>الإجابات:</Text>
                {newAnswers.map(renderAnswerInput)}

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleAddQuestion}>
                    <Text style={styles.confirmButtonText}>إضافة السؤال</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => setShowAddModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>

        {/* Edit Question Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalContainer}>
            <LinearGradient colors={['#7c3aed', '#8b5cf6']} style={styles.modalGradient}>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalTitle}>تعديل السؤال</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>السؤال:</Text>
                  <TextInput
                    style={styles.questionInput}
                    value={newQuestion}
                    onChangeText={setNewQuestion}
                    placeholder="أدخل نص السؤال"
                    multiline
                    textAlign="right"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>التصنيف:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newCategory}
                      onValueChange={setNewCategory}
                      style={styles.picker}
                    >
                      {categories.slice(1).map(category => (
                        <Picker.Item key={category} label={category} value={category} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <Text style={styles.answersTitle}>الإجابات:</Text>
                {newAnswers.map(renderAnswerInput)}

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleUpdateQuestion}>
                    <Text style={styles.confirmButtonText}>حفظ التغييرات</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </LinearGradient>
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
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbbf24',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'right',
  },
  categoryFilter: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeCategoryFilter: {
    backgroundColor: '#fbbf24',
  },
  categoryFilterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeCategoryFilterText: {
    color: '#1e40af',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#fbbf24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#1e40af',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  questionsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedQuestionCard: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedBadge: {
    backgroundColor: '#fbbf24',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: 10,
  },
  questionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#e0f2fe',
    padding: 8,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 6,
  },
  modalContainer: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbbf24',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'right',
  },
  questionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    textAlign: 'right',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
  },
  picker: {
    height: 50,
    color: '#1e40af',
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 15,
    textAlign: 'center',
  },
  answerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    width: 70,
    textAlign: 'right',
  },
  answerTextInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlign: 'right',
  },
  pointsInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    width: 60,
  },
  modalButtons: {
    marginTop: 30,
    gap: 10,
  },
  confirmButton: {
    backgroundColor: '#10b981',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});