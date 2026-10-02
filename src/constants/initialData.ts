import { 
  Cub, 
  CubLevel, 
  EvaluationCriteria, 
  ConductCriteria, 
  Requirement, 
  Sextet 
} from '../types.ts';

export const INITIAL_CONDUCT: ConductCriteria = {
  uniform: 4,
  punctuality: 3,
  tasks: 5,
  prayer: 4,
  behavior: 5
};

export const INITIAL_EVALUATION: EvaluationCriteria = {
  religion: 3,
  discovery: 2,
  talents: 4,
  health: 3,
  family: 4,
  nation: 3,
  world: 2,
  scouting: 3,
  artistic: 4
};

export const ZERO_CONDUCT: ConductCriteria = {
  uniform: 0,
  punctuality: 0,
  tasks: 0,
  prayer: 0,
  behavior: 0
};

export const ZERO_EVALUATION: EvaluationCriteria = {
  religion: 0,
  discovery: 0,
  talents: 0,
  health: 0,
  family: 0,
  nation: 0,
  world: 0,
  scouting: 0,
  artistic: 0
};

export const MOBTADI_REQUIREMENTS: Requirement[] = [
  { id: 'cur1', text: 'أعرف التحية الكشفية والوعد والقانون', completed: false, category: 'mobtadi' },
  { id: 'cur2', text: 'أتقن 3 عقد كشفية أساسية (الأفقية، الوتدية، التوصيلة)', completed: false, category: 'mobtadi', isHome: true },
  { id: 'beh1', text: 'ألتزم بالزي الكشفي الكامل في كل اجتماع', completed: false, category: 'mobtadi' },
  { id: 'beh2', text: 'أساعد زميلي في السداسي خلال الألعاب', completed: false, category: 'mobtadi' },
  { id: 'pra1', text: 'عمل إعادة تدوير لشيء من مخلفات المنزل', completed: false, category: 'mobtadi', isHome: true },
  { id: 'pra2', text: 'زراعة نبتة صغيرة والاعتناء بها لمدة أسبوع', completed: false, category: 'mobtadi', isHome: true },
  { id: 'home1', text: 'ترتيب سريري وغرفتي كل صباح', completed: false, category: 'mobtadi', isHome: true },
  { id: 'home2', text: 'المساعدة في غسل الأواني بعد الغذاء', completed: false, category: 'mobtadi', isHome: true },
];

export const SEXTETS: Sextet[] = [
  { id: '1', name: 'سداسي الأسد', color: 'bg-orange-500', points: 120, motto: 'زئير الأقوياء', specialization: 'وكالة رياضية' },
  { id: '2', name: 'سداسي النمر', color: 'bg-yellow-500', points: 85, motto: 'سرعة البرق', specialization: 'وكالة مجهولة' },
  { id: '3', name: 'سداسي الذئب', color: 'bg-gray-500', points: 150, motto: 'وفاء الأوفياء', specialization: 'وكالة ثقافية' },
  { id: '4', name: 'سداسي الصقر', color: 'bg-blue-500', points: 95, motto: 'عين الحقيقة', specialization: 'وكالة علمية' },
];

export const INITIAL_CUBS: Cub[] = [];
