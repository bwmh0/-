import AsyncStorage from '@react-native-async-storage/async-storage';

interface Answer {
  text: string;
  points: number;
}

interface GameQuestion {
  id: number;
  question: string;
  category: string;
  answers: Answer[];
}

interface TeamNames {
  team1: string;
  team2: string;
}

const QUESTIONS_KEY = '@game_questions';
const SELECTED_QUESTIONS_KEY = '@selected_questions';
const TEAM_NAMES_KEY = '@team_names';

export class GameStorage {
  static async initializeQuestions(): Promise<void> {
    try {
      const existingQuestions = await AsyncStorage.getItem(QUESTIONS_KEY);
      if (!existingQuestions) {
        const defaultQuestions = this.getDefaultQuestions();
        await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(defaultQuestions));
      }
    } catch (error) {
      console.error('Error initializing questions:', error);
    }
  }

  static async getQuestionsByCategory(category?: string): Promise<GameQuestion[]> {
    try {
      const questionsData = await AsyncStorage.getItem(QUESTIONS_KEY);
      if (!questionsData) return [];
      
      const questions: GameQuestion[] = JSON.parse(questionsData);
      
      if (category) {
        return questions.filter(q => q.category === category);
      }
      
      return questions;
    } catch (error) {
      console.error('Error getting questions:', error);
      return [];
    }
  }

  static async addQuestion(questionData: Omit<GameQuestion, 'id'>): Promise<void> {
    try {
      const existingQuestions = await this.getQuestionsByCategory();
      const newQuestion: GameQuestion = {
        ...questionData,
        id: Date.now() + Math.random()
      };
      
      const updatedQuestions = [...existingQuestions, newQuestion];
      await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(updatedQuestions));
    } catch (error) {
      console.error('Error adding question:', error);
    }
  }

  static async updateQuestion(questionData: GameQuestion): Promise<void> {
    try {
      const existingQuestions = await this.getQuestionsByCategory();
      const updatedQuestions = existingQuestions.map(q => 
        q.id === questionData.id ? questionData : q
      );
      
      await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(updatedQuestions));
    } catch (error) {
      console.error('Error updating question:', error);
    }
  }

  static async deleteQuestion(questionId: number): Promise<void> {
    try {
      const existingQuestions = await this.getQuestionsByCategory();
      const updatedQuestions = existingQuestions.filter(q => q.id !== questionId);
      
      await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(updatedQuestions));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  }

  static async setSelectedQuestions(questions: GameQuestion[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SELECTED_QUESTIONS_KEY, JSON.stringify(questions));
    } catch (error) {
      console.error('Error setting selected questions:', error);
    }
  }

  static async getSelectedQuestions(): Promise<GameQuestion[]> {
    try {
      const questionsData = await AsyncStorage.getItem(SELECTED_QUESTIONS_KEY);
      if (!questionsData) {
        // Return first 5 questions if none selected
        const allQuestions = await this.getQuestionsByCategory();
        return allQuestions.slice(0, 5);
      }
      
      return JSON.parse(questionsData);
    } catch (error) {
      console.error('Error getting selected questions:', error);
      return [];
    }
  }

  static async setTeamNames(team1: string, team2: string): Promise<void> {
    try {
      const teamNames: TeamNames = { team1, team2 };
      await AsyncStorage.setItem(TEAM_NAMES_KEY, JSON.stringify(teamNames));
    } catch (error) {
      console.error('Error setting team names:', error);
    }
  }

  static async getTeamNames(): Promise<TeamNames> {
    try {
      const teamNamesData = await AsyncStorage.getItem(TEAM_NAMES_KEY);
      if (!teamNamesData) {
        return { team1: 'الفريق الأول', team2: 'الفريق الثاني' };
      }
      
      return JSON.parse(teamNamesData);
    } catch (error) {
      console.error('Error getting team names:', error);
      return { team1: 'الفريق الأول', team2: 'الفريق الثاني' };
    }
  }

  private static getDefaultQuestions(): GameQuestion[] {
    return [
      {
        id: 1,
        question: "أشياء تستخدمها في المطبخ",
        category: "أشياء في المنزل",
        answers: [
          { text: "سكين", points: 45 },
          { text: "ملعقة", points: 38 },
          { text: "طنجرة", points: 32 },
          { text: "كوب", points: 28 },
          { text: "صحن", points: 25 },
          { text: "فرن", points: 18 },
          { text: "خلاط", points: 12 },
          { text: "مقلاة", points: 8 }
        ]
      },
      {
        id: 2,
        question: "دول عربية مشهورة",
        category: "جغرافيا",
        answers: [
          { text: "السعودية", points: 42 },
          { text: "مصر", points: 38 },
          { text: "الإمارات", points: 35 },
          { text: "الأردن", points: 28 },
          { text: "المغرب", points: 22 },
          { text: "العراق", points: 18 },
          { text: "سوريا", points: 15 },
          { text: "لبنان", points: 12 }
        ]
      },
      {
        id: 3,
        question: "رياضات مشهورة",
        category: "رياضة",
        answers: [
          { text: "كرة القدم", points: 48 },
          { text: "كرة السلة", points: 35 },
          { text: "السباحة", points: 28 },
          { text: "التنس", points: 22 },
          { text: "كرة اليد", points: 18 },
          { text: "الجري", points: 15 },
          { text: "كرة الطائرة", points: 12 },
          { text: "الملاكمة", points: 8 }
        ]
      },
      {
        id: 4,
        question: "أطعمة شعبية في البلدان العربية",
        category: "طعام وشراب",
        answers: [
          { text: "الكبسة", points: 42 },
          { text: "المندي", points: 38 },
          { text: "المنسف", points: 32 },
          { text: "الكنافة", points: 28 },
          { text: "الفتوش", points: 25 },
          { text: "الحمص", points: 20 },
          { text: "الفلافل", points: 15 },
          { text: "البقلاوة", points: 10 }
        ]
      },
      {
        id: 5,
        question: "حيوانات أليفة",
        category: "حيوانات",
        answers: [
          { text: "القطة", points: 45 },
          { text: "الكلب", points: 40 },
          { text: "العصفور", points: 28 },
          { text: "السمك", points: 22 },
          { text: "الأرنب", points: 18 },
          { text: "الهامستر", points: 12 },
          { text: "السلحفاة", points: 8 },
          { text: "الببغاء", points: 5 }
        ]
      },
      {
        id: 6,
        question: "أفلام عربية مشهورة",
        category: "أفلام ومسلسلات",
        answers: [
          { text: "الرسالة", points: 40 },
          { text: "عمر المختار", points: 35 },
          { text: "وداعاً بونابرت", points: 30 },
          { text: "بحب السيما", points: 25 },
          { text: "المصير", points: 20 },
          { text: "هي فوضى", points: 15 },
          { text: "عاصل اسود", points: 10 },
          { text: "ولاد رزق", points: 8 }
        ]
      },
      {
        id: 7,
        question: "وسائل النقل",
        category: "ثقافة عامة",
        answers: [
          { text: "السيارة", points: 50 },
          { text: "الطائرة", points: 38 },
          { text: "الحافلة", points: 30 },
          { text: "القطار", points: 25 },
          { text: "الدراجة", points: 18 },
          { text: "الباخرة", points: 12 },
          { text: "الدراجة النارية", points: 8 },
          { text: "المترو", points: 5 }
        ]
      },
      {
        id: 8,
        question: "تطبيقات الهاتف المحمول",
        category: "تكنولوجيا",
        answers: [
          { text: "واتساب", points: 48 },
          { text: "انستغرام", points: 40 },
          { text: "فيسبوك", points: 35 },
          { text: "يوتيوب", points: 30 },
          { text: "تويتر", points: 22 },
          { text: "سناب شات", points: 15 },
          { text: "تيك توك", points: 12 },
          { text: "تليجرام", points: 8 }
        ]
      },
      {
        id: 9,
        question: "مهن وظائف مختلفة",
        category: "وظائف ومهن",
        answers: [
          { text: "طبيب", points: 45 },
          { text: "مدرس", points: 38 },
          { text: "مهندس", points: 32 },
          { text: "محامي", points: 28 },
          { text: "ممرض", points: 22 },
          { text: "شرطي", points: 18 },
          { text: "طباخ", points: 12 },
          { text: "سائق", points: 8 }
        ]
      },
      {
        id: 10,
        question: "مدن سياحية عربية",
        category: "أماكن ومدن",
        answers: [
          { text: "دبي", points: 42 },
          { text: "القاهرة", points: 38 },
          { text: "بيروت", points: 30 },
          { text: "الدوحة", points: 25 },
          { text: "مراكش", points: 20 },
          { text: "دمشق", points: 15 },
          { text: "تونس", points: 12 },
          { text: "الكويت", points: 8 }
        ]
      },
      {
        id: 11,
        question: "أنواع الموسيقى",
        category: "ترفيه",
        answers: [
          { text: "البوب", points: 40 },
          { text: "الكلاسيكية", points: 35 },
          { text: "الراب", points: 28 },
          { text: "الجاز", points: 22 },
          { text: "الروك", points: 18 },
          { text: "الطرب", points: 15 },
          { text: "الإلكترونية", points: 10 },
          { text: "الريغي", points: 5 }
        ]
      },
      {
        id: 12,
        question: "مناسبات اجتماعية",
        category: "عادات وتقاليد",
        answers: [
          { text: "الزواج", points: 45 },
          { text: "العيد", points: 38 },
          { text: "التخرج", points: 30 },
          { text: "عيد الميلاد", points: 25 },
          { text: "الخطوبة", points: 20 },
          { text: "رمضان", points: 15 },
          { text: "النجاح", points: 10 },
          { text: "التقاعد", points: 8 }
        ]
      },
      {
        id: 13,
        question: "مواد دراسية",
        category: "تعليم",
        answers: [
          { text: "الرياضيات", points: 40 },
          { text: "العربية", points: 35 },
          { text: "الإنجليزية", points: 30 },
          { text: "العلوم", points: 25 },
          { text: "التاريخ", points: 20 },
          { text: "الجغرافيا", points: 15 },
          { text: "الفيزياء", points: 12 },
          { text: "الكيمياء", points: 8 }
        ]
      },
      {
        id: 14,
        question: "شخصيات تاريخية عربية",
        category: "تاريخ",
        answers: [
          { text: "صلاح الدين", points: 42 },
          { text: "هارون الرشيد", points: 35 },
          { text: "عمر بن الخطاب", points: 30 },
          { text: "أبو بكر الصديق", points: 25 },
          { text: "خالد بن الوليد", points: 20 },
          { text: "عمرو بن العاص", points: 15 },
          { text: "المأمون", points: 10 },
          { text: "المتنبي", points: 8 }
        ]
      },
      {
        id: 15,
        question: "ألوان أساسية وثانوية",
        category: "ثقافة عامة",
        answers: [
          { text: "أحمر", points: 45 },
          { text: "أزرق", points: 40 },
          { text: "أصفر", points: 35 },
          { text: "أخضر", points: 28 },
          { text: "أسود", points: 22 },
          { text: "أبيض", points: 18 },
          { text: "برتقالي", points: 12 },
          { text: "بنفسجي", points: 8 }
        ]
      }
    ];
  }
}