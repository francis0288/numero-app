import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface InterpretationContent {
  title: string
  keywords: string[]
  overview: string
  strengths: string[]
  challenges: string[]
  lifeLesson: string
  compatibleNumbers: number[]
  careerSuggestions: string[]
  astrological: string
}

interface Entry {
  numberKey: string
  category: string
  en: InterpretationContent
  zh: InterpretationContent
  vi: InterpretationContent
}

const entries: Entry[] = [
  // ─── Core Numbers 1–9 ────────────────────────────────────────────────────────
  {
    numberKey: 'life_path_1',
    category: 'core',
    en: {
      title: 'The Independent Individual',
      keywords: ['leadership', 'independence', 'originality', 'ambition', 'courage'],
      overview:
        'Number 1 is the number of new beginnings, independence, and individuality. Natural-born leaders who forge their own path with inner drive and determination, often pioneering new ideas and ventures.',
      strengths: ['Natural leader', 'Highly motivated', 'Original thinker', 'Courageous', 'Self-reliant', 'Ambitious', 'Determined'],
      challenges: ['Stubbornness', 'Self-centredness', 'Impatience', 'Difficulty delegating', 'Can be domineering'],
      lifeLesson:
        'To develop independence and leadership while learning to consider the needs of others. To stand in your own power without overpowering those around you.',
      compatibleNumbers: [3, 5, 7],
      careerSuggestions: ['entrepreneur', 'CEO', 'inventor', 'pioneer', 'manager', 'director'],
      astrological: 'Aries and Leo',
    },
    zh: {
      title: '独立个体',
      keywords: ['领导力', '独立', '创新', '野心', '勇气'],
      overview:
        '数字1代表新的开始、独立与个性。天生的领袖，以内在驱动力和决心开辟自己的道路，常常引领新思想与新事业的诞生。',
      strengths: ['天生领袖', '高度自励', '独创思维', '勇敢无畏', '独立自主', '志存高远', '意志坚定'],
      challenges: ['固执己见', '以自我为中心', '缺乏耐心', '难以授权', '可能独断专行'],
      lifeLesson:
        '在培养独立精神与领导力的同时，学会顾及他人的需求。在彰显自身力量时，不要压制身边的人。',
      compatibleNumbers: [3, 5, 7],
      careerSuggestions: ['企业家', '首席执行官', '发明家', '开拓者', '管理者', '董事'],
      astrological: '白羊座与狮子座',
    },
    vi: {
      title: 'Cá Nhân Độc Lập',
      keywords: ['lãnh đạo', 'độc lập', 'sáng tạo', 'tham vọng', 'can đảm'],
      overview:
        'Số 1 là con số của những khởi đầu mới, sự độc lập và cá tính. Những nhà lãnh đạo bẩm sinh luôn tự khai phá con đường của mình với nội lực và quyết tâm, thường tiên phong trong những ý tưởng và dự án mới.',
      strengths: ['Lãnh đạo thiên bẩm', 'Có động lực cao', 'Tư duy độc lập', 'Can đảm', 'Tự lực', 'Đầy tham vọng', 'Kiên quyết'],
      challenges: ['Cứng đầu', 'Tự cao', 'Thiếu kiên nhẫn', 'Khó ủy quyền', 'Có thể độc đoán'],
      lifeLesson:
        'Phát triển sự độc lập và khả năng lãnh đạo trong khi học cách quan tâm đến nhu cầu của người khác. Đứng vững trong quyền lực của bạn mà không áp đảo những người xung quanh.',
      compatibleNumbers: [3, 5, 7],
      careerSuggestions: ['doanh nhân', 'giám đốc điều hành', 'nhà phát minh', 'người tiên phong', 'quản lý', 'giám đốc'],
      astrological: 'Bạch Dương và Sư Tử',
    },
  },
  {
    numberKey: 'life_path_2',
    category: 'core',
    en: {
      title: 'The Cooperative Peacemaker',
      keywords: ['cooperation', 'diplomacy', 'sensitivity', 'balance', 'harmony'],
      overview:
        'Number 2 is the number of cooperation, sensitivity, and diplomacy. Natural peacemakers who excel in partnerships, deeply intuitive and empathetic, attuned to the needs of others.',
      strengths: ['Diplomatic', 'Highly intuitive', 'Supportive', 'Patient', 'Detail-oriented', 'Cooperative', 'Empathetic'],
      challenges: ['Over-sensitivity', 'Indecisiveness', 'People-pleasing', 'Self-doubt', 'Difficulty with confrontation'],
      lifeLesson:
        'To develop confidence in your own worth and voice. Cooperation does not mean self-sacrifice — your needs matter as much as everyone else\'s.',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['counsellor', 'mediator', 'diplomat', 'nurse', 'teacher', 'social worker'],
      astrological: 'Cancer and Taurus',
    },
    zh: {
      title: '合作型和平使者',
      keywords: ['合作', '外交', '敏感', '平衡', '和谐'],
      overview:
        '数字2代表合作、敏感与外交手腕。天生的和平使者，擅长合伙关系，直觉敏锐、富有同理心，善于感知他人的需求。',
      strengths: ['善于外交', '直觉灵敏', '乐于支持', '富有耐心', '注重细节', '合作精神强', '感同身受'],
      challenges: ['过度敏感', '优柔寡断', '取悦他人', '自我怀疑', '难以面对冲突'],
      lifeLesson:
        '培养对自身价值与声音的自信。合作并不意味着自我牺牲——你的需求与他人同等重要。',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['心理咨询师', '调解员', '外交官', '护士', '教师', '社会工作者'],
      astrological: '巨蟹座与金牛座',
    },
    vi: {
      title: 'Người Kiến Tạo Hòa Bình',
      keywords: ['hợp tác', 'ngoại giao', 'nhạy cảm', 'cân bằng', 'hài hòa'],
      overview:
        'Số 2 là con số của sự hợp tác, nhạy cảm và ngoại giao. Những người kiến tạo hòa bình tự nhiên, xuất sắc trong quan hệ đối tác, có trực giác sâu sắc và sự đồng cảm, luôn thấu hiểu nhu cầu của người khác.',
      strengths: ['Khéo léo ngoại giao', 'Trực giác cao', 'Hỗ trợ tốt', 'Kiên nhẫn', 'Chú ý chi tiết', 'Tinh thần hợp tác', 'Đồng cảm'],
      challenges: ['Quá nhạy cảm', 'Thiếu quyết đoán', 'Chiều ý người khác', 'Tự nghi ngờ bản thân', 'Khó đối mặt xung đột'],
      lifeLesson:
        'Xây dựng sự tự tin vào giá trị và tiếng nói của bản thân. Hợp tác không có nghĩa là hy sinh — nhu cầu của bạn quan trọng không kém của người khác.',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['tư vấn viên', 'hòa giải viên', 'nhà ngoại giao', 'y tá', 'giáo viên', 'nhân viên xã hội'],
      astrological: 'Cự Giải và Kim Ngưu',
    },
  },
  {
    numberKey: 'life_path_3',
    category: 'core',
    en: {
      title: 'The Self-Expressive Creative',
      keywords: ['creativity', 'self-expression', 'joy', 'communication', 'optimism'],
      overview:
        'Number 3 is the number of creativity, self-expression, and communication. Naturally gifted communicators with vibrant joyful energy and an innate talent for inspiring others through words, art, or presence.',
      strengths: ['Creative', 'Charming', 'Optimistic', 'Expressive', 'Inspiring', 'Humorous', 'Sociable'],
      challenges: ['Scattered energy', 'Superficiality', 'Over-talking', 'Moodiness', 'Difficulty finishing projects'],
      lifeLesson:
        'To channel creative gifts with focus and discipline. Express your authentic self without seeking constant external validation.',
      compatibleNumbers: [1, 5, 9],
      careerSuggestions: ['writer', 'actor', 'artist', 'musician', 'designer', 'public speaker', 'teacher'],
      astrological: 'Gemini and Sagittarius',
    },
    zh: {
      title: '自我表达的创造者',
      keywords: ['创造力', '自我表达', '喜悦', '沟通', '乐观'],
      overview:
        '数字3代表创造力、自我表达与沟通。天生的沟通好手，充满活力与喜悦，具有通过语言、艺术或个人魅力激励他人的天赋。',
      strengths: ['富有创意', '魅力十足', '乐观开朗', '表达力强', '激励人心', '幽默风趣', '善于社交'],
      challenges: ['精力分散', '流于表面', '话太多', '情绪多变', '难以坚持完成项目'],
      lifeLesson:
        '以专注与纪律来引导创意天赋。真实地表达自我，无需不断寻求外界认可。',
      compatibleNumbers: [1, 5, 9],
      careerSuggestions: ['作家', '演员', '艺术家', '音乐家', '设计师', '公众演讲者', '教师'],
      astrological: '双子座与射手座',
    },
    vi: {
      title: 'Người Sáng Tạo Tự Biểu Đạt',
      keywords: ['sáng tạo', 'tự biểu đạt', 'niềm vui', 'giao tiếp', 'lạc quan'],
      overview:
        'Số 3 là con số của sự sáng tạo, tự biểu đạt và giao tiếp. Những người giao tiếp có năng khiếu thiên bẩm với năng lượng vui tươi rực rỡ và tài năng truyền cảm hứng cho người khác qua ngôn từ, nghệ thuật hay sự hiện diện.',
      strengths: ['Sáng tạo', 'Duyên dáng', 'Lạc quan', 'Biểu đạt tốt', 'Truyền cảm hứng', 'Hài hước', 'Hòa đồng'],
      challenges: ['Năng lượng phân tán', 'Hời hợt', 'Nói nhiều', 'Hay thay đổi tâm trạng', 'Khó hoàn thành dự án'],
      lifeLesson:
        'Hướng những tài năng sáng tạo bằng sự tập trung và kỷ luật. Thể hiện bản thân chân thực mà không cần tìm kiếm sự công nhận bên ngoài liên tục.',
      compatibleNumbers: [1, 5, 9],
      careerSuggestions: ['nhà văn', 'diễn viên', 'nghệ sĩ', 'nhạc sĩ', 'nhà thiết kế', 'diễn giả', 'giáo viên'],
      astrological: 'Song Tử và Nhân Mã',
    },
  },
  {
    numberKey: 'life_path_4',
    category: 'core',
    en: {
      title: 'The Dedicated Worker',
      keywords: ['stability', 'hard work', 'discipline', 'practicality', 'reliability'],
      overview:
        'Number 4 is the number of hard work, order, and solid foundations. The builders of the world — methodical, dependable, and thorough, thriving when working toward tangible goals.',
      strengths: ['Dependable', 'Hardworking', 'Methodical', 'Honest', 'Practical', 'Patient', 'Loyal'],
      challenges: ['Rigidity', 'Stubbornness', 'Resistance to change', 'Over-work', 'Can be too serious'],
      lifeLesson:
        'To build a secure foundation without becoming rigid. Structure serves life — it does not replace living.',
      compatibleNumbers: [2, 6, 8],
      careerSuggestions: ['engineer', 'accountant', 'builder', 'project manager', 'architect', 'lawyer'],
      astrological: 'Capricorn and Taurus',
    },
    zh: {
      title: '勤奋的工作者',
      keywords: ['稳定', '勤奋', '纪律', '务实', '可靠'],
      overview:
        '数字4代表勤奋、秩序与坚实的基础。世界的建造者——有条不紊、值得信赖、做事彻底，在为有形目标努力时最能发挥潜能。',
      strengths: ['值得信赖', '勤劳刻苦', '有条不紊', '诚实坦率', '务实求真', '耐心持久', '忠诚可靠'],
      challenges: ['思维僵化', '固执己见', '抗拒变化', '过度工作', '可能过于严肃'],
      lifeLesson:
        '在建立稳固基础的同时，避免变得墨守成规。结构服务于生活——而不是取代生活本身。',
      compatibleNumbers: [2, 6, 8],
      careerSuggestions: ['工程师', '会计师', '建筑商', '项目经理', '建筑师', '律师'],
      astrological: '摩羯座与金牛座',
    },
    vi: {
      title: 'Người Lao Động Tận Tụy',
      keywords: ['ổn định', 'chăm chỉ', 'kỷ luật', 'thực tế', 'đáng tin cậy'],
      overview:
        'Số 4 là con số của sự chăm chỉ, trật tự và nền tảng vững chắc. Những người xây dựng thế giới — có phương pháp, đáng tin cậy và kỹ lưỡng, phát triển mạnh khi làm việc hướng đến những mục tiêu hữu hình.',
      strengths: ['Đáng tin cậy', 'Chăm chỉ', 'Có phương pháp', 'Trung thực', 'Thực tế', 'Kiên nhẫn', 'Trung thành'],
      challenges: ['Cứng nhắc', 'Bướng bỉnh', 'Kháng cự thay đổi', 'Làm việc quá mức', 'Có thể quá nghiêm túc'],
      lifeLesson:
        'Xây dựng nền tảng vững chắc mà không trở nên cứng nhắc. Cấu trúc phục vụ cuộc sống — không thay thế nó.',
      compatibleNumbers: [2, 6, 8],
      careerSuggestions: ['kỹ sư', 'kế toán', 'nhà thầu xây dựng', 'quản lý dự án', 'kiến trúc sư', 'luật sư'],
      astrological: 'Ma Kết và Kim Ngưu',
    },
  },
  {
    numberKey: 'life_path_5',
    category: 'core',
    en: {
      title: 'The Freedom-Loving Adventurer',
      keywords: ['freedom', 'adventure', 'change', 'versatility', 'resourcefulness'],
      overview:
        'Number 5 is the number of freedom, change, and adventure. Dynamic, curious, and multi-talented — they need variety to thrive and bring progressive energy to everything they touch.',
      strengths: ['Adaptable', 'Resourceful', 'Adventurous', 'Charismatic', 'Quick-thinking', 'Progressive', 'Versatile'],
      challenges: ['Restlessness', 'Inconsistency', 'Irresponsibility', 'Overindulgence', 'Difficulty with commitment'],
      lifeLesson:
        'To embrace freedom responsibly. True freedom comes from inner discipline, not the avoidance of all constraints.',
      compatibleNumbers: [1, 3, 7],
      careerSuggestions: ['travel writer', 'journalist', 'salesperson', 'entrepreneur', 'performer', 'consultant'],
      astrological: 'Gemini and Sagittarius',
    },
    zh: {
      title: '热爱自由的冒险者',
      keywords: ['自由', '冒险', '变化', '多才多艺', '随机应变'],
      overview:
        '数字5代表自由、变化与冒险。充满活力、好奇心旺盛、多才多艺——他们需要多样性才能茁壮成长，为所接触的一切带来进步的能量。',
      strengths: ['适应力强', '随机应变', '勇于冒险', '魅力非凡', '思维敏捷', '富有进取心', '才能多样'],
      challenges: ['坐立不安', '缺乏持续性', '不负责任', '过度放纵', '难以承诺'],
      lifeLesson:
        '负责任地拥抱自由。真正的自由源于内心的纪律，而非逃避一切束缚。',
      compatibleNumbers: [1, 3, 7],
      careerSuggestions: ['旅游作家', '记者', '销售人员', '企业家', '表演者', '顾问'],
      astrological: '双子座与射手座',
    },
    vi: {
      title: 'Nhà Thám Hiểm Yêu Tự Do',
      keywords: ['tự do', 'phiêu lưu', 'thay đổi', 'đa năng', 'tháo vát'],
      overview:
        'Số 5 là con số của tự do, thay đổi và phiêu lưu. Năng động, tò mò và đa tài — họ cần sự đa dạng để phát triển và mang năng lượng tiến bộ đến mọi thứ mình chạm vào.',
      strengths: ['Thích nghi tốt', 'Tháo vát', 'Dũng cảm phiêu lưu', 'Lôi cuốn', 'Tư duy nhanh', 'Tiến bộ', 'Đa năng'],
      challenges: ['Bồn chồn', 'Thiếu nhất quán', 'Thiếu trách nhiệm', 'Buông thả', 'Khó cam kết'],
      lifeLesson:
        'Tận hưởng tự do một cách có trách nhiệm. Tự do thực sự đến từ kỷ luật nội tâm, không phải từ việc tránh né mọi ràng buộc.',
      compatibleNumbers: [1, 3, 7],
      careerSuggestions: ['nhà văn du lịch', 'nhà báo', 'nhân viên kinh doanh', 'doanh nhân', 'nghệ sĩ biểu diễn', 'tư vấn viên'],
      astrological: 'Song Tử và Nhân Mã',
    },
  },
  {
    numberKey: 'life_path_6',
    category: 'core',
    en: {
      title: 'The Responsible Caregiver',
      keywords: ['responsibility', 'nurturing', 'family', 'service', 'harmony'],
      overview:
        'Number 6 is the number of responsibility, love, and service. Natural nurturers with a deep sense of duty toward family and community, creating warmth and beauty wherever they go.',
      strengths: ['Nurturing', 'Responsible', 'Loyal', 'Warm', 'Creative', 'Idealistic', 'Supportive'],
      challenges: ['Perfectionism', 'Self-sacrifice', 'Meddling', 'Difficulty saying no', 'Carrying others\' burdens'],
      lifeLesson:
        'To give generously without martyrdom. You cannot pour from an empty cup — caring for yourself is not selfish.',
      compatibleNumbers: [2, 3, 9],
      careerSuggestions: ['doctor', 'teacher', 'social worker', 'counsellor', 'chef', 'interior designer', 'healer'],
      astrological: 'Virgo and Libra',
    },
    zh: {
      title: '负责任的照顾者',
      keywords: ['责任', '养育', '家庭', '服务', '和谐'],
      overview:
        '数字6代表责任、爱与服务。天生的照顾者，对家庭和社区有着深厚的责任感，走到哪里都能营造温暖与美好。',
      strengths: ['善于养育', '富有责任感', '忠诚可靠', '温暖亲切', '富有创意', '理想主义', '乐于支持'],
      challenges: ['完美主义', '自我牺牲', '爱管闲事', '难以说不', '承担他人负担'],
      lifeLesson:
        '慷慨给予而不沦为殉道者。空杯子无法盛水——照顾自己并非自私。',
      compatibleNumbers: [2, 3, 9],
      careerSuggestions: ['医生', '教师', '社会工作者', '咨询师', '厨师', '室内设计师', '疗愈师'],
      astrological: '处女座与天秤座',
    },
    vi: {
      title: 'Người Chăm Sóc Có Trách Nhiệm',
      keywords: ['trách nhiệm', 'nuôi dưỡng', 'gia đình', 'phụng sự', 'hài hòa'],
      overview:
        'Số 6 là con số của trách nhiệm, tình yêu và phụng sự. Những người nuôi dưỡng tự nhiên với ý thức trách nhiệm sâu sắc đối với gia đình và cộng đồng, tạo ra sự ấm áp và vẻ đẹp ở bất cứ nơi nào họ đến.',
      strengths: ['Nuôi dưỡng', 'Có trách nhiệm', 'Trung thành', 'Ấm áp', 'Sáng tạo', 'Lý tưởng', 'Hỗ trợ tốt'],
      challenges: ['Cầu toàn', 'Hy sinh bản thân', 'Can thiệp quá mức', 'Khó từ chối', 'Mang gánh nặng của người khác'],
      lifeLesson:
        'Cho đi rộng rãi mà không trở thành người tử vì đạo. Bạn không thể rót từ một cái cốc rỗng — chăm sóc bản thân không phải là ích kỷ.',
      compatibleNumbers: [2, 3, 9],
      careerSuggestions: ['bác sĩ', 'giáo viên', 'nhân viên xã hội', 'tư vấn viên', 'đầu bếp', 'nhà thiết kế nội thất', 'nhà trị liệu'],
      astrological: 'Xử Nữ và Thiên Bình',
    },
  },
  {
    numberKey: 'life_path_7',
    category: 'core',
    en: {
      title: 'The Contemplative Truth Seeker',
      keywords: ['wisdom', 'introspection', 'analysis', 'spirituality', 'perfection'],
      overview:
        'Number 7 is the number of wisdom, introspection, and spiritual truth. Deep thinkers who seek hidden mysteries of life, analytical and perceptive, often gifted with strong intuition.',
      strengths: ['Analytical', 'Intuitive', 'Wise', 'Perceptive', 'Investigative', 'Philosophical', 'Refined'],
      challenges: ['Isolation', 'Over-analysis', 'Secrecy', 'Scepticism', 'Emotional distance'],
      lifeLesson:
        'To trust your inner wisdom and share your insights with the world. Balance intellectual pursuit with emotional connection.',
      compatibleNumbers: [2, 4, 9],
      careerSuggestions: ['researcher', 'scientist', 'philosopher', 'spiritual teacher', 'analyst', 'psychologist', 'writer'],
      astrological: 'Scorpio and Pisces',
    },
    zh: {
      title: '沉思的真理探索者',
      keywords: ['智慧', '内省', '分析', '灵性', '追求完美'],
      overview:
        '数字7代表智慧、内省与灵性真理。深邃的思想者，探寻生命隐藏的奥秘，善于分析、洞察力强，往往拥有敏锐的直觉。',
      strengths: ['善于分析', '直觉灵敏', '富有智慧', '洞察力强', '善于探究', '充满哲思', '品味高雅'],
      challenges: ['自我封闭', '过度分析', '喜欢保密', '多疑', '情感疏离'],
      lifeLesson:
        '相信内心的智慧，并将洞见分享于世界。在智识追求与情感联结之间取得平衡。',
      compatibleNumbers: [2, 4, 9],
      careerSuggestions: ['研究员', '科学家', '哲学家', '灵性导师', '分析师', '心理学家', '作家'],
      astrological: '天蝎座与双鱼座',
    },
    vi: {
      title: 'Người Tìm Kiếm Sự Thật Suy Tư',
      keywords: ['trí tuệ', 'nội tâm', 'phân tích', 'tâm linh', 'hoàn hảo'],
      overview:
        'Số 7 là con số của trí tuệ, nội tâm và chân lý tâm linh. Những nhà tư tưởng sâu sắc tìm kiếm những bí ẩn ẩn giấu của cuộc sống, có năng lực phân tích và nhận thức, thường được ban cho trực giác mạnh mẽ.',
      strengths: ['Phân tích tốt', 'Trực giác cao', 'Khôn ngoan', 'Nhận thức sâu sắc', 'Điều tra kỹ', 'Triết học', 'Tinh tế'],
      challenges: ['Cô lập', 'Phân tích quá mức', 'Bí ẩn', 'Hoài nghi', 'Khoảng cách cảm xúc'],
      lifeLesson:
        'Tin tưởng vào trí tuệ nội tâm và chia sẻ những hiểu biết của bạn với thế giới. Cân bằng việc theo đuổi tri thức với kết nối cảm xúc.',
      compatibleNumbers: [2, 4, 9],
      careerSuggestions: ['nhà nghiên cứu', 'nhà khoa học', 'triết gia', 'giáo viên tâm linh', 'nhà phân tích', 'nhà tâm lý học', 'nhà văn'],
      astrological: 'Thiên Yết và Song Ngư',
    },
  },
  {
    numberKey: 'life_path_8',
    category: 'core',
    en: {
      title: 'The Business-Minded Leader',
      keywords: ['abundance', 'authority', 'ambition', 'success', 'power'],
      overview:
        'Number 8 is the number of material success, authority, and personal power. Natural executives with strong organisational ability and a drive to achieve, understanding the link between effort and reward.',
      strengths: ['Ambitious', 'Authoritative', 'Strategic', 'Resilient', 'Confident', 'Organised', 'Visionary'],
      challenges: ['Workaholism', 'Materialism', 'Controlling tendencies', 'Stubbornness', 'Impatience'],
      lifeLesson:
        'To use power and authority in service of the greater good. True abundance includes love, health, and joy — not just material success.',
      compatibleNumbers: [2, 4, 6],
      careerSuggestions: ['CEO', 'banker', 'investor', 'entrepreneur', 'judge', 'surgeon', 'property developer'],
      astrological: 'Capricorn and Scorpio',
    },
    zh: {
      title: '商业头脑的领导者',
      keywords: ['丰盛', '权威', '野心', '成功', '力量'],
      overview:
        '数字8代表物质成功、权威与个人力量。天生的管理者，具有强大的组织能力和成就驱动力，深刻理解努力与回报之间的关系。',
      strengths: ['志存高远', '权威有力', '战略眼光', '坚韧不拔', '自信果断', '组织有序', '富有远见'],
      challenges: ['工作狂', '唯物主义', '控制欲强', '固执己见', '缺乏耐心'],
      lifeLesson:
        '将权力与权威用于服务更大的利益。真正的丰盛包括爱、健康与喜悦——而不仅仅是物质上的成功。',
      compatibleNumbers: [2, 4, 6],
      careerSuggestions: ['首席执行官', '银行家', '投资人', '企业家', '法官', '外科医生', '房地产开发商'],
      astrological: '摩羯座与天蝎座',
    },
    vi: {
      title: 'Nhà Lãnh Đạo Kinh Doanh',
      keywords: ['dồi dào', 'quyền uy', 'tham vọng', 'thành công', 'quyền lực'],
      overview:
        'Số 8 là con số của thành công vật chất, quyền uy và sức mạnh cá nhân. Những nhà điều hành tự nhiên với khả năng tổ chức mạnh mẽ và động lực đạt được mục tiêu, hiểu rõ mối liên hệ giữa nỗ lực và phần thưởng.',
      strengths: ['Đầy tham vọng', 'Có uy quyền', 'Chiến lược', 'Kiên cường', 'Tự tin', 'Có tổ chức', 'Có tầm nhìn'],
      challenges: ['Nghiện công việc', 'Vật chất chủ nghĩa', 'Khuynh hướng kiểm soát', 'Bướng bỉnh', 'Thiếu kiên nhẫn'],
      lifeLesson:
        'Sử dụng quyền lực và thẩm quyền để phục vụ lợi ích chung. Sự dồi dào thực sự bao gồm tình yêu, sức khỏe và niềm vui — không chỉ thành công vật chất.',
      compatibleNumbers: [2, 4, 6],
      careerSuggestions: ['giám đốc điều hành', 'ngân hàng', 'nhà đầu tư', 'doanh nhân', 'thẩm phán', 'bác sĩ phẫu thuật', 'nhà phát triển bất động sản'],
      astrological: 'Ma Kết và Thiên Yết',
    },
  },
  {
    numberKey: 'life_path_9',
    category: 'core',
    en: {
      title: 'The Compassionate Humanitarian',
      keywords: ['compassion', 'wisdom', 'humanitarianism', 'completion', 'universality'],
      overview:
        'Number 9 is the number of completion, wisdom, and humanitarian service. Old souls with a broad universal perspective, feeling deeply for others and driven to make the world better.',
      strengths: ['Compassionate', 'Wise', 'Generous', 'Idealistic', 'Creative', 'Broad-minded', 'Magnetic'],
      challenges: ['Over-idealism', 'Difficulty letting go', 'Self-sacrifice', 'Bitterness when unappreciated', 'Scattered energy'],
      lifeLesson:
        'To serve humanity with wisdom rather than self-sacrifice. Release what no longer serves you — completion always precedes a beautiful new beginning.',
      compatibleNumbers: [3, 6, 7],
      careerSuggestions: ['humanitarian', 'artist', 'healer', 'teacher', 'politician', 'philanthropist', 'counsellor'],
      astrological: 'Pisces and Sagittarius',
    },
    zh: {
      title: '富有同情心的人道主义者',
      keywords: ['慈悲', '智慧', '人道主义', '圆满', '普世'],
      overview:
        '数字9代表圆满、智慧与人道主义服务。古老灵魂，拥有宽广的普世视野，对他人感同身受，以改善世界为己任。',
      strengths: ['富有慈悲心', '深具智慧', '慷慨大方', '理想主义', '充满创意', '心胸宽广', '魅力迷人'],
      challenges: ['过度理想化', '难以放手', '自我牺牲', '不被欣赏时感到苦涩', '精力分散'],
      lifeLesson:
        '以智慧而非自我牺牲来服务人类。放下不再服务于你的一切——圆满总是先于美好的新开始。',
      compatibleNumbers: [3, 6, 7],
      careerSuggestions: ['人道主义者', '艺术家', '疗愈师', '教师', '政治家', '慈善家', '咨询师'],
      astrological: '双鱼座与射手座',
    },
    vi: {
      title: 'Nhà Nhân Đạo Từ Bi',
      keywords: ['lòng trắc ẩn', 'trí tuệ', 'nhân đạo', 'hoàn thành', 'phổ quát'],
      overview:
        'Số 9 là con số của sự hoàn thành, trí tuệ và phụng sự nhân đạo. Những linh hồn cổ đại với tầm nhìn phổ quát rộng lớn, cảm nhận sâu sắc cho người khác và thôi thúc làm cho thế giới tốt đẹp hơn.',
      strengths: ['Từ bi', 'Khôn ngoan', 'Hào phóng', 'Lý tưởng', 'Sáng tạo', 'Rộng tư tưởng', 'Hấp dẫn'],
      challenges: ['Quá lý tưởng hóa', 'Khó buông bỏ', 'Hy sinh bản thân', 'Cay đắng khi không được trân trọng', 'Năng lượng phân tán'],
      lifeLesson:
        'Phụng sự nhân loại bằng trí tuệ chứ không phải hy sinh. Buông bỏ những gì không còn phục vụ bạn — sự hoàn thành luôn đến trước một khởi đầu mới tươi đẹp.',
      compatibleNumbers: [3, 6, 7],
      careerSuggestions: ['nhà nhân đạo', 'nghệ sĩ', 'nhà trị liệu', 'giáo viên', 'chính khách', 'nhà từ thiện', 'tư vấn viên'],
      astrological: 'Song Ngư và Nhân Mã',
    },
  },

  // ─── Master Numbers ───────────────────────────────────────────────────────────
  {
    numberKey: 'master_11',
    category: 'master',
    en: {
      title: 'The Inspirational Teacher',
      keywords: ['inspiration', 'intuition', 'illumination', 'vision', 'spiritual insight'],
      overview:
        'Master Number 11/2 is the most intuitive of all numbers. Here to inspire and illuminate others through heightened sensitivity and spiritual insight, bridging the spiritual and material worlds.',
      strengths: ['Highly intuitive', 'Inspirational', 'Visionary', 'Charismatic', 'Empathetic', 'Creative', 'Spiritually aware'],
      challenges: ['Extreme sensitivity', 'Self-doubt', 'Nervous energy', 'Unrealistic idealism', 'Feeling misunderstood'],
      lifeLesson:
        'To trust your extraordinary intuition and use it in service of others. Ground your visionary gifts in practical action so your light can reach the world.',
      compatibleNumbers: [2, 4, 6, 8],
      careerSuggestions: ['spiritual teacher', 'healer', 'counsellor', 'artist', 'writer', 'inspirational speaker'],
      astrological: 'Aquarius and Pisces',
    },
    zh: {
      title: '启迪他人的导师',
      keywords: ['启迪', '直觉', '光照', '远见', '灵性洞见'],
      overview:
        '主数11/2是所有数字中直觉最强的。通过高度敏感与灵性洞见启迪和照亮他人，架起灵性与物质世界之间的桥梁。',
      strengths: ['直觉超强', '激励人心', '富有远见', '魅力四射', '感同身受', '富有创意', '灵性觉知'],
      challenges: ['极度敏感', '自我怀疑', '神经紧绷', '不切实际的理想主义', '感到不被理解'],
      lifeLesson:
        '相信你非凡的直觉，并将其用于服务他人。将远见天赋落地为实际行动，让你的光芒照耀世界。',
      compatibleNumbers: [2, 4, 6, 8],
      careerSuggestions: ['灵性导师', '疗愈师', '咨询师', '艺术家', '作家', '励志演讲者'],
      astrological: '水瓶座与双鱼座',
    },
    vi: {
      title: 'Người Thầy Truyền Cảm Hứng',
      keywords: ['truyền cảm hứng', 'trực giác', 'soi sáng', 'tầm nhìn', 'nhận thức tâm linh'],
      overview:
        'Số chủ đạo 11/2 là con số trực giác nhất trong tất cả các con số. Đến đây để truyền cảm hứng và soi sáng người khác qua sự nhạy cảm cao độ và nhận thức tâm linh, bắc cầu giữa thế giới tâm linh và vật chất.',
      strengths: ['Trực giác cao', 'Truyền cảm hứng', 'Có tầm nhìn', 'Lôi cuốn', 'Đồng cảm', 'Sáng tạo', 'Nhận thức tâm linh'],
      challenges: ['Quá nhạy cảm', 'Tự nghi ngờ', 'Năng lượng lo lắng', 'Lý tưởng không thực tế', 'Cảm thấy bị hiểu nhầm'],
      lifeLesson:
        'Tin tưởng vào trực giác phi thường của bạn và sử dụng nó để phục vụ người khác. Chuyển hóa những món quà tầm nhìn thành hành động thực tế để ánh sáng của bạn có thể đến với thế giới.',
      compatibleNumbers: [2, 4, 6, 8],
      careerSuggestions: ['giáo viên tâm linh', 'nhà trị liệu', 'tư vấn viên', 'nghệ sĩ', 'nhà văn', 'diễn giả truyền cảm hứng'],
      astrological: 'Bảo Bình và Song Ngư',
    },
  },
  {
    numberKey: 'master_22',
    category: 'master',
    en: {
      title: 'The Master Builder',
      keywords: ['mastery', 'vision', 'practicality', 'legacy', 'global impact'],
      overview:
        'Master Number 22/4 is the most powerful of all numbers. Able to turn ambitious dreams into reality by combining visionary thinking with practical execution to create lasting large-scale impact.',
      strengths: ['Visionary', 'Highly capable', 'Disciplined', 'Practical', 'Inspiring', 'Methodical', 'Leadership at scale'],
      challenges: ['Overwhelming pressure', 'Paralysis from perfectionism', 'Self-doubt', 'Difficulty delegating', 'Extremes'],
      lifeLesson:
        'To accept the enormity of your potential and step fully into your calling. Build not just for yourself but for future generations.',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['architect', 'global NGO leader', 'visionary entrepreneur', 'political leader', 'engineer'],
      astrological: 'Capricorn and Aquarius',
    },
    zh: {
      title: '至高无上的建造者',
      keywords: ['掌控', '远见', '务实', '传承', '全球影响力'],
      overview:
        '主数22/4是所有数字中最具力量的。通过将远见思维与实际执行相结合，将宏大梦想化为现实，创造持久的大规模影响。',
      strengths: ['富有远见', '能力超凡', '纪律严明', '脚踏实地', '激励人心', '有条不紊', '大规模领导力'],
      challenges: ['压力山大', '完美主义导致的瘫痪', '自我怀疑', '难以授权', '走极端'],
      lifeLesson:
        '接受自身潜能的宏大，全力投入使命之中。不只为自己而建造，更为后代留下遗产。',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['建筑师', '全球非政府组织领导人', '有远见的企业家', '政治领袖', '工程师'],
      astrological: '摩羯座与水瓶座',
    },
    vi: {
      title: 'Bậc Thầy Xây Dựng',
      keywords: ['tinh thông', 'tầm nhìn', 'thực tế', 'di sản', 'tác động toàn cầu'],
      overview:
        'Số chủ đạo 22/4 là con số mạnh mẽ nhất trong tất cả. Có khả năng biến những giấc mơ tham vọng thành hiện thực bằng cách kết hợp tư duy tầm nhìn với thực thi thực tế để tạo ra tác động lâu dài ở quy mô lớn.',
      strengths: ['Có tầm nhìn', 'Năng lực cao', 'Kỷ luật', 'Thực tế', 'Truyền cảm hứng', 'Có phương pháp', 'Lãnh đạo tầm cỡ'],
      challenges: ['Áp lực quá lớn', 'Tê liệt vì cầu toàn', 'Tự nghi ngờ', 'Khó ủy quyền', 'Thái cực'],
      lifeLesson:
        'Chấp nhận sự vĩ đại của tiềm năng của bạn và bước đầy đủ vào sứ mệnh của mình. Xây dựng không chỉ cho bản thân mà cho các thế hệ tương lai.',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['kiến trúc sư', 'lãnh đạo NGO toàn cầu', 'doanh nhân có tầm nhìn', 'lãnh đạo chính trị', 'kỹ sư'],
      astrological: 'Ma Kết và Bảo Bình',
    },
  },
  {
    numberKey: 'master_33',
    category: 'master',
    en: {
      title: 'The Cosmic Parent',
      keywords: ['unconditional love', 'healing', 'compassion', 'self-sacrifice', 'spiritual mastery'],
      overview:
        'Master Number 33/6 is the rarest and most spiritually evolved Master Number. Here to embody unconditional love and healing on a grand scale — teachers of teachers called to uplift humanity.',
      strengths: ['Unconditional love', 'Deep compassion', 'Healing gifts', 'Creative', 'Selfless', 'Inspiring', 'Spiritually advanced'],
      challenges: ['Extreme self-sacrifice', 'Martyrdom', 'Overwhelming responsibility', 'Boundary difficulties'],
      lifeLesson:
        'To love and serve without losing yourself. Your own wellbeing is sacred, not selfish.',
      compatibleNumbers: [6, 9, 11],
      careerSuggestions: ['healer', 'spiritual master', 'teacher of teachers', 'artist', 'humanitarian leader', 'therapist'],
      astrological: 'Virgo and Pisces',
    },
    zh: {
      title: '宇宙之母',
      keywords: ['无条件的爱', '疗愈', '慈悲', '自我牺牲', '灵性精通'],
      overview:
        '主数33/6是最稀有、灵性最为进化的主数。在这里以宏大的规模体现无条件的爱与疗愈——导师之师，被召唤来提升人类。',
      strengths: ['无条件的爱', '深厚慈悲心', '疗愈天赋', '富有创意', '无私奉献', '激励人心', '灵性高度进化'],
      challenges: ['极度自我牺牲', '殉道主义', '责任重大', '难以设定界限'],
      lifeLesson:
        '在爱与服务中不迷失自我。你自己的幸福是神圣的，而非自私的。',
      compatibleNumbers: [6, 9, 11],
      careerSuggestions: ['疗愈师', '灵性大师', '导师之师', '艺术家', '人道主义领袖', '治疗师'],
      astrological: '处女座与双鱼座',
    },
    vi: {
      title: 'Cha Mẹ Vũ Trụ',
      keywords: ['tình yêu vô điều kiện', 'chữa lành', 'lòng trắc ẩn', 'hy sinh', 'tinh thông tâm linh'],
      overview:
        'Số chủ đạo 33/6 là con số chủ đạo hiếm nhất và tiến hóa tâm linh nhất. Đến đây để thể hiện tình yêu vô điều kiện và sự chữa lành ở quy mô lớn — giáo viên của các giáo viên được kêu gọi để nâng cao nhân loại.',
      strengths: ['Tình yêu vô điều kiện', 'Lòng trắc ẩn sâu sắc', 'Tài năng chữa lành', 'Sáng tạo', 'Vị tha', 'Truyền cảm hứng', 'Tâm linh tiến hóa cao'],
      challenges: ['Hy sinh quá mức', 'Tử vì đạo', 'Trách nhiệm quá lớn', 'Khó đặt ranh giới'],
      lifeLesson:
        'Yêu và phụng sự mà không đánh mất bản thân. Hạnh phúc của bạn là thiêng liêng, không phải ích kỷ.',
      compatibleNumbers: [6, 9, 11],
      careerSuggestions: ['nhà trị liệu', 'bậc thầy tâm linh', 'giáo viên của các giáo viên', 'nghệ sĩ', 'lãnh đạo nhân đạo', 'nhà tâm lý trị liệu'],
      astrological: 'Xử Nữ và Song Ngư',
    },
  },

  // ─── Karmic Debt Numbers ──────────────────────────────────────────────────────
  {
    numberKey: 'karmic_debt_13',
    category: 'karmic_debt',
    en: {
      title: 'Karmic Debt 13/4 — The Hard Worker',
      keywords: ['hard work', 'discipline', 'transformation through effort', 'karmic lesson'],
      overview:
        'Indicates a past life where work and responsibility were avoided. This life brings lessons of hard work and perseverance — setbacks build the strength and integrity previously lacking.',
      strengths: ['Extraordinary resilience', 'Deep appreciation for earned success', 'Strong work ethic when embraced'],
      challenges: ['Laziness or avoidance', 'Frustration at slow progress', 'Feeling burdened by obligations'],
      lifeLesson:
        'Embrace hard work with a positive attitude. Every effort builds a solid foundation — there are no shortcuts with this debt.',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['any field requiring sustained effort and dedication'],
      astrological: 'Saturn-influenced',
    },
    zh: {
      title: '业力债数13/4 — 勤奋的工作者',
      keywords: ['勤奋', '纪律', '通过努力实现转变', '业力功课'],
      overview:
        '表示前世逃避工作与责任。今生带来勤劳与坚持的功课——挫折磨砺出过去所缺乏的力量与正直。',
      strengths: ['非凡的韧性', '对通过努力获得成功的深刻感激', '一旦接受便具有强烈的职业道德'],
      challenges: ['懒惰或回避', '对进展缓慢感到沮丧', '感到被责任所累'],
      lifeLesson:
        '以积极的态度拥抱勤奋工作。每一份努力都在建造坚实的基础——这份债务没有捷径可走。',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['任何需要持续努力与奉献精神的领域'],
      astrological: '土星影响',
    },
    vi: {
      title: 'Nợ Nghiệp 13/4 — Người Lao Động Chăm Chỉ',
      keywords: ['chăm chỉ', 'kỷ luật', 'biến đổi qua nỗ lực', 'bài học nghiệp'],
      overview:
        'Chỉ ra một kiếp trước mà công việc và trách nhiệm bị né tránh. Kiếp này mang đến những bài học về sự chăm chỉ và kiên trì — những thất bại xây dựng nên sức mạnh và chính trực mà trước đây còn thiếu.',
      strengths: ['Khả năng phục hồi phi thường', 'Trân trọng sâu sắc thành công do nỗ lực', 'Đạo đức làm việc mạnh mẽ khi được chấp nhận'],
      challenges: ['Lười biếng hoặc né tránh', 'Thất vọng về tiến độ chậm', 'Cảm thấy bị áp lực bởi nghĩa vụ'],
      lifeLesson:
        'Đón nhận sự chăm chỉ với thái độ tích cực. Mỗi nỗ lực xây dựng một nền tảng vững chắc — không có đường tắt với nợ nghiệp này.',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi nỗ lực bền bỉ và cống hiến'],
      astrological: 'Ảnh hưởng Thổ Tinh',
    },
  },
  {
    numberKey: 'karmic_debt_14',
    category: 'karmic_debt',
    en: {
      title: 'Karmic Debt 14/5 — The Responsible Adventurer',
      keywords: ['freedom', 'responsibility', 'overindulgence', 'karmic lesson'],
      overview:
        'Indicates a past life where freedom was abused through overindulgence or recklessness. This life teaches responsible freedom — temptation and scattered energy are the key tests.',
      strengths: ['Extraordinary adaptability', 'Deep understanding of the value of freedom'],
      challenges: ['Overindulgence', 'Restlessness', 'Inability to commit'],
      lifeLesson:
        'Exercise personal freedom with discipline. True freedom is earned through self-mastery, not the abandonment of all limits.',
      compatibleNumbers: [5, 7, 9],
      careerSuggestions: ['any field requiring adaptability and resilience'],
      astrological: 'Mercury and Saturn influenced',
    },
    zh: {
      title: '业力债数14/5 — 负责任的冒险者',
      keywords: ['自由', '责任', '过度放纵', '业力功课'],
      overview:
        '表示前世通过过度放纵或鲁莽行事滥用自由。今生教导负责任的自由——诱惑与精力分散是主要考验。',
      strengths: ['非凡的适应力', '对自由价值的深刻理解'],
      challenges: ['过度放纵', '坐立不安', '无法承诺'],
      lifeLesson:
        '以纪律行使个人自由。真正的自由通过自我掌控来获得，而非放弃一切限制。',
      compatibleNumbers: [5, 7, 9],
      careerSuggestions: ['任何需要适应力与韧性的领域'],
      astrological: '水星与土星影响',
    },
    vi: {
      title: 'Nợ Nghiệp 14/5 — Nhà Thám Hiểm Có Trách Nhiệm',
      keywords: ['tự do', 'trách nhiệm', 'buông thả', 'bài học nghiệp'],
      overview:
        'Chỉ ra một kiếp trước mà tự do bị lạm dụng qua sự buông thả hay liều lĩnh. Kiếp này dạy về tự do có trách nhiệm — cám dỗ và năng lượng phân tán là những thử thách chính.',
      strengths: ['Khả năng thích nghi phi thường', 'Hiểu sâu sắc giá trị của tự do'],
      challenges: ['Buông thả', 'Bồn chồn', 'Không thể cam kết'],
      lifeLesson:
        'Thực hiện tự do cá nhân với kỷ luật. Tự do thực sự được kiếm qua sự tự chủ, không phải từ việc từ bỏ mọi giới hạn.',
      compatibleNumbers: [5, 7, 9],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi sự thích nghi và kiên cường'],
      astrological: 'Ảnh hưởng Thủy Tinh và Thổ Tinh',
    },
  },
  {
    numberKey: 'karmic_debt_16',
    category: 'karmic_debt',
    en: {
      title: 'Karmic Debt 16/7 — The Ego Transformer',
      keywords: ['ego', 'transformation', 'pride', 'spiritual awakening', 'karmic lesson'],
      overview:
        'One of the most profound karmic debts. Past life ego elevated above love and spirit. The universe brings old structures down so something truer can be built in their place.',
      strengths: ['Profound spiritual wisdom', 'Great depth of character forged through upheaval'],
      challenges: ['Sudden collapses of relationships or career', 'Intense ego battles', 'Painful awakenings'],
      lifeLesson:
        'Surrender the ego and align with spiritual truth. The destruction you experience always clears space for something more aligned with your soul.',
      compatibleNumbers: [7, 9, 11],
      careerSuggestions: ['spiritual teacher', 'healer', 'philosopher', 'researcher'],
      astrological: 'Uranus and Neptune influenced',
    },
    zh: {
      title: '业力债数16/7 — 自我转化者',
      keywords: ['自我', '转化', '傲慢', '灵性觉醒', '业力功课'],
      overview:
        '最深刻的业力债之一。前世将自我凌驾于爱与灵性之上。宇宙让旧结构崩塌，以便在原地建立更真实的东西。',
      strengths: ['深刻的灵性智慧', '在动荡中磨砺出的深度人格'],
      challenges: ['关系或事业突然崩溃', '激烈的自我之战', '痛苦的觉醒'],
      lifeLesson:
        '臣服于自我，与灵性真理对齐。你所经历的破坏始终在为更契合灵魂的事物腾出空间。',
      compatibleNumbers: [7, 9, 11],
      careerSuggestions: ['灵性导师', '疗愈师', '哲学家', '研究员'],
      astrological: '天王星与海王星影响',
    },
    vi: {
      title: 'Nợ Nghiệp 16/7 — Người Biến Đổi Cái Tôi',
      keywords: ['cái tôi', 'biến đổi', 'kiêu ngạo', 'thức tỉnh tâm linh', 'bài học nghiệp'],
      overview:
        'Một trong những nợ nghiệp sâu sắc nhất. Kiếp trước đặt cái tôi lên trên tình yêu và tâm linh. Vũ trụ đem lại sự sụp đổ những cấu trúc cũ để điều chân thực hơn có thể được xây dựng thay thế.',
      strengths: ['Trí tuệ tâm linh sâu sắc', 'Chiều sâu nhân cách lớn được rèn giũa qua biến động'],
      challenges: ['Sụp đổ đột ngột trong các mối quan hệ hoặc sự nghiệp', 'Cuộc chiến cái tôi dữ dội', 'Sự thức tỉnh đau đớn'],
      lifeLesson:
        'Từ bỏ cái tôi và hòa hợp với chân lý tâm linh. Sự hủy hoại bạn trải qua luôn tạo ra không gian cho điều gì đó phù hợp hơn với linh hồn bạn.',
      compatibleNumbers: [7, 9, 11],
      careerSuggestions: ['giáo viên tâm linh', 'nhà trị liệu', 'triết gia', 'nhà nghiên cứu'],
      astrological: 'Ảnh hưởng Thiên Vương Tinh và Hải Vương Tinh',
    },
  },
  {
    numberKey: 'karmic_debt_19',
    category: 'karmic_debt',
    en: {
      title: 'Karmic Debt 19/1 — The Independent Server',
      keywords: ['independence', 'self-reliance', 'abuse of power', 'karmic lesson'],
      overview:
        'Indicates a past life where personal power was used for self-serving ends. This life requires developing true independence while learning to accept help and consider others.',
      strengths: ['Extraordinary self-sufficiency', 'Deep appreciation for genuine community'],
      challenges: ['Stubbornness about accepting help', 'Feeling isolated', 'Repeating power struggles'],
      lifeLesson:
        'Develop independence that empowers others rather than excluding them. Asking for help is strength, not weakness.',
      compatibleNumbers: [1, 3, 9],
      careerSuggestions: ['leadership roles', 'entrepreneurship', 'community building'],
      astrological: 'Sun and Saturn influenced',
    },
    zh: {
      title: '业力债数19/1 — 独立的服务者',
      keywords: ['独立', '自立', '滥用权力', '业力功课'],
      overview:
        '表示前世将个人权力用于自私目的。今生需要培养真正的独立精神，同时学会接受帮助与顾及他人。',
      strengths: ['非凡的自给自足能力', '对真诚社群的深刻感激'],
      challenges: ['固执拒绝接受帮助', '感到孤立', '重复权力斗争'],
      lifeLesson:
        '培养能够赋予他人力量而非排斥他人的独立性。寻求帮助是力量，而非软弱。',
      compatibleNumbers: [1, 3, 9],
      careerSuggestions: ['领导职位', '创业', '社区建设'],
      astrological: '太阳与土星影响',
    },
    vi: {
      title: 'Nợ Nghiệp 19/1 — Người Phụng Sự Độc Lập',
      keywords: ['độc lập', 'tự lực', 'lạm dụng quyền lực', 'bài học nghiệp'],
      overview:
        'Chỉ ra một kiếp trước mà quyền lực cá nhân được sử dụng cho mục đích vị kỷ. Kiếp này đòi hỏi phát triển sự độc lập thực sự trong khi học cách chấp nhận sự giúp đỡ và quan tâm đến người khác.',
      strengths: ['Khả năng tự túc phi thường', 'Trân trọng sâu sắc cộng đồng chân thực'],
      challenges: ['Cứng đầu về việc chấp nhận giúp đỡ', 'Cảm thấy bị cô lập', 'Lặp đi lặp lại cuộc đấu tranh quyền lực'],
      lifeLesson:
        'Phát triển sự độc lập trao quyền cho người khác thay vì loại trừ họ. Xin giúp đỡ là sức mạnh, không phải điểm yếu.',
      compatibleNumbers: [1, 3, 9],
      careerSuggestions: ['vai trò lãnh đạo', 'khởi nghiệp', 'xây dựng cộng đồng'],
      astrological: 'Ảnh hưởng Mặt Trời và Thổ Tinh',
    },
  },

  // ─── Karmic Lessons 1–9 ───────────────────────────────────────────────────────
  {
    numberKey: 'karmic_lesson_1',
    category: 'karmic_lesson',
    en: {
      title: 'Karmic Lesson 1 — Developing Willpower',
      keywords: ['willpower', 'self-reliance', 'courage', 'assertion', 'initiative'],
      overview:
        'The number 1 is absent from your name. You are here to develop willpower, self-reliance, and the courage to stand on your own two feet. You may struggle with asserting yourself or initiating action.',
      strengths: ['Growth through adversity', 'Appreciation for independence once cultivated', 'Deep resilience when challenged'],
      challenges: ['Passivity', 'Waiting for others to lead', 'Lack of initiative', 'Self-doubt'],
      lifeLesson:
        'Develop confidence in your own abilities. Take the lead when opportunities arise rather than waiting for others to go first.',
      compatibleNumbers: [1, 5, 8],
      careerSuggestions: ['any field requiring leadership and initiative'],
      astrological: 'Mars influenced',
    },
    zh: {
      title: '业力功课1 — 培养意志力',
      keywords: ['意志力', '自力更生', '勇气', '自我主张', '主动性'],
      overview:
        '你的姓名中缺少数字1。你来到这里是为了培养意志力、自立能力以及独立自主的勇气。你可能在自我主张或主动采取行动方面遇到困难。',
      strengths: ['在逆境中成长', '一旦培养出独立精神便深感珍视', '受到挑战时展现深厚韧性'],
      challenges: ['被动消极', '等待他人带领', '缺乏主动性', '自我怀疑'],
      lifeLesson:
        '对自己的能力建立信心。当机会出现时勇于带头，而不是等待他人先行。',
      compatibleNumbers: [1, 5, 8],
      careerSuggestions: ['任何需要领导力与主动性的领域'],
      astrological: '火星影响',
    },
    vi: {
      title: 'Bài Học Nghiệp 1 — Phát Triển Ý Chí',
      keywords: ['ý chí', 'tự lực', 'can đảm', 'khẳng định', 'chủ động'],
      overview:
        'Số 1 vắng mặt trong tên của bạn. Bạn đến đây để phát triển ý chí, sự tự lực và can đảm để tự đứng vững trên đôi chân của mình. Bạn có thể gặp khó khăn trong việc khẳng định bản thân hoặc bắt đầu hành động.',
      strengths: ['Trưởng thành qua nghịch cảnh', 'Trân trọng sự độc lập khi đã nuôi dưỡng được', 'Kiên cường sâu sắc khi bị thử thách'],
      challenges: ['Thụ động', 'Chờ đợi người khác dẫn đầu', 'Thiếu chủ động', 'Tự nghi ngờ'],
      lifeLesson:
        'Phát triển sự tự tin vào khả năng của bạn. Dẫn đầu khi cơ hội xuất hiện thay vì chờ đợi người khác đi trước.',
      compatibleNumbers: [1, 5, 8],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi sự lãnh đạo và chủ động'],
      astrological: 'Ảnh hưởng Hỏa Tinh',
    },
  },
  {
    numberKey: 'karmic_lesson_2',
    category: 'karmic_lesson',
    en: {
      title: 'Karmic Lesson 2 — Developing Sensitivity',
      keywords: ['sensitivity', 'diplomacy', 'listening', 'gentleness', 'awareness'],
      overview:
        'The number 2 is absent from your name. You are here to develop sensitivity, diplomacy, and the ability to truly listen. You may come across as tactless or overly independent.',
      strengths: ['Growth through relationship', 'Developing deep empathy', 'Learning to truly connect'],
      challenges: ['Tactlessness', 'Bluntness', 'Insensitivity to others\' feelings'],
      lifeLesson:
        'Slow down and tune into the feelings of others. True strength includes the ability to be gentle.',
      compatibleNumbers: [2, 6, 9],
      careerSuggestions: ['any field requiring teamwork and communication'],
      astrological: 'Moon influenced',
    },
    zh: {
      title: '业力功课2 — 培养敏感性',
      keywords: ['敏感性', '外交手腕', '倾听', '温柔', '觉察力'],
      overview:
        '你的姓名中缺少数字2。你来到这里是为了培养敏感性、外交技巧以及真正倾听的能力。你可能给人留下不够圆滑或过于独立的印象。',
      strengths: ['在关系中成长', '培养深刻的同理心', '学会真正建立联结'],
      challenges: ['言辞不够圆滑', '过于直白', '对他人感受不够敏感'],
      lifeLesson:
        '放慢脚步，感受他人的情绪。真正的力量包括温柔的能力。',
      compatibleNumbers: [2, 6, 9],
      careerSuggestions: ['任何需要团队合作与沟通的领域'],
      astrological: '月亮影响',
    },
    vi: {
      title: 'Bài Học Nghiệp 2 — Phát Triển Sự Nhạy Cảm',
      keywords: ['nhạy cảm', 'ngoại giao', 'lắng nghe', 'nhẹ nhàng', 'nhận thức'],
      overview:
        'Số 2 vắng mặt trong tên của bạn. Bạn đến đây để phát triển sự nhạy cảm, kỹ năng ngoại giao và khả năng thực sự lắng nghe. Bạn có thể bị xem là thiếu tế nhị hoặc quá độc lập.',
      strengths: ['Trưởng thành qua các mối quan hệ', 'Phát triển sự đồng cảm sâu sắc', 'Học cách kết nối thực sự'],
      challenges: ['Thiếu tế nhị', 'Thẳng thắn thô lỗ', 'Vô cảm với cảm xúc người khác'],
      lifeLesson:
        'Chậm lại và cảm nhận cảm xúc của người khác. Sức mạnh thực sự bao gồm khả năng dịu dàng.',
      compatibleNumbers: [2, 6, 9],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi làm việc nhóm và giao tiếp'],
      astrological: 'Ảnh hưởng Mặt Trăng',
    },
  },
  {
    numberKey: 'karmic_lesson_3',
    category: 'karmic_lesson',
    en: {
      title: 'Karmic Lesson 3 — Developing Expression',
      keywords: ['expression', 'creativity', 'communication', 'joy', 'openness'],
      overview:
        'The number 3 is absent from your name. You are here to develop self-expression, creativity, and joy. You may hold back your true feelings or struggle to communicate openly.',
      strengths: ['Growth through creative expression', 'Developing an authentic voice', 'Learning joyfulness'],
      challenges: ['Holding back feelings', 'Communication blocks', 'Suppressed creativity'],
      lifeLesson:
        'Express yourself freely and joyfully. Your voice and creativity are gifts the world needs.',
      compatibleNumbers: [3, 6, 9],
      careerSuggestions: ['any field requiring communication and creativity'],
      astrological: 'Jupiter influenced',
    },
    zh: {
      title: '业力功课3 — 培养表达力',
      keywords: ['表达', '创造力', '沟通', '喜悦', '开放性'],
      overview:
        '你的姓名中缺少数字3。你来到这里是为了培养自我表达、创造力与喜悦。你可能会压抑真实感受，或在开放沟通方面有所困难。',
      strengths: ['在创意表达中成长', '培养真实的声音', '学会喜悦'],
      challenges: ['压抑感受', '沟通受阻', '创造力被压制'],
      lifeLesson:
        '自由而愉快地表达自我。你的声音与创造力是世界所需要的礼物。',
      compatibleNumbers: [3, 6, 9],
      careerSuggestions: ['任何需要沟通与创造力的领域'],
      astrological: '木星影响',
    },
    vi: {
      title: 'Bài Học Nghiệp 3 — Phát Triển Sự Biểu Đạt',
      keywords: ['biểu đạt', 'sáng tạo', 'giao tiếp', 'niềm vui', 'cởi mở'],
      overview:
        'Số 3 vắng mặt trong tên của bạn. Bạn đến đây để phát triển sự tự biểu đạt, sáng tạo và niềm vui. Bạn có thể kìm nén cảm xúc thực sự hoặc gặp khó khăn trong việc giao tiếp cởi mở.',
      strengths: ['Trưởng thành qua biểu đạt sáng tạo', 'Phát triển tiếng nói chân thực', 'Học cách vui vẻ'],
      challenges: ['Kìm nén cảm xúc', 'Rào cản giao tiếp', 'Sáng tạo bị đè nén'],
      lifeLesson:
        'Thể hiện bản thân tự do và vui vẻ. Giọng nói và sự sáng tạo của bạn là những món quà mà thế giới cần.',
      compatibleNumbers: [3, 6, 9],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi giao tiếp và sáng tạo'],
      astrological: 'Ảnh hưởng Mộc Tinh',
    },
  },
  {
    numberKey: 'karmic_lesson_4',
    category: 'karmic_lesson',
    en: {
      title: 'Karmic Lesson 4 — Developing Discipline',
      keywords: ['discipline', 'organisation', 'structure', 'diligence', 'persistence'],
      overview:
        'The number 4 is absent from your name. You are here to develop discipline, organisation, and a strong work ethic. You may struggle with follow-through or building lasting foundations.',
      strengths: ['Growth through steady effort', 'Appreciation for solid foundations', 'Developing patience'],
      challenges: ['Lack of follow-through', 'Disorganisation', 'Avoiding hard work'],
      lifeLesson:
        'Embrace structure and steady effort. The most meaningful achievements are built one disciplined step at a time.',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['any field requiring organisation and sustained effort'],
      astrological: 'Saturn influenced',
    },
    zh: {
      title: '业力功课4 — 培养纪律性',
      keywords: ['纪律', '组织能力', '结构', '勤奋', '坚持'],
      overview:
        '你的姓名中缺少数字4。你来到这里是为了培养纪律、组织能力和强烈的职业道德。你可能在坚持到底或建立持久基础方面有所困难。',
      strengths: ['在稳定的努力中成长', '珍视坚实的基础', '培养耐心'],
      challenges: ['缺乏始终如一', '缺乏条理', '逃避艰苦工作'],
      lifeLesson:
        '拥抱结构与稳定的努力。最有意义的成就是一步一个脚印地通过纪律建立起来的。',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['任何需要组织能力与持续努力的领域'],
      astrological: '土星影响',
    },
    vi: {
      title: 'Bài Học Nghiệp 4 — Phát Triển Kỷ Luật',
      keywords: ['kỷ luật', 'tổ chức', 'cấu trúc', 'cần cù', 'kiên trì'],
      overview:
        'Số 4 vắng mặt trong tên của bạn. Bạn đến đây để phát triển kỷ luật, tổ chức và đạo đức làm việc mạnh mẽ. Bạn có thể gặp khó khăn trong việc theo đuổi đến cùng hoặc xây dựng nền tảng lâu dài.',
      strengths: ['Trưởng thành qua nỗ lực bền bỉ', 'Trân trọng nền tảng vững chắc', 'Phát triển sự kiên nhẫn'],
      challenges: ['Thiếu kiên định', 'Thiếu tổ chức', 'Tránh né công việc khó'],
      lifeLesson:
        'Đón nhận cấu trúc và nỗ lực bền bỉ. Những thành tựu có ý nghĩa nhất được xây dựng từng bước kỷ luật một.',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi tổ chức và nỗ lực bền bỉ'],
      astrological: 'Ảnh hưởng Thổ Tinh',
    },
  },
  {
    numberKey: 'karmic_lesson_5',
    category: 'karmic_lesson',
    en: {
      title: 'Karmic Lesson 5 — Developing Adaptability',
      keywords: ['adaptability', 'change', 'courage', 'openness', 'versatility'],
      overview:
        'The number 5 is absent from your name. You are here to develop adaptability, courage, and openness to change. You may resist new experiences or cling to the familiar.',
      strengths: ['Growth through experience', 'Developing flexibility', 'Learning to embrace the new'],
      challenges: ['Resistance to change', 'Clinging to the familiar', 'Fear of the unknown'],
      lifeLesson:
        'Embrace change as the engine of growth. Step outside your comfort zone regularly.',
      compatibleNumbers: [3, 5, 7],
      careerSuggestions: ['any field requiring adaptability and openness'],
      astrological: 'Mercury influenced',
    },
    zh: {
      title: '业力功课5 — 培养适应力',
      keywords: ['适应力', '变化', '勇气', '开放性', '多才多艺'],
      overview:
        '你的姓名中缺少数字5。你来到这里是为了培养适应力、勇气以及对变化的开放态度。你可能抗拒新体验，或倾向于依恋熟悉的事物。',
      strengths: ['在经历中成长', '培养灵活性', '学会接纳新事物'],
      challenges: ['抗拒变化', '执着于熟悉事物', '对未知感到恐惧'],
      lifeLesson:
        '将变化视为成长的引擎。定期走出舒适区。',
      compatibleNumbers: [3, 5, 7],
      careerSuggestions: ['任何需要适应力与开放性的领域'],
      astrological: '水星影响',
    },
    vi: {
      title: 'Bài Học Nghiệp 5 — Phát Triển Sự Thích Nghi',
      keywords: ['thích nghi', 'thay đổi', 'can đảm', 'cởi mở', 'đa năng'],
      overview:
        'Số 5 vắng mặt trong tên của bạn. Bạn đến đây để phát triển khả năng thích nghi, can đảm và sự cởi mở với sự thay đổi. Bạn có thể kháng cự những trải nghiệm mới hoặc bám víu vào điều quen thuộc.',
      strengths: ['Trưởng thành qua trải nghiệm', 'Phát triển sự linh hoạt', 'Học cách đón nhận điều mới'],
      challenges: ['Kháng cự thay đổi', 'Bám víu vào điều quen thuộc', 'Sợ hãi điều chưa biết'],
      lifeLesson:
        'Đón nhận sự thay đổi như là động cơ của sự tăng trưởng. Bước ra ngoài vùng an toàn của bạn thường xuyên.',
      compatibleNumbers: [3, 5, 7],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi sự thích nghi và cởi mở'],
      astrological: 'Ảnh hưởng Thủy Tinh',
    },
  },
  {
    numberKey: 'karmic_lesson_6',
    category: 'karmic_lesson',
    en: {
      title: 'Karmic Lesson 6 — Developing Responsibility',
      keywords: ['responsibility', 'commitment', 'nurturing', 'duty', 'love'],
      overview:
        'The number 6 is absent from your name. You are here to develop responsibility, commitment, and the ability to nurture. You may avoid long-term obligations or struggle with family duties.',
      strengths: ['Growth through service', 'Developing reliability', 'Learning to show up for others'],
      challenges: ['Avoiding commitments', 'Neglecting responsibilities', 'Emotional unavailability'],
      lifeLesson:
        'Embrace your responsibilities with love. Showing up consistently for others is one of the highest expressions of strength.',
      compatibleNumbers: [2, 6, 9],
      careerSuggestions: ['any field requiring care and long-term responsibility'],
      astrological: 'Venus influenced',
    },
    zh: {
      title: '业力功课6 — 培养责任感',
      keywords: ['责任', '承诺', '养育', '义务', '爱'],
      overview:
        '你的姓名中缺少数字6。你来到这里是为了培养责任感、承诺精神以及养育他人的能力。你可能回避长期义务，或在家庭职责方面有所困难。',
      strengths: ['在服务中成长', '培养可靠性', '学会为他人守候'],
      challenges: ['回避承诺', '忽视责任', '情感上难以到位'],
      lifeLesson:
        '以爱拥抱你的责任。持续为他人守候是力量最高贵的体现之一。',
      compatibleNumbers: [2, 6, 9],
      careerSuggestions: ['任何需要关怀与长期责任的领域'],
      astrological: '金星影响',
    },
    vi: {
      title: 'Bài Học Nghiệp 6 — Phát Triển Trách Nhiệm',
      keywords: ['trách nhiệm', 'cam kết', 'nuôi dưỡng', 'bổn phận', 'tình yêu'],
      overview:
        'Số 6 vắng mặt trong tên của bạn. Bạn đến đây để phát triển trách nhiệm, cam kết và khả năng nuôi dưỡng. Bạn có thể tránh né các nghĩa vụ dài hạn hoặc gặp khó khăn với bổn phận gia đình.',
      strengths: ['Trưởng thành qua phụng sự', 'Phát triển độ tin cậy', 'Học cách hiện diện cho người khác'],
      challenges: ['Tránh né cam kết', 'Bỏ bê trách nhiệm', 'Thiếu hiện diện cảm xúc'],
      lifeLesson:
        'Đón nhận trách nhiệm của bạn với tình yêu. Hiện diện nhất quán cho người khác là một trong những biểu hiện cao nhất của sức mạnh.',
      compatibleNumbers: [2, 6, 9],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi sự chăm sóc và trách nhiệm lâu dài'],
      astrological: 'Ảnh hưởng Kim Tinh',
    },
  },
  {
    numberKey: 'karmic_lesson_7',
    category: 'karmic_lesson',
    en: {
      title: 'Karmic Lesson 7 — Developing Faith',
      keywords: ['faith', 'introspection', 'inner wisdom', 'spirituality', 'depth'],
      overview:
        'The number 7 is absent from your name. You are here to develop trust, inner wisdom, and spiritual faith. You may rely too heavily on surface appearances or resist going deeper.',
      strengths: ['Growth through seeking', 'Developing inner life', 'Learning to trust the unseen'],
      challenges: ['Superficiality', 'Over-reliance on external validation', 'Avoiding introspection'],
      lifeLesson:
        'Develop your inner life through reflection, study, and stillness. The answers you seek are within.',
      compatibleNumbers: [2, 7, 9],
      careerSuggestions: ['any field requiring depth and reflective thinking'],
      astrological: 'Neptune influenced',
    },
    zh: {
      title: '业力功课7 — 培养信念',
      keywords: ['信念', '内省', '内在智慧', '灵性', '深度'],
      overview:
        '你的姓名中缺少数字7。你来到这里是为了培养信任、内在智慧与灵性信仰。你可能过于依赖表面现象，或抗拒深入探索。',
      strengths: ['在探寻中成长', '培养内在生命', '学会相信无形之物'],
      challenges: ['流于表面', '过度依赖外部认可', '回避内省'],
      lifeLesson:
        '通过反思、学习与静心培养内在生命。你所寻找的答案就在内心深处。',
      compatibleNumbers: [2, 7, 9],
      careerSuggestions: ['任何需要深度与反思性思维的领域'],
      astrological: '海王星影响',
    },
    vi: {
      title: 'Bài Học Nghiệp 7 — Phát Triển Đức Tin',
      keywords: ['đức tin', 'nội tâm', 'trí tuệ nội tâm', 'tâm linh', 'chiều sâu'],
      overview:
        'Số 7 vắng mặt trong tên của bạn. Bạn đến đây để phát triển sự tin tưởng, trí tuệ nội tâm và đức tin tâm linh. Bạn có thể dựa quá nhiều vào vẻ bề ngoài hoặc kháng cự việc đi sâu hơn.',
      strengths: ['Trưởng thành qua tìm kiếm', 'Phát triển đời sống nội tâm', 'Học cách tin tưởng điều vô hình'],
      challenges: ['Hời hợt', 'Quá phụ thuộc vào sự công nhận bên ngoài', 'Tránh né nội tâm'],
      lifeLesson:
        'Phát triển đời sống nội tâm qua sự suy ngẫm, học hỏi và tĩnh lặng. Những câu trả lời bạn tìm kiếm đều ở bên trong.',
      compatibleNumbers: [2, 7, 9],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi chiều sâu và tư duy suy ngẫm'],
      astrological: 'Ảnh hưởng Hải Vương Tinh',
    },
  },
  {
    numberKey: 'karmic_lesson_8',
    category: 'karmic_lesson',
    en: {
      title: 'Karmic Lesson 8 — Developing Ambition',
      keywords: ['ambition', 'authority', 'financial literacy', 'power', 'achievement'],
      overview:
        'The number 8 is absent from your name. You are here to develop ambition, financial literacy, and personal authority. You may undervalue yourself or shy away from positions of power.',
      strengths: ['Growth through material mastery', 'Developing confidence in authority', 'Learning to claim power'],
      challenges: ['Undervaluing self', 'Shying from authority', 'Poor relationship with money'],
      lifeLesson:
        'Claim your authority and your right to material success. Ambition in service of good is a virtue.',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['any field requiring leadership and financial acumen'],
      astrological: 'Saturn and Sun influenced',
    },
    zh: {
      title: '业力功课8 — 培养雄心壮志',
      keywords: ['野心', '权威', '财务素养', '力量', '成就'],
      overview:
        '你的姓名中缺少数字8。你来到这里是为了培养雄心、财务素养与个人权威。你可能低估自己的价值，或回避权力地位。',
      strengths: ['在物质掌控中成长', '培养对权威的自信', '学会主张权力'],
      challenges: ['低估自我价值', '回避权威', '与金钱关系欠佳'],
      lifeLesson:
        '主张你的权威与物质成功的权利。服务于善的雄心是一种美德。',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['任何需要领导力与财务敏锐度的领域'],
      astrological: '土星与太阳影响',
    },
    vi: {
      title: 'Bài Học Nghiệp 8 — Phát Triển Tham Vọng',
      keywords: ['tham vọng', 'quyền uy', 'hiểu biết tài chính', 'quyền lực', 'thành tựu'],
      overview:
        'Số 8 vắng mặt trong tên của bạn. Bạn đến đây để phát triển tham vọng, kiến thức tài chính và thẩm quyền cá nhân. Bạn có thể tự đánh giá thấp bản thân hoặc tránh né các vị trí quyền lực.',
      strengths: ['Trưởng thành qua việc làm chủ vật chất', 'Phát triển sự tự tin vào thẩm quyền', 'Học cách đòi lấy quyền lực'],
      challenges: ['Tự đánh giá thấp bản thân', 'Tránh né thẩm quyền', 'Quan hệ kém với tiền bạc'],
      lifeLesson:
        'Khẳng định quyền uy và quyền thành công về vật chất của bạn. Tham vọng phục vụ điều tốt là một đức hạnh.',
      compatibleNumbers: [4, 6, 8],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi sự lãnh đạo và hiểu biết tài chính'],
      astrological: 'Ảnh hưởng Thổ Tinh và Mặt Trời',
    },
  },
  {
    numberKey: 'karmic_lesson_9',
    category: 'karmic_lesson',
    en: {
      title: 'Karmic Lesson 9 — Developing Compassion',
      keywords: ['compassion', 'tolerance', 'universality', 'giving', 'broad perspective'],
      overview:
        'The number 9 is absent from your name. You are here to develop compassion, tolerance, and a broad universal perspective. You may struggle to see beyond your own immediate concerns.',
      strengths: ['Growth through service to others', 'Developing empathy', 'Learning universal love'],
      challenges: ['Narrow perspective', 'Self-centredness', 'Lack of empathy for broader humanity'],
      lifeLesson:
        'Expand your circle of care. The more you give with an open heart, the more abundantly life returns to you.',
      compatibleNumbers: [3, 6, 9],
      careerSuggestions: ['any field requiring humanitarian service and empathy'],
      astrological: 'Jupiter and Neptune influenced',
    },
    zh: {
      title: '业力功课9 — 培养慈悲心',
      keywords: ['慈悲', '宽容', '普世性', '给予', '宽广视野'],
      overview:
        '你的姓名中缺少数字9。你来到这里是为了培养慈悲、宽容与宽广的普世视野。你可能难以超越自身眼前的关切。',
      strengths: ['在服务他人中成长', '培养同理心', '学会普世之爱'],
      challenges: ['视野狭窄', '以自我为中心', '对更广泛人类缺乏同理心'],
      lifeLesson:
        '扩展你的关怀圈。你以开放的心付出越多，生活给你的回报就越丰盛。',
      compatibleNumbers: [3, 6, 9],
      careerSuggestions: ['任何需要人道主义服务与同理心的领域'],
      astrological: '木星与海王星影响',
    },
    vi: {
      title: 'Bài Học Nghiệp 9 — Phát Triển Lòng Trắc Ẩn',
      keywords: ['lòng trắc ẩn', 'khoan dung', 'phổ quát', 'cho đi', 'tầm nhìn rộng'],
      overview:
        'Số 9 vắng mặt trong tên của bạn. Bạn đến đây để phát triển lòng trắc ẩn, sự khoan dung và tầm nhìn phổ quát rộng lớn. Bạn có thể gặp khó khăn khi nhìn xa hơn những mối quan tâm trước mắt của bản thân.',
      strengths: ['Trưởng thành qua phụng sự người khác', 'Phát triển sự đồng cảm', 'Học tình yêu phổ quát'],
      challenges: ['Tầm nhìn hẹp', 'Tự cao', 'Thiếu đồng cảm với nhân loại rộng lớn hơn'],
      lifeLesson:
        'Mở rộng vòng tròn quan tâm của bạn. Bạn cho đi càng nhiều với tấm lòng rộng mở, cuộc sống sẽ trả lại cho bạn càng phong phú.',
      compatibleNumbers: [3, 6, 9],
      careerSuggestions: ['bất kỳ lĩnh vực nào đòi hỏi phụng sự nhân đạo và đồng cảm'],
      astrological: 'Ảnh hưởng Mộc Tinh và Hải Vương Tinh',
    },
  },
]

async function main() {
  await prisma.interpretation.deleteMany()

  const records = entries.flatMap((entry) => [
    { numberKey: entry.numberKey, locale: 'en', category: entry.category, baseText: JSON.stringify(entry.en) },
    { numberKey: entry.numberKey, locale: 'zh', category: entry.category, baseText: JSON.stringify(entry.zh) },
    { numberKey: entry.numberKey, locale: 'vi', category: entry.category, baseText: JSON.stringify(entry.vi) },
  ])

  await prisma.interpretation.createMany({ data: records })

  const core = entries.filter((e) => e.category === 'core')
  const master = entries.filter((e) => e.category === 'master')
  const karmicDebt = entries.filter((e) => e.category === 'karmic_debt')
  const karmicLesson = entries.filter((e) => e.category === 'karmic_lesson')

  console.log(`✓ Seeded ${records.length} interpretation records`)
  console.log(`  — ${core.length * 3} core (${core.length} keys × 3 locales)`)
  console.log(`  — ${master.length * 3} master (${master.length} keys × 3 locales)`)
  console.log(`  — ${karmicDebt.length * 3} karmic debt (${karmicDebt.length} keys × 3 locales)`)
  console.log(`  — ${karmicLesson.length * 3} karmic lesson (${karmicLesson.length} keys × 3 locales)`)

  // ── Practitioner account ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10)
  await prisma.user.upsert({
    where: { email: 'practitioner@numerology.com' },
    update: {},
    create: {
      email: 'practitioner@numerology.com',
      passwordHash,
      name: 'Your Name',
    },
  })
  console.log('✓ Seeded practitioner account (practitioner@numerology.com)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
