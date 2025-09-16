import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ar';

interface LanguageState {
  currentLanguage: Language;
  translations: Record<string, Record<string, string>>;
  isLoading: boolean;
  error: string | null;
}

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.upload': 'Upload Documents',
    'nav.search': 'Search & Query',
    'nav.compliance': 'Compliance',
    'nav.risk': 'Risk Assessment',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'GRC Document Management',
    'dashboard.welcome': 'Welcome to GRC Document Management System',
    'dashboard.totalDocuments': 'Total Documents',
    'dashboard.complianceStatus': 'Compliance Status',
    'dashboard.riskLevel': 'Risk Level',
    'dashboard.recentActivity': 'Recent Activity',
    
    // Upload
    'upload.title': 'Upload Documents',
    'upload.dragDrop': 'Drag and drop files here, or click to select',
    'upload.supportedFormats': 'Supported formats: PDF, DOCX, TXT, CSV, XLSX',
    'upload.uploading': 'Uploading...',
    'upload.success': 'Document uploaded successfully',
    'upload.error': 'Error uploading document',
    'upload.selectFiles': 'Select Files',
    'upload.upload': 'Upload',
    'upload.cancel': 'Cancel',
    
    // Search
    'search.title': 'Search & Query',
    'search.placeholder': 'Ask a question about your documents...',
    'search.search': 'Search',
    'search.results': 'Search Results',
    'search.noResults': 'No results found',
    'search.loading': 'Searching...',
    'search.askQuestion': 'Ask a Question',
    'search.answer': 'Answer',
    'search.sources': 'Sources',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.finish': 'Finish',
    
    // Theme
    'theme.light': 'Light Theme',
    'theme.dark': 'Dark Theme',
    'theme.auto': 'Auto Theme',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.japanese': '日本語',
    'language.korean': '한국어',
    'language.arabic': 'العربية',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel de Control',
    'nav.upload': 'Subir Documentos',
    'nav.search': 'Búsqueda y Consulta',
    'nav.compliance': 'Cumplimiento',
    'nav.risk': 'Evaluación de Riesgos',
    'nav.reports': 'Informes',
    'nav.settings': 'Configuración',
    
    // Dashboard
    'dashboard.title': 'Gestión de Documentos GRC',
    'dashboard.welcome': 'Bienvenido al Sistema de Gestión de Documentos GRC',
    'dashboard.totalDocuments': 'Total de Documentos',
    'dashboard.complianceStatus': 'Estado de Cumplimiento',
    'dashboard.riskLevel': 'Nivel de Riesgo',
    'dashboard.recentActivity': 'Actividad Reciente',
    
    // Upload
    'upload.title': 'Subir Documentos',
    'upload.dragDrop': 'Arrastra y suelta archivos aquí, o haz clic para seleccionar',
    'upload.supportedFormats': 'Formatos soportados: PDF, DOCX, TXT, CSV, XLSX',
    'upload.uploading': 'Subiendo...',
    'upload.success': 'Documento subido exitosamente',
    'upload.error': 'Error al subir documento',
    'upload.selectFiles': 'Seleccionar Archivos',
    'upload.upload': 'Subir',
    'upload.cancel': 'Cancelar',
    
    // Search
    'search.title': 'Búsqueda y Consulta',
    'search.placeholder': 'Haz una pregunta sobre tus documentos...',
    'search.search': 'Buscar',
    'search.results': 'Resultados de Búsqueda',
    'search.noResults': 'No se encontraron resultados',
    'search.loading': 'Buscando...',
    'search.askQuestion': 'Hacer una Pregunta',
    'search.answer': 'Respuesta',
    'search.sources': 'Fuentes',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.close': 'Cerrar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.confirm': 'Confirmar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.finish': 'Finalizar',
    
    // Theme
    'theme.light': 'Tema Claro',
    'theme.dark': 'Tema Oscuro',
    'theme.auto': 'Tema Automático',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.japanese': '日本語',
    'language.korean': '한국어',
    'language.arabic': 'العربية',
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de Bord',
    'nav.upload': 'Télécharger des Documents',
    'nav.search': 'Recherche et Requête',
    'nav.compliance': 'Conformité',
    'nav.risk': 'Évaluation des Risques',
    'nav.reports': 'Rapports',
    'nav.settings': 'Paramètres',
    
    // Dashboard
    'dashboard.title': 'Gestion de Documents GRC',
    'dashboard.welcome': 'Bienvenue dans le Système de Gestion de Documents GRC',
    'dashboard.totalDocuments': 'Total des Documents',
    'dashboard.complianceStatus': 'Statut de Conformité',
    'dashboard.riskLevel': 'Niveau de Risque',
    'dashboard.recentActivity': 'Activité Récente',
    
    // Upload
    'upload.title': 'Télécharger des Documents',
    'upload.dragDrop': 'Glissez-déposez les fichiers ici, ou cliquez pour sélectionner',
    'upload.supportedFormats': 'Formats supportés: PDF, DOCX, TXT, CSV, XLSX',
    'upload.uploading': 'Téléchargement...',
    'upload.success': 'Document téléchargé avec succès',
    'upload.error': 'Erreur lors du téléchargement du document',
    'upload.selectFiles': 'Sélectionner les Fichiers',
    'upload.upload': 'Télécharger',
    'upload.cancel': 'Annuler',
    
    // Search
    'search.title': 'Recherche et Requête',
    'search.placeholder': 'Posez une question sur vos documents...',
    'search.search': 'Rechercher',
    'search.results': 'Résultats de Recherche',
    'search.noResults': 'Aucun résultat trouvé',
    'search.loading': 'Recherche...',
    'search.askQuestion': 'Poser une Question',
    'search.answer': 'Réponse',
    'search.sources': 'Sources',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.close': 'Fermer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.confirm': 'Confirmer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.finish': 'Terminer',
    
    // Theme
    'theme.light': 'Thème Clair',
    'theme.dark': 'Thème Sombre',
    'theme.auto': 'Thème Automatique',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.japanese': '日本語',
    'language.korean': '한국어',
    'language.arabic': 'العربية',
  },
  de: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.upload': 'Dokumente Hochladen',
    'nav.search': 'Suche und Abfrage',
    'nav.compliance': 'Compliance',
    'nav.risk': 'Risikobewertung',
    'nav.reports': 'Berichte',
    'nav.settings': 'Einstellungen',
    
    // Dashboard
    'dashboard.title': 'GRC-Dokumentenverwaltung',
    'dashboard.welcome': 'Willkommen im GRC-Dokumentenverwaltungssystem',
    'dashboard.totalDocuments': 'Gesamte Dokumente',
    'dashboard.complianceStatus': 'Compliance-Status',
    'dashboard.riskLevel': 'Risikostufe',
    'dashboard.recentActivity': 'Aktuelle Aktivität',
    
    // Upload
    'upload.title': 'Dokumente Hochladen',
    'upload.dragDrop': 'Dateien hier ablegen oder klicken zum Auswählen',
    'upload.supportedFormats': 'Unterstützte Formate: PDF, DOCX, TXT, CSV, XLSX',
    'upload.uploading': 'Hochladen...',
    'upload.success': 'Dokument erfolgreich hochgeladen',
    'upload.error': 'Fehler beim Hochladen des Dokuments',
    'upload.selectFiles': 'Dateien Auswählen',
    'upload.upload': 'Hochladen',
    'upload.cancel': 'Abbrechen',
    
    // Search
    'search.title': 'Suche und Abfrage',
    'search.placeholder': 'Stellen Sie eine Frage zu Ihren Dokumenten...',
    'search.search': 'Suchen',
    'search.results': 'Suchergebnisse',
    'search.noResults': 'Keine Ergebnisse gefunden',
    'search.loading': 'Suchen...',
    'search.askQuestion': 'Frage Stellen',
    'search.answer': 'Antwort',
    'search.sources': 'Quellen',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.view': 'Anzeigen',
    'common.close': 'Schließen',
    'common.yes': 'Ja',
    'common.no': 'Nein',
    'common.confirm': 'Bestätigen',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.previous': 'Vorherige',
    'common.finish': 'Beenden',
    
    // Theme
    'theme.light': 'Helles Theme',
    'theme.dark': 'Dunkles Theme',
    'theme.auto': 'Automatisches Theme',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.japanese': '日本語',
    'language.korean': '한국어',
    'language.arabic': 'العربية',
  },
  zh: {
    // Navigation
    'nav.dashboard': '仪表板',
    'nav.upload': '上传文档',
    'nav.search': '搜索和查询',
    'nav.compliance': '合规性',
    'nav.risk': '风险评估',
    'nav.reports': '报告',
    'nav.settings': '设置',
    
    // Dashboard
    'dashboard.title': 'GRC文档管理系统',
    'dashboard.welcome': '欢迎使用GRC文档管理系统',
    'dashboard.totalDocuments': '总文档数',
    'dashboard.complianceStatus': '合规状态',
    'dashboard.riskLevel': '风险等级',
    'dashboard.recentActivity': '最近活动',
    
    // Upload
    'upload.title': '上传文档',
    'upload.dragDrop': '拖拽文件到此处，或点击选择',
    'upload.supportedFormats': '支持格式：PDF, DOCX, TXT, CSV, XLSX',
    'upload.uploading': '上传中...',
    'upload.success': '文档上传成功',
    'upload.error': '文档上传失败',
    'upload.selectFiles': '选择文件',
    'upload.upload': '上传',
    'upload.cancel': '取消',
    
    // Search
    'search.title': '搜索和查询',
    'search.placeholder': '询问关于您文档的问题...',
    'search.search': '搜索',
    'search.results': '搜索结果',
    'search.noResults': '未找到结果',
    'search.loading': '搜索中...',
    'search.askQuestion': '提问',
    'search.answer': '答案',
    'search.sources': '来源',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.view': '查看',
    'common.close': '关闭',
    'common.yes': '是',
    'common.no': '否',
    'common.confirm': '确认',
    'common.back': '返回',
    'common.next': '下一步',
    'common.previous': '上一步',
    'common.finish': '完成',
    
    // Theme
    'theme.light': '浅色主题',
    'theme.dark': '深色主题',
    'theme.auto': '自动主题',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.japanese': '日本語',
    'language.korean': '한국어',
    'language.arabic': 'العربية',
  },
  ja: {
    // Navigation
    'nav.dashboard': 'ダッシュボード',
    'nav.upload': 'ドキュメントアップロード',
    'nav.search': '検索とクエリ',
    'nav.compliance': 'コンプライアンス',
    'nav.risk': 'リスク評価',
    'nav.reports': 'レポート',
    'nav.settings': '設定',
    
    // Dashboard
    'dashboard.title': 'GRCドキュメント管理',
    'dashboard.welcome': 'GRCドキュメント管理システムへようこそ',
    'dashboard.totalDocuments': '総ドキュメント数',
    'dashboard.complianceStatus': 'コンプライアンス状況',
    'dashboard.riskLevel': 'リスクレベル',
    'dashboard.recentActivity': '最近のアクティビティ',
    
    // Upload
    'upload.title': 'ドキュメントアップロード',
    'upload.dragDrop': 'ファイルをここにドラッグ&ドロップするか、クリックして選択',
    'upload.supportedFormats': 'サポート形式：PDF, DOCX, TXT, CSV, XLSX',
    'upload.uploading': 'アップロード中...',
    'upload.success': 'ドキュメントが正常にアップロードされました',
    'upload.error': 'ドキュメントのアップロードエラー',
    'upload.selectFiles': 'ファイルを選択',
    'upload.upload': 'アップロード',
    'upload.cancel': 'キャンセル',
    
    // Search
    'search.title': '検索とクエリ',
    'search.placeholder': 'ドキュメントについて質問してください...',
    'search.search': '検索',
    'search.results': '検索結果',
    'search.noResults': '結果が見つかりません',
    'search.loading': '検索中...',
    'search.askQuestion': '質問する',
    'search.answer': '回答',
    'search.sources': 'ソース',
    
    // Common
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.view': '表示',
    'common.close': '閉じる',
    'common.yes': 'はい',
    'common.no': 'いいえ',
    'common.confirm': '確認',
    'common.back': '戻る',
    'common.next': '次へ',
    'common.previous': '前へ',
    'common.finish': '完了',
    
    // Theme
    'theme.light': 'ライトテーマ',
    'theme.dark': 'ダークテーマ',
    'theme.auto': '自動テーマ',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.japanese': '日本語',
    'language.korean': '한국어',
    'language.arabic': 'العربية',
  },
  ko: {
    // Navigation
    'nav.dashboard': '대시보드',
    'nav.upload': '문서 업로드',
    'nav.search': '검색 및 쿼리',
    'nav.compliance': '컴플라이언스',
    'nav.risk': '위험 평가',
    'nav.reports': '보고서',
    'nav.settings': '설정',
    
    // Dashboard
    'dashboard.title': 'GRC 문서 관리',
    'dashboard.welcome': 'GRC 문서 관리 시스템에 오신 것을 환영합니다',
    'dashboard.totalDocuments': '총 문서 수',
    'dashboard.complianceStatus': '컴플라이언스 상태',
    'dashboard.riskLevel': '위험 수준',
    'dashboard.recentActivity': '최근 활동',
    
    // Upload
    'upload.title': '문서 업로드',
    'upload.dragDrop': '파일을 여기에 드래그 앤 드롭하거나 클릭하여 선택',
    'upload.supportedFormats': '지원 형식: PDF, DOCX, TXT, CSV, XLSX',
    'upload.uploading': '업로드 중...',
    'upload.success': '문서가 성공적으로 업로드되었습니다',
    'upload.error': '문서 업로드 오류',
    'upload.selectFiles': '파일 선택',
    'upload.upload': '업로드',
    'upload.cancel': '취소',
    
    // Search
    'search.title': '검색 및 쿼리',
    'search.placeholder': '문서에 대해 질문하세요...',
    'search.search': '검색',
    'search.results': '검색 결과',
    'search.noResults': '결과를 찾을 수 없습니다',
    'search.loading': '검색 중...',
    'search.askQuestion': '질문하기',
    'search.answer': '답변',
    'search.sources': '소스',
    
    // Common
    'common.loading': '로딩 중...',
    'common.error': '오류',
    'common.success': '성공',
    'common.cancel': '취소',
    'common.save': '저장',
    'common.delete': '삭제',
    'common.edit': '편집',
    'common.view': '보기',
    'common.close': '닫기',
    'common.yes': '예',
    'common.no': '아니오',
    'common.confirm': '확인',
    'common.back': '뒤로',
    'common.next': '다음',
    'common.previous': '이전',
    'common.finish': '완료',
    
    // Theme
    'theme.light': '라이트 테마',
    'theme.dark': '다크 테마',
    'theme.auto': '자동 테마',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.japanese': '日本語',
    'language.korean': '한국어',
    'language.arabic': 'العربية',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.upload': 'رفع المستندات',
    'nav.search': 'البحث والاستعلام',
    'nav.compliance': 'الامتثال',
    'nav.risk': 'تقييم المخاطر',
    'nav.reports': 'التقارير',
    'nav.settings': 'الإعدادات',
    
    // Dashboard
    'dashboard.title': 'إدارة مستندات GRC',
    'dashboard.welcome': 'مرحباً بك في نظام إدارة مستندات GRC',
    'dashboard.totalDocuments': 'إجمالي المستندات',
    'dashboard.complianceStatus': 'حالة الامتثال',
    'dashboard.riskLevel': 'مستوى المخاطر',
    'dashboard.recentActivity': 'النشاط الأخير',
    
    // Upload
    'upload.title': 'رفع المستندات',
    'upload.dragDrop': 'اسحب وأفلت الملفات هنا، أو انقر للاختيار',
    'upload.supportedFormats': 'الصيغ المدعومة: PDF, DOCX, TXT, CSV, XLSX',
    'upload.uploading': 'جاري الرفع...',
    'upload.success': 'تم رفع المستند بنجاح',
    'upload.error': 'خطأ في رفع المستند',
    'upload.selectFiles': 'اختيار الملفات',
    'upload.upload': 'رفع',
    'upload.cancel': 'إلغاء',
    
    // Search
    'search.title': 'البحث والاستعلام',
    'search.placeholder': 'اطرح سؤالاً حول مستنداتك...',
    'search.search': 'بحث',
    'search.results': 'نتائج البحث',
    'search.noResults': 'لم يتم العثور على نتائج',
    'search.loading': 'جاري البحث...',
    'search.askQuestion': 'اطرح سؤالاً',
    'search.answer': 'الإجابة',
    'search.sources': 'المصادر',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.close': 'إغلاق',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.confirm': 'تأكيد',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.finish': 'إنهاء',
    
    // Theme
    'theme.light': 'المظهر الفاتح',
    'theme.dark': 'المظهر الداكن',
    'theme.auto': 'المظهر التلقائي',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.chinese': '中文',
    'language.japanese': '日本語',
    'language.korean': '한국어',
    'language.arabic': 'العربية',
  },
};

const initialState: LanguageState = {
  currentLanguage: 'en',
  translations,
  isLoading: false,
  error: null,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.currentLanguage = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    initializeLanguage: (state) => {
      // Initialize language based on browser preference
      const browserLang = navigator.language.split('-')[0];
      const supportedLanguages: Language[] = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar'];
      if (supportedLanguages.includes(browserLang as Language)) {
        state.currentLanguage = browserLang as Language;
      }
    },
  },
});

export const { setLanguage, setLoading, setError, initializeLanguage } = languageSlice.actions;
export default languageSlice.reducer;
