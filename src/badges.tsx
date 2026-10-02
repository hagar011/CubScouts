import React from 'react';
import { 
  Baby, 
  Zap, 
  Trophy, 
  Moon, 
  Compass, 
  Heart, 
  Search, 
  Shirt, 
  Waves, 
  Clock, 
  Star, 
  Crown, 
  Anchor, 
  Bike, 
  Fish, 
  Footprints, 
  Users, 
  Cloud, 
  Plane, 
  Palette, 
  Hammer, 
  Book, 
  Feather, 
  Newspaper, 
  Mic, 
  Languages, 
  Landmark, 
  ChefHat, 
  Tent, 
  Binoculars, 
  Stethoscope, 
  LifeBuoy, 
  Droplets, 
  Activity, 
  Cpu, 
  Atom, 
  Telescope,
  PenTool,
  Brain,
  Shield,
  Grid,
  Battery,
  BookOpen,
  History,
  UserCheck,
  Map,
  Mic2,
  Signal,
  Eye,
  Flag,
  ShieldCheck,
  Home,
  HeartPulse,
  Video,
  Rocket,
  Ship,
  Navigation,
  Type,
  Layout,
  Theater,
  Music,
  Scissors,
  Smile,
  Construction,
  PaintBucket,
  Cog,
  Flame,
  LucideIcon
} from 'lucide-react';
import { Cub } from './types';

export type HobbyGroupName = 
  | 'cultural' 
  | 'environmental' 
  | 'outdoor' 
  | 'public_service' 
  | 'scientific' 
  | 'maritime' 
  | 'aviation' 
  | 'fine_arts' 
  | 'vocational' 
  | 'sports';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: 'curriculum' | 'conduct' | 'level' | 'points' | 'special' | 'hobby';
  hobbyGroup?: HobbyGroupName;
}

export const HOBBY_GROUPS: Record<HobbyGroupName, { name: string; icon: LucideIcon; color: string }> = {
  sports: { name: 'شارات الرياضة', icon: Trophy, color: 'from-blue-500 to-blue-700' },
  environmental: { name: 'الشارات البيئية', icon: Footprints, color: 'from-green-500 to-green-700' },
  cultural: { name: 'الشارات الثقافية', icon: BookOpen, color: 'from-amber-600 to-amber-800' },
  outdoor: { name: 'شارات حياة الخلاء', icon: Tent, color: 'from-orange-600 to-orange-800' },
  public_service: { name: 'شارات الخدمة العامة', icon: ShieldCheck, color: 'from-red-500 to-red-700' },
  scientific: { name: 'الشارات العلمية', icon: Cpu, color: 'from-purple-500 to-purple-700' },
  maritime: { name: 'شارات الفنون البحرية', icon: Ship, color: 'from-cyan-600 to-cyan-800' },
  aviation: { name: 'شارات الفنون الجوية', icon: Plane, color: 'from-sky-500 to-sky-700' },
  fine_arts: { name: 'شارات الفنون الجميلة', icon: Palette, color: 'from-pink-500 to-pink-700' },
  vocational: { name: 'شارات المهن', icon: Hammer, color: 'from-stone-500 to-stone-700' },
};

export const AVAILABLE_BADGES: Badge[] = [
  // Level Badges
  { id: 'badge_acceptance', name: 'شبل القبول', description: 'إتمام متطلبات مرحلة القبول بنجاح', icon: Baby, color: 'from-slate-400 to-slate-600', category: 'level' },
  { id: 'badge_beginner', name: 'شبل مبتدئ', description: 'إتمام جميع متطلبات الشبل المبتدئ', icon: Baby, color: 'from-blue-400 to-blue-600', category: 'level' },
  { id: 'badge_second', name: 'شبل ثاني', description: 'إتمام جميع متطلبات الشبل الثاني', icon: Zap, color: 'from-green-400 to-green-600', category: 'level' },
  { id: 'badge_first', name: 'شبل أول', description: 'الوصول لمرتبة الشبل الأول المتميزة', icon: Trophy, color: 'from-yellow-400 to-yellow-600', category: 'level' },

  // Curriculum Excellence
  { id: 'badge_religion', name: 'فخر الإيمان', description: 'الحصول على درجة كاملة في السلوك الديني', icon: Moon, color: 'from-emerald-500 to-emerald-700', category: 'curriculum' },
  { id: 'badge_scouting', name: 'نجم الكشافة', description: 'التميز في المهارات الكشفية والحبال', icon: Compass, color: 'from-amber-600 to-amber-800', category: 'curriculum' },
  { id: 'badge_health', name: 'بطل الصحة', description: 'التزام تام بالقواعد الصحية والبدنية', icon: Heart, color: 'from-red-400 to-red-600', category: 'curriculum' },
  { id: 'badge_discovery', name: 'المستكشف الصغير', description: 'شغف كبير في اكتشاف الطبيعة من حوله', icon: Search, color: 'from-cyan-500 to-cyan-700', category: 'curriculum' },

  // Conduct
  { id: 'badge_perfect_uniform', name: 'أناقة كشفية', description: 'التزام مثالي بالزي الكشفي والهندام', icon: Shirt, color: 'from-indigo-400 to-indigo-600', category: 'conduct' },
  { id: 'badge_prayer', name: 'المصلي المحافظ', description: 'الالتزام التام بجميع الصلوات في موعدها', icon: Waves, color: 'from-teal-400 to-teal-600', category: 'conduct' },
  { id: 'badge_punctuality', name: 'منضبط المواعيد', description: 'الحضور دائماً في الموعد المحدد دون تأخير', icon: Clock, color: 'from-slate-500 to-slate-700', category: 'conduct' },

  // Points
  { id: 'badge_point_500', name: 'جامع النقاط الذهبي', description: 'الوصول إلى 500 نقطة في المسيرة الكشفية', icon: Star, color: 'from-orange-400 to-orange-600', category: 'points' },
  { id: 'badge_point_1000', name: 'أسطورة النقاط', description: 'الوصول إلى 1000 نقطة فما فوق', icon: Crown, color: 'from-purple-500 to-purple-700', category: 'points' },

  // Special
  { id: 'badge_memory_master', name: 'قوة الملاحظة', description: 'التفوق في لعبة الذاكرة الكشفية', icon: Brain, color: 'from-blue-400 to-blue-600', category: 'special' },
  { id: 'badge_team_leader', name: 'القائد الصغير', description: 'التميز في التحديات الجماعية والمبادرة', icon: Crown, color: 'from-amber-400 to-amber-600', category: 'special' },
  { id: 'badge_perseverance', name: 'الشبل المثابر', description: 'الحصول على درجة 3 فما فوق في جميع مجالات المنهج', icon: Anchor, color: 'from-stone-400 to-stone-600', category: 'special' },
  { id: 'badge_game_master', name: 'عبقري الألغاز', description: 'الإجابة على جميع الأسئلة في تحدي المعرفة', icon: Zap, color: 'from-pink-400 to-pink-600', category: 'special' },

  // Hobby Badges
  // Sports
  { id: 'hobby_cyclist', name: 'راكب الدراجة', description: 'مهارات قيادة الدراجة والسلامة المرورية', icon: Bike, color: 'from-blue-400 to-blue-500', category: 'hobby', hobbyGroup: 'sports' },
  { id: 'hobby_swimmer', name: 'السباح', description: 'إجادة السباحة والتعامل مع الماء', icon: Waves, color: 'from-cyan-400 to-cyan-500', category: 'hobby', hobbyGroup: 'sports' },
  { id: 'hobby_fisherman', name: 'صياد السمك', description: 'مهارات الصيد والتعرف على أنواع الأسماك', icon: Fish, color: 'from-sky-500 to-sky-600', category: 'hobby', hobbyGroup: 'sports' },
  { id: 'hobby_knight', name: 'الفارس', description: 'مهارات الفروسية والعناية بالخيل', icon: Shield, color: 'from-amber-600 to-amber-700', category: 'hobby', hobbyGroup: 'sports' },
  { id: 'hobby_team_player', name: 'لاعب الفريق', description: 'الروح الجماعية والتميز في الرياضات الجماعية', icon: Users, color: 'from-indigo-400 to-indigo-500', category: 'hobby', hobbyGroup: 'sports' },
  { id: 'hobby_solo_athlete', name: 'اللاعب الفردي', description: 'التميز في الرياضات الفردية كالجري والجمباز', icon: Activity, color: 'from-rose-400 to-rose-500', category: 'hobby', hobbyGroup: 'sports' },
  { id: 'hobby_physically_fit', name: 'اللائق بدنياً', description: 'اللياقة البدنية العالية والالتزام بالتدريبات', icon: Activity, color: 'from-red-400 to-red-500', category: 'hobby', hobbyGroup: 'sports' },
  { id: 'hobby_chess_master', name: 'هاوي الشطرنج', description: 'إتقان استراتيجيات الشطرنج والذكاء الذهني', icon: Grid, color: 'from-slate-700 to-slate-800', category: 'hobby', hobbyGroup: 'sports' },
  
  // Environment
  { id: 'hobby_tree_friend', name: 'صديق الأشجار', description: 'معرفة أنواع الأشجار وكيفية العناية بها', icon: Footprints, color: 'from-green-500 to-green-600', category: 'hobby', hobbyGroup: 'environmental' },
  { id: 'hobby_nature_friend', name: 'صديق الطبيعة', description: 'الحفاظ على البيئة الطبيعية وحمايتها', icon: Search, color: 'from-emerald-500 to-emerald-600', category: 'hobby', hobbyGroup: 'environmental' },
  { id: 'hobby_energy_saver', name: 'المحافظ على الطاقة', description: 'ترشيد استهلاك الطاقة ونشر الوعي البيئي', icon: Battery, color: 'from-yellow-500 to-yellow-600', category: 'hobby', hobbyGroup: 'environmental' },
  { id: 'hobby_water_conserver', name: 'المحافظ على المياه', description: 'ترشيد استهلاك المياه ونشر الوعي', icon: Droplets, color: 'from-blue-300 to-blue-400', category: 'hobby', hobbyGroup: 'environmental' },
  { id: 'hobby_fish_breeder', name: 'مربى الأسماك', description: 'العناية بأسماك الزينة وتجهيز أحواضها', icon: Fish, color: 'from-cyan-300 to-cyan-400', category: 'hobby', hobbyGroup: 'environmental' },
  { id: 'hobby_animal_breeder', name: 'مربى الحيوانات', description: 'الرفق بالحيوان والعناية بالحيوانات الأليفة', icon: Heart, color: 'from-orange-300 to-orange-400', category: 'hobby', hobbyGroup: 'environmental' },
  { id: 'hobby_bird_breeder', name: 'مربى الطيور', description: 'العناية بالطيور وفهم أنواعها وطرق تربيتها', icon: Feather, color: 'from-sky-300 to-sky-400', category: 'hobby', hobbyGroup: 'environmental' },
  { id: 'hobby_farmer', name: 'المزارع', description: 'مهارات الزراعة البسيطة والاعتناء بالتربة', icon: Footprints, color: 'from-lime-600 to-lime-700', category: 'hobby', hobbyGroup: 'environmental' },
  
  // Literary & Cultural
  { id: 'hobby_literary_pro', name: 'الأديب', description: 'شغف القراءة والاطلاع على الأدب العربي والعالمي', icon: BookOpen, color: 'from-amber-800 to-amber-900', category: 'hobby', hobbyGroup: 'cultural' },
  { id: 'hobby_poet', name: 'الشاعر', description: 'تذوق الشعر وكتابة القصائد الوطنية والكشفية', icon: Feather, color: 'from-rose-400 to-rose-500', category: 'hobby', hobbyGroup: 'cultural' },
  { id: 'hobby_journalist', name: 'الصحفي', description: 'التميز في صياغة الأخبار والتقارير الكشفية', icon: Newspaper, color: 'from-slate-600 to-slate-700', category: 'hobby', hobbyGroup: 'cultural' },
  { id: 'hobby_quran_reader', name: 'قارئ القرآن', description: 'إجادة تجويد وترتيل القرآن الكريم', icon: Book, color: 'from-emerald-600 to-emerald-700', category: 'hobby', hobbyGroup: 'cultural' },
  { id: 'hobby_historian', name: 'المؤرخ', description: 'الاهتمام بالتاريخ وتوثيق الأحداث الهامة', icon: History, color: 'from-stone-600 to-stone-700', category: 'hobby', hobbyGroup: 'cultural' },
  { id: 'hobby_speaker', name: 'المتحدث', description: 'براعة الإلقاء والتحدث أمام الجمهور', icon: Mic, color: 'from-purple-400 to-purple-500', category: 'hobby', hobbyGroup: 'cultural' },
  { id: 'hobby_translator', name: 'المترجم', description: 'مهارات اللغات الأجنبية والترجمة الفورية', icon: Languages, color: 'from-blue-600 to-blue-700', category: 'hobby', hobbyGroup: 'cultural' },
  { id: 'hobby_reader', name: 'المطالع', description: 'دوام المطالعة والتردد على المكتبات', icon: BookOpen, color: 'from-teal-600 to-teal-700', category: 'hobby', hobbyGroup: 'cultural' },
  { id: 'hobby_collector', name: 'المقتني', description: 'هواية جمع الطوابع أو العملات أو الأوسمة', icon: Star, color: 'from-yellow-400 to-yellow-500', category: 'hobby', hobbyGroup: 'cultural' },
  { id: 'hobby_archaeologist', name: 'هاوي الآثار', description: 'الاهتمام بالمعالم الأثرية والمتاحف', icon: Landmark, color: 'from-orange-800 to-orange-900', category: 'hobby', hobbyGroup: 'cultural' },
  
  // Outdoor
  { id: 'hobby_traveler', name: 'الرحالة', description: 'القدرة على التخطيط للرحلات والسير لمسافات', icon: Footprints, color: 'from-amber-700 to-amber-800', category: 'hobby', hobbyGroup: 'outdoor' },
  { id: 'hobby_map_maker', name: 'رسام الخرائط', description: 'رسم الكروكي والخرائط البسيطة للمناطق', icon: Map, color: 'from-yellow-600 to-yellow-700', category: 'hobby', hobbyGroup: 'outdoor' },
  { id: 'hobby_chef', name: 'الطاهي', description: 'إجادة طهي بعض المأكولات في حياة الخلاء', icon: ChefHat, color: 'from-orange-400 to-orange-500', category: 'hobby', hobbyGroup: 'outdoor' },
  { id: 'hobby_storyteller', name: 'المسامر', description: 'إجادة فن الحكي والسمر الكشفي والترفيه', icon: Flame, color: 'from-red-600 to-red-700', category: 'hobby', hobbyGroup: 'outdoor' },
  { id: 'hobby_communicator', name: 'المخاطب', description: 'إتقان لغة الإشارة والسيمافور والمخابرة', icon: Mic2, color: 'from-blue-700 to-blue-800', category: 'hobby', hobbyGroup: 'outdoor' },
  { id: 'hobby_camper', name: 'المخيم', description: 'إتقان مهارات التخييم ونصب الخيام', icon: Tent, color: 'from-green-700 to-green-800', category: 'hobby', hobbyGroup: 'outdoor' },
  { id: 'hobby_pathfinder', name: 'مقتفى الأثر', description: 'التعرف على الآثار والدلالات في الطبيعة', icon: Binoculars, color: 'from-yellow-700 to-yellow-800', category: 'hobby', hobbyGroup: 'outdoor' },
  { id: 'hobby_observer_pro', name: 'الملاحظ', description: 'دقة الملاحظة والتعرف على التفاصيل الصغيرة', icon: Eye, color: 'from-indigo-300 to-indigo-400', category: 'hobby', hobbyGroup: 'outdoor' },
  
  // Public Service
  { id: 'hobby_guide', name: 'الدليل', description: 'معرفة المسالك والطرق وإرشاد الآخرين', icon: Compass, color: 'from-slate-400 to-slate-500', category: 'hobby', hobbyGroup: 'public_service' },
  { id: 'hobby_civil_defense', name: 'صديق الدفاع المدني', description: 'الوعي بقواعد الإطفاء والسلامة العامة', icon: ShieldCheck, color: 'from-red-600 to-red-700', category: 'hobby', hobbyGroup: 'public_service' },
  { id: 'hobby_community_friend', name: 'صديق المجتمع', description: 'المشاركة في الأعمال التطوعية وخدمة الحي', icon: Users, color: 'from-blue-500 to-blue-600', category: 'hobby', hobbyGroup: 'public_service' },
  { id: 'hobby_traffic_friend', name: 'صديق المرور', description: 'معرفة إشارات المرور وقواعد عبور الطريق', icon: Flag, color: 'from-orange-500 to-orange-600', category: 'hobby', hobbyGroup: 'public_service' },
  { id: 'hobby_medic', name: 'المسعف', description: 'معرفة الإسعافات الأولية الأساسية', icon: Stethoscope, color: 'from-red-500 to-red-600', category: 'hobby', hobbyGroup: 'public_service' },
  { id: 'hobby_homecomer', name: 'هاوي الأعمال المنزلية', description: 'المساعدة في تدبير المنزل والصيانة البسيطة', icon: Home, color: 'from-amber-300 to-amber-400', category: 'hobby', hobbyGroup: 'public_service' },
  { id: 'hobby_pr', name: 'هاوي العلاقات العامة', description: 'اللباقة والقدرة على بناء الروابط الاجتماعية', icon: UserCheck, color: 'from-sky-400 to-sky-500', category: 'hobby', hobbyGroup: 'public_service' },
  { id: 'hobby_rescuer', name: 'المنقذ', description: 'الوعي بقواعد السلامة والإنقاذ', icon: LifeBuoy, color: 'from-orange-500 to-orange-600', category: 'hobby', hobbyGroup: 'public_service' },
  { id: 'hobby_blood_donor', name: 'صديق بنك الدم', description: 'نشر ثقافة التبرع بالدم وفوائده الصحية', icon: HeartPulse, color: 'from-rose-600 to-rose-700', category: 'hobby', hobbyGroup: 'public_service' },
  { id: 'hobby_virus_fighter', name: 'مكافح الفيروسات', description: 'الوعي الصحي وكيفية الوقاية من الأوبئة', icon: Shield, color: 'from-lime-400 to-lime-500', category: 'hobby', hobbyGroup: 'public_service' },
  
  // Scientific
  { id: 'hobby_inventor', name: 'المخترع', description: 'التفكير الابتكاري وصنع أدوات مفيدة', icon: Cpu, color: 'from-yellow-400 to-yellow-500', category: 'hobby', hobbyGroup: 'scientific' },
  { id: 'hobby_wireless', name: 'هاوي اللاسلكي', description: 'فهم أساسيات الاتصال واللاسلكي والترميز', icon: Signal, color: 'from-blue-500 to-blue-600', category: 'hobby', hobbyGroup: 'scientific' },
  { id: 'hobby_filmmaker', name: 'هاوي إنتاج أفلام', description: 'مهارات التصوير السينمائي والمونتاج البسيط', icon: Video, color: 'from-slate-800 to-slate-900', category: 'hobby', hobbyGroup: 'scientific' },
  { id: 'hobby_space_hobbyist', name: 'هاوي علوم الفضاء', description: 'التعرف على الكواكب والنجوم وغزو الفضاء', icon: Rocket, color: 'from-indigo-900 to-purple-900', category: 'hobby', hobbyGroup: 'scientific' },
  { id: 'hobby_digital_native', name: 'هاوي الثقافة الرقمية', description: 'الوعي التقني والاستخدام الآمن للإنترنت', icon: Atom, color: 'from-indigo-600 to-indigo-700', category: 'hobby', hobbyGroup: 'scientific' },

  // Maritime
  { id: 'hobby_model_boats', name: 'هاوي النماذج البحرية', description: 'صناعة وفهم نماذج السفن والقوارب', icon: Ship, color: 'from-blue-800 to-blue-900', category: 'hobby', hobbyGroup: 'maritime' },
  { id: 'hobby_maritime_pro', name: 'هاوي المهن البحرية', description: 'التعرف على حياة البحارة والمهن المرتبطة', icon: Anchor, color: 'from-cyan-800 to-cyan-900', category: 'hobby', hobbyGroup: 'maritime' },
  { id: 'hobby_skier', name: 'المتزلق', description: 'مهارات التزلق على الماء والاتزان', icon: Waves, color: 'from-sky-300 to-sky-400', category: 'hobby', hobbyGroup: 'maritime' },
  { id: 'hobby_diver', name: 'الغواص', description: 'مهارات الغوص الأساسية والوعي بالبيئة البحرية', icon: Waves, color: 'from-blue-600 to-blue-700', category: 'hobby', hobbyGroup: 'maritime' },
  { id: 'hobby_rower', name: 'المجذف', description: 'مهارات التجديف والعمل الجماعي في القارب', icon: Navigation, color: 'from-blue-400 to-blue-500', category: 'hobby', hobbyGroup: 'maritime' },
  { id: 'hobby_navigator_pro', name: 'الملاح', description: 'استخدام البوصلة والنجوم في الملاحة البحرية', icon: Compass, color: 'from-blue-900 to-black', category: 'hobby', hobbyGroup: 'maritime' },

  // Aviation
  { id: 'hobby_meteorologist', name: 'الراصد الجوي', description: 'متابعة وفهم تقلبات الطقس والظواهر الجوية', icon: Cloud, color: 'from-blue-100 to-blue-200', category: 'hobby', hobbyGroup: 'aviation' },
  { id: 'hobby_aircraft_modeler', name: 'هاوي نماذج الطائرات', description: 'صيانة وفهم نماذج الطائرات المختلفة', icon: Plane, color: 'from-sky-400 to-sky-500', category: 'hobby', hobbyGroup: 'aviation' },
  
  // Fine Arts
  { id: 'hobby_calligrapher', name: 'الخطاط', description: 'إتقان فنون الخط العربي وتشكيل الحروف', icon: Type, color: 'from-amber-600 to-amber-700', category: 'hobby', hobbyGroup: 'fine_arts' },
  { id: 'hobby_artist', name: 'الرسام', description: 'التعبير عن النفس من خلال الرسم والألوان', icon: Palette, color: 'from-pink-500 to-pink-600', category: 'hobby', hobbyGroup: 'fine_arts' },
  { id: 'hobby_designer', name: 'المصمم', description: 'الابتكار في التصميم الجرافيكي أو الفني', icon: Layout, color: 'from-purple-600 to-purple-700', category: 'hobby', hobbyGroup: 'fine_arts' },
  { id: 'hobby_photographer', name: 'المصور', description: 'توثيق جمال الطبيعة والأنشطة الكشفية', icon: Binoculars, color: 'from-stone-600 to-stone-700', category: 'hobby', hobbyGroup: 'fine_arts' },
  { id: 'hobby_actor', name: 'الممثل', description: 'براعة التمثيل والتقمص المسرحي الهادف', icon: Theater, color: 'from-red-400 to-red-500', category: 'hobby', hobbyGroup: 'fine_arts' },
  { id: 'hobby_singer', name: 'المنشد', description: 'التميز في الأناشيد الكشفية والوطنية', icon: Music, color: 'from-sky-500 to-sky-600', category: 'hobby', hobbyGroup: 'fine_arts' },
  { id: 'hobby_musician', name: 'الموسيقي', description: 'العزف على آلة موسيقية والتذوق الفني', icon: Music, color: 'from-indigo-500 to-indigo-600', category: 'hobby', hobbyGroup: 'fine_arts' },
  { id: 'hobby_handicraft', name: 'هاوي الأشغال الفنية', description: 'صنع تحف وأدوات من خامات البيئة', icon: Scissors, color: 'from-orange-500 to-orange-600', category: 'hobby', hobbyGroup: 'fine_arts' },
  { id: 'hobby_puppeteer', name: 'صانع العرائس', description: 'صناعة وتحريك العرائس لسرد القصص', icon: Smile, color: 'from-pink-400 to-pink-500', category: 'hobby', hobbyGroup: 'fine_arts' },
  
  // Vocational
  { id: 'hobby_builder', name: 'البناء', description: 'فهم أساسيات التشييد والبناء البسيط', icon: Construction, color: 'from-slate-600 to-slate-700', category: 'hobby', hobbyGroup: 'vocational' },
  { id: 'hobby_weaver', name: 'الحائك', description: 'مهارات الحياكة والنسيج والأشغال اليدوية', icon: Scissors, color: 'from-rose-300 to-rose-400', category: 'hobby', hobbyGroup: 'vocational' },
  { id: 'hobby_painter', name: 'الدهان', description: 'مهارات طلاء الجدران والأخشاب وتنسيق الألوان', icon: PaintBucket, color: 'from-blue-400 to-blue-500', category: 'hobby', hobbyGroup: 'vocational' },
  { id: 'hobby_carpenter', name: 'النجار', description: 'صنع أدوات خشبية بسيطة ومفيدة', icon: Hammer, color: 'from-amber-800 to-amber-900', category: 'hobby', hobbyGroup: 'vocational' },
  { id: 'hobby_electrician', name: 'الكهربائي', description: 'فهم الدوائر الكهربائية البسيطة والسلامة', icon: Zap, color: 'from-yellow-500 to-yellow-600', category: 'hobby', hobbyGroup: 'vocational' },
  { id: 'hobby_mechanic', name: 'الميكانيكي', description: 'فهم ميكانيكا الآلات البسيطة والصيانة', icon: Cog, color: 'from-slate-500 to-slate-600', category: 'hobby', hobbyGroup: 'vocational' },
];

export function checkNewBadges(cub: Cub): string[] {
  const currentBadges = new Set(cub.badges);
  const newBadges: string[] = [];

  // 1. Check Level Badges (Practical tests completion)
  const completedCount = cub.requirements.filter(r => r.completed).length;
  const totalCount = cub.requirements.length;

  if (completedCount >= 3 && !currentBadges.has('badge_acceptance')) newBadges.push('badge_acceptance');
  if (completedCount >= 5 && !currentBadges.has('badge_beginner')) newBadges.push('badge_beginner');
  if (completedCount >= 7 && !currentBadges.has('badge_second')) newBadges.push('badge_second');
  if (completedCount === totalCount && totalCount > 0 && !currentBadges.has('badge_first')) newBadges.push('badge_first');

  // 2. Check Curriculum Excellence
  if (cub.evaluation.religion === 5 && !currentBadges.has('badge_religion')) newBadges.push('badge_religion');
  if (cub.evaluation.scouting === 5 && !currentBadges.has('badge_scouting')) newBadges.push('badge_scouting');
  if (cub.evaluation.health === 5 && !currentBadges.has('badge_health')) newBadges.push('badge_health');
  if (cub.evaluation.discovery === 5 && !currentBadges.has('badge_discovery')) newBadges.push('badge_discovery');

  // 3. Check Conduct
  if (cub.conduct.uniform === 5 && !currentBadges.has('badge_perfect_uniform')) newBadges.push('badge_perfect_uniform');
  if (cub.conduct.prayer === 5 && !currentBadges.has('badge_prayer')) newBadges.push('badge_prayer');
  if (cub.conduct.punctuality === 5 && !currentBadges.has('badge_punctuality')) newBadges.push('badge_punctuality');

  // 4. Check Points
  if (cub.points >= 500 && !currentBadges.has('badge_point_500')) newBadges.push('badge_point_500');
  if (cub.points >= 1000 && !currentBadges.has('badge_point_1000')) newBadges.push('badge_point_1000');

  // 5. Check Completion of all evaluation categories (e.g. all >= 3)
  const allCurriculumAboveAverage = Object.values(cub.evaluation || {}).every(v => v >= 3);
  if (allCurriculumAboveAverage && cub.evaluation && Object.keys(cub.evaluation).length > 0 && !currentBadges.has('badge_perseverance')) {
    newBadges.push('badge_perseverance');
  }

  return newBadges;
}