import { useState } from 'react';

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface Step {
  id: number;
  title: string;
  icon: string;
  time: string;
  difficulty: string;
  description: string;
  actions: string[];
  checklist: ChecklistItem[];
  screenshots?: string[];
  code?: string;
  tip?: string;
  warning?: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Регистрация аккаунта разработчика',
    icon: '📜',
    time: '5 минут',
    difficulty: 'Легко',
    description: 'Создайте аккаунт разработчика на платформе Яндекс Игр. Это бесплатно и займёт всего несколько минут.',
    actions: [
      'Перейдите на сайт games.yandex.ru',
      'Нажмите кнопку «Войти» в правом верхнем углу',
      'Войдите через существующий Яндекс-аккаунт или создайте новый',
      'Перейдите по ссылке yandex.ru/games/dev',
      'Заполните профиль разработчика: имя студии или ваше имя',
      'Укажите контактный email для связи',
      'Примите пользовательское соглашение',
    ],
    checklist: [
      { id: '1-1', text: 'Аккаунт Яндекс создан', done: false },
      { id: '1-2', text: 'Вошёл в консоль разработчика', done: false },
      { id: '1-3', text: 'Заполнил профиль разработчика', done: false },
      { id: '1-4', text: 'Принял соглашение', done: false },
    ],
    tip: 'Для получения выплат потребуется статус самозанятого или ИП. Физические лица могут публиковать игры, но выплаты будут с задержкой и через посредника.',
  },
  {
    id: 2,
    title: 'Создание страницы игры',
    icon: '🏰',
    time: '15 минут',
    difficulty: 'Легко',
    description: 'Создайте страницу вашей игры в консоли разработчика и заполните основную информацию.',
    actions: [
      'В консоли разработчика нажмите «Добавить игру»',
      'Введите название: Loot Hunter Stories',
      'Выберите жанр: RPG → Idle',
      'Укажите платформу: HTML5',
      'Выберите ориентацию: Ландшафтная',
      'Установите возрастное ограничение: 6+',
      'Добавьте языки: Русский (основной)',
    ],
    checklist: [
      { id: '2-1', text: 'Создана страница игры', done: false },
      { id: '2-2', text: 'Указано название Loot Hunter Stories', done: false },
      { id: '2-3', text: 'Выбран жанр RPG/Idle', done: false },
      { id: '2-4', text: 'Установлена ориентация', done: false },
      { id: '2-5', text: 'Указаны языки', done: false },
    ],
    tip: 'Название игры — первое, что видят игроки. «Loot Hunter Stories» хорошо отражает суть: охота за лутом + нарратив.',
  },
  {
    id: 3,
    title: 'Заполнение описания и тегов',
    icon: '📝',
    time: '10 минут',
    difficulty: 'Легко',
    description: 'Напишите привлекательное описание игры и добавьте правильные теги для поиска.',
    actions: [
      'Скопируйте краткое описание (до 70 символов)',
      'Скопируйте полное описание в соответствующее поле',
      'Добавьте теги: фэнтези, средневековье, лут, прокачка, idle, rpg, боссы',
      'Укажите особенности игры',
      'Добавьте информацию о рекламе (опционально)',
    ],
    checklist: [
      { id: '3-1', text: 'Заполнено краткое описание', done: false },
      { id: '3-2', text: 'Заполнено полное описание', done: false },
      { id: '3-3', text: 'Добавлены теги', done: false },
      { id: '3-4', text: 'Указаны особенности', done: false },
    ],
    tip: 'Краткое описание видно в поиске и каталоге. Сделайте его цепляющим: «Средневековая RPG с бесконечным лутом и боссами» — чётко и по делу.',
  },
  {
    id: 4,
    title: 'Подготовка медиа-файлов',
    icon: '🎨',
    time: '30-60 минут',
    difficulty: 'Средне',
    description: 'Создайте иконку, скриншоты и обложку для витрины. Это критически важно для привлечения игроков.',
    actions: [
      'Создайте иконку 512x512 px в PNG формате',
      'Сделайте 5 скриншотов геймплея (1920x1080)',
      'Создайте обложку для витрины (1920x1080)',
      'Загрузите все файлы в консоль разработчика',
      'Проверьте как они выглядят в превью',
    ],
    checklist: [
      { id: '4-1', text: 'Иконка 512x512 готова', done: false },
      { id: '4-2', text: 'Скриншот 1: Бой с боссом', done: false },
      { id: '4-3', text: 'Скриншот 2: Инвентарь с лутом', done: false },
      { id: '4-4', text: 'Скриншот 3: Характеристики', done: false },
      { id: '4-5', text: 'Скриншот 4: Торговля с NPC', done: false },
      { id: '4-6', text: 'Скриншот 5: Лидерборд', done: false },
      { id: '4-7', text: 'Обложка витрины готова', done: false },
      { id: '4-8', text: 'Все файлы загружены', done: false },
    ],
    tip: 'Иконка должна быть читаемой в размере 64x64. Используйте контрастные цвета и чёткие силуэты. Золотой меч на коричневом фоне — идеально для нашей игры.',
    screenshots: [
      '🖼️ Иконка: Меч и щит на пергаменте (512x512)',
      '🖼️ Скриншот 1: Эпическая битва с боссом',
      '🖼️ Скриншот 2: Инвентарь с легендарными предметами',
      '🖼️ Скриншот 3: Экран характеристик с сетами',
      '🖼️ Скриншот 4: Торговцы и rewarded-награды',
      '🖼️ Скриншот 5: Таблица лидеров',
      '🖼️ Обложка: Герой с лутом на фоне замка',
    ],
  },
  {
    id: 5,
    title: 'Настройка лидербордов',
    icon: '🏆',
    time: '5 минут',
    difficulty: 'Легко',
    description: 'Создайте таблицы лидеров в консоли разработчика. Код для отправки рекордов уже реализован в игре.',
    actions: [
      'В консоли разработчика перейдите в раздел «Лидерборды»',
      'Нажмите «Создать лидерборд»',
      'Создайте первый лидерборд с ID: main',
      'Создайте второй лидерборд с ID: zone',
      'Проверьте что оба лидерборда активны',
    ],
    checklist: [
      { id: '5-1', text: 'Создан лидерборд "main" (уровень)', done: false },
      { id: '5-2', text: 'Создан лидерборд "zone" (зона)', done: false },
      { id: '5-3', text: 'Оба лидерборда активны', done: false },
    ],
    code: `// Лидерборд "main"
Название: Лучший уровень
ID: main
Тип: Числовой
Сортировка: По убыванию
Описание: Максимальный уровень персонажа

// Лидерборд "zone"
Название: Максимальная зона
ID: zone
Тип: Числовой
Сортировка: По убыванию
Описание: Максимальная достигнутая зона`,
    tip: 'Игра автоматически отправляет рекорды при повышении уровня и достижении новой зоны. Вам нужно только создать лидерборды с правильными ID.',
  },
  {
    id: 6,
    title: 'Сборка ZIP-архива',
    icon: '📦',
    time: '2 минуты',
    difficulty: 'Легко',
    description: 'Соберите проект и создайте ZIP-архив для загрузки на платформу.',
    actions: [
      'Откройте терминал в папке проекта',
      'Запустите скрипт сборки (или выполните команды вручную)',
      'Дождитесь окончания сборки',
      'Проверьте что архив создан и имеет размер < 50 МБ',
      'Убедитесь что в архиве есть index.html',
    ],
    checklist: [
      { id: '6-1', text: 'Выполнена команда npm run build', done: false },
      { id: '6-2', text: 'Создан архив loot-hunter-stories.zip', done: false },
      { id: '6-3', text: 'Размер архива < 50 МБ', done: false },
      { id: '6-4', text: 'В архиве есть index.html', done: false },
    ],
    code: `# Linux/Mac:
chmod +x build-yandex.sh
./build-yandex.sh

# Windows:
build-yandex.bat

# Вручную (любая ОС):
npm run build
cd dist
zip -r ../loot-hunter-stories.zip .
cd ..

# Проверка размера:
ls -lh loot-hunter-stories.zip`,
    warning: 'Максимальный размер архива — 50 МБ. Если ваш архив больше, удалите неиспользуемые ресурсы или оптимизируйте изображения.',
  },
  {
    id: 7,
    title: 'Загрузка игры на платформу',
    icon: '🚀',
    time: '5-10 минут',
    difficulty: 'Легко',
    description: 'Загрузите ZIP-архив в консоль разработчика и дождитесь обработки.',
    actions: [
      'В консоли разработчика откройте вашу игру',
      'Перейдите в раздел «Версии»',
      'Нажмите «Загрузить версию»',
      'Выберите файл loot-hunter-stories.zip',
      'Дождитесь загрузки и проверки файлов',
      'Убедитесь что нет ошибок валидации',
    ],
    checklist: [
      { id: '7-1', text: 'Открыт раздел «Версии»', done: false },
      { id: '7-2', text: 'Загружен ZIP-архив', done: false },
      { id: '7-3', text: 'Файлы проверены без ошибок', done: false },
      { id: '7-4', text: 'Версия создана', done: false },
    ],
    tip: 'После загрузки Яндекс автоматически проверит структуру архива. Если есть ошибки (например, нет index.html), они будут показаны в интерфейсе.',
  },
  {
    id: 8,
    title: 'Тестирование на платформе',
    icon: '🧪',
    time: '30-60 минут',
    difficulty: 'Средне',
    description: 'Протестируйте игру на платформе Яндекс Игр перед отправкой на модерацию.',
    actions: [
      'Добавьте себя и друзей в список тестеров',
      'Откройте игру через превью в консоли',
      'Протестируйте все основные функции',
      'Проверьте работу сохранений',
      'Проверьте отображение рекламы',
      'Проверьте лидерборды',
      'Протестируйте на мобильном устройстве',
    ],
    checklist: [
      { id: '8-1', text: 'Добавлены тестеры', done: false },
      { id: '8-2', text: 'Игра запускается без ошибок', done: false },
      { id: '8-3', text: 'Бой работает корректно', done: false },
      { id: '8-4', text: 'Лут выпадает и экипируется', done: false },
      { id: '8-5', text: 'Сохранения работают (перезагрузите страницу)', done: false },
      { id: '8-6', text: 'Rewarded реклама показывает награду', done: false },
      { id: '8-7', text: 'Interstitial показывается при смене зоны', done: false },
      { id: '8-8', text: 'Лидерборды отправляют рекорды', done: false },
      { id: '8-9', text: 'Ежедневная награда работает', done: false },
      { id: '8-10', text: 'Протестировано на мобильном', done: false },
    ],
    warning: 'Обязательно протестируйте игру на мобильном устройстве! Большинство игроков Яндекс Игр играют с телефонов.',
  },
  {
    id: 9,
    title: 'Отправка на модерацию',
    icon: '📮',
    time: '5 минут + ожидание',
    difficulty: 'Легко',
    description: 'Отправьте игру на проверку модераторами Яндекс Игр.',
    actions: [
      'Убедитесь что все поля заполнены',
      'Проверьте что все медиа-файлы загружены',
      'Проверьте что лидерборды созданы',
      'Нажмите «Отправить на модерацию»',
      'Дождитесь ответа модераторов (1-5 дней)',
    ],
    checklist: [
      { id: '9-1', text: 'Все поля описания заполнены', done: false },
      { id: '9-2', text: 'Иконка загружена', done: false },
      { id: '9-3', text: 'Скриншоты загружены (3-5 шт)', done: false },
      { id: '9-4', text: 'Обложка витрины загружена', done: false },
      { id: '9-5', text: 'Лидерборды созданы', done: false },
      { id: '9-6', text: 'Игра протестирована', done: false },
      { id: '9-7', text: 'Отправлено на модерацию', done: false },
    ],
    tip: 'Частые причины отказа: баги, неадаптивный интерфейс, отсутствие SDK, нарушение правил платформы. Наша игра готова по всем пунктам!',
  },
  {
    id: 10,
    title: 'После публикации — развитие',
    icon: '🌟',
    time: 'Постоянно',
    difficulty: 'Средне',
    description: 'После одобрения игры начинайте привлекать игроков и улучшать монетизацию.',
    actions: [
      'Следите за аналитикой в консоли разработчика',
      'Отвечайте на отзывы игроков',
      'Регулярно обновляйте контент',
      'Добавляйте новые механики',
      'Оптимизируйте точки монетизации',
      'Проводите A/B тесты',
    ],
    checklist: [
      { id: '10-1', text: 'Игра одобрена и опубликована', done: false },
      { id: '10-2', text: 'Настроена аналитика', done: false },
      { id: '10-3', text: 'План обновлений на месяц', done: false },
      { id: '10-4', text: 'Мониторинг отзывов', done: false },
    ],
    tip: 'Игры с регулярными обновлениями получают в 3-5 раз больше показов от алгоритмов Яндекс Игр. Планируйте обновления минимум раз в 2 недели.',
  },
];

function App() {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  const toggleChecklist = (id: string) => {
    setChecklistState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalChecks = STEPS.reduce((sum, step) => sum + step.checklist.length, 0);
  const completedChecks = Object.values(checklistState).filter(Boolean).length;
  const progress = Math.round((completedChecks / totalChecks) * 100);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Легко': return '#6b8e4e';
      case 'Средне': return '#d4a843';
      case 'Сложно': return '#c0392b';
      default: return '#8b7355';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1208', fontFamily: "'Crimson Text', Georgia, serif", color: '#e8dcc4' }}>
      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-wider mb-2" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
              ⚔️ Loot Hunter Stories
            </h1>
            <div className="my-3" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #8b6234, #b8860b, #8b6234, transparent)' }} />
            <p className="text-xl" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
              📜 ПОШАГОВОЕ РАЗМЕЩЕНИЕ НА ЯНДЕКС ИГРАХ
            </p>
            <p className="text-sm mt-2" style={{ color: '#8b7355' }}>
              Полная инструкция от регистрации до публикации
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: '#8b7355' }}>
              <span>Общий прогресс</span>
              <span>{completedChecks} / {totalChecks} ({progress}%)</span>
            </div>
            <div className="h-3 rounded overflow-hidden" style={{ backgroundColor: '#0d0a04', border: '1px solid #5c3d1e' }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(180deg, #b8860b 0%, #8b6234 100%)'
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Шагов', value: '10', icon: '📋', color: '#d4a843' },
            { label: 'Время', value: '2-3 часа', icon: '⏳', color: '#6b8e4e' },
            { label: 'Стоимость', value: '0 ₽', icon: '💰', color: '#f0c75e' },
            { label: 'Сложность', value: 'Средняя', icon: '⚡', color: '#e67e22' },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border-2 p-3 text-center" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs" style={{ color: '#8b7355' }}>{item.label}</div>
              <div className="text-lg font-bold" style={{ color: item.color, fontFamily: "'Cinzel', serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Start */}
        <div className="rounded-xl border-2 p-4 mb-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b' }}>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
            <span>⚡</span> Быстрый старт
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#d4a843' }}>1. Регистрация</div>
              <div style={{ color: '#8b7355' }}>games.yandex.ru → Консоль разработчика</div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#d4a843' }}>2. Сборка</div>
              <div style={{ color: '#8b7355' }}>./build-yandex.sh или build-yandex.bat</div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#d4a843' }}>3. Загрузка</div>
              <div style={{ color: '#8b7355' }}>Загрузите ZIP → Отправьте на модерацию</div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map(step => {
            const stepChecks = step.checklist.filter(c => checklistState[c.id]).length;
            const stepTotal = step.checklist.length;
            const stepProgress = stepTotal > 0 ? (stepChecks / stepTotal) * 100 : 0;

            return (
              <div
                key={step.id}
                className="rounded-xl border-2 overflow-hidden"
                style={{
                  backgroundColor: '#2a1f0e',
                  borderColor: expandedStep === step.id ? '#b8860b' : '#5c3d1e',
                  boxShadow: expandedStep === step.id ? '0 0 20px rgba(184,134,11,0.2)' : 'none',
                }}
              >
                {/* Step Header */}
                <button
                  onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                  className="w-full p-4 flex items-center gap-4 text-left transition-all"
                  style={{ backgroundColor: expandedStep === step.id ? '#3d2d14' : 'transparent' }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 relative"
                    style={{
                      background: 'linear-gradient(135deg, #8b6234 0%, #5c3d1e 100%)',
                      border: '2px solid #b8860b',
                      color: '#f0c75e',
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    {step.icon}
                    {stepProgress === 100 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#6b8e4e', color: '#fff' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1a1208', color: '#b8860b' }}>
                        ШАГ {step.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1a1208', color: getDifficultyColor(step.difficulty) }}>
                        {step.difficulty}
                      </span>
                      <span className="text-xs" style={{ color: '#8b7355' }}>⏱️ {step.time}</span>
                      {stepTotal > 0 && (
                        <span className="text-xs" style={{ color: '#8b7355' }}>
                          ✅ {stepChecks}/{stepTotal}
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold mt-1" style={{ color: '#e8dcc4', fontFamily: "'Cinzel', serif" }}>
                      {step.title}
                    </div>
                    {stepTotal > 0 && (
                      <div className="mt-2 h-1.5 rounded overflow-hidden" style={{ backgroundColor: '#0d0a04' }}>
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${stepProgress}%`,
                            backgroundColor: stepProgress === 100 ? '#6b8e4e' : '#b8860b'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-2xl transition-transform" style={{ color: '#b8860b', transform: expandedStep === step.id ? 'rotate(180deg)' : 'rotate(0)' }}>
                    ▼
                  </div>
                </button>

                {/* Step Content */}
                {expandedStep === step.id && (
                  <div className="p-4 border-t-2" style={{ borderColor: '#5c3d1e' }}>
                    {/* Description */}
                    <p className="mb-4" style={{ color: '#a89880' }}>{step.description}</p>

                    {/* Actions */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
                        <span>📌</span> ДЕЙСТВИЯ
                      </h4>
                      <ol className="space-y-2">
                        {step.actions.map((action, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="font-bold shrink-0" style={{ color: '#b8860b' }}>{i + 1}.</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Code */}
                    {step.code && (
                      <div className="mb-4 rounded-lg border overflow-hidden" style={{ borderColor: '#5c3d1e' }}>
                        <div className="px-3 py-1.5 text-xs" style={{ backgroundColor: '#3d2d14', color: '#b8860b', fontFamily: "'Cinzel', serif" }}>
                          💻 КОД / КОМАНДЫ
                        </div>
                        <pre className="p-3 text-xs overflow-x-auto" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* Screenshots */}
                    {step.screenshots && (
                      <div className="mb-4">
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
                          <span>🖼️</span> НЕОБХОДИМЫЕ ИЗОБРАЖЕНИЯ
                        </h4>
                        <ul className="space-y-1">
                          {step.screenshots.map((s, i) => (
                            <li key={i} className="text-sm" style={{ color: '#a89880' }}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Checklist */}
                    {step.checklist.length > 0 && (
                      <div className="mb-4 rounded-lg border-2 p-3" style={{ backgroundColor: '#1a1208', borderColor: '#5c3d1e' }}>
                        <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
                          <span>✅</span> ЧЕК-ЛИСТ ({stepChecks}/{stepTotal})
                        </h4>
                        <div className="space-y-2">
                          {step.checklist.map(item => (
                            <label key={item.id} className="flex items-center gap-3 cursor-pointer hover:bg-black/20 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={!!checklistState[item.id]}
                                onChange={() => toggleChecklist(item.id)}
                                className="w-5 h-5 rounded cursor-pointer accent-amber-600"
                                style={{ accentColor: '#b8860b' }}
                              />
                              <span style={{
                                color: checklistState[item.id] ? '#6b8e4e' : '#a89880',
                                textDecoration: checklistState[item.id] ? 'line-through' : 'none',
                              }}>
                                {item.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tip */}
                    {step.tip && (
                      <div className="rounded-lg border-2 p-3 mb-3" style={{ backgroundColor: 'rgba(107,142,78,0.1)', borderColor: '#6b8e4e' }}>
                        <div className="flex gap-2">
                          <span className="text-lg">💡</span>
                          <div>
                            <div className="text-xs font-bold mb-1" style={{ color: '#6b8e4e', fontFamily: "'Cinzel', serif" }}>СОВЕТ</div>
                            <div className="text-sm" style={{ color: '#e8dcc4' }}>{step.tip}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Warning */}
                    {step.warning && (
                      <div className="rounded-lg border-2 p-3" style={{ backgroundColor: 'rgba(192,57,43,0.1)', borderColor: '#c0392b' }}>
                        <div className="flex gap-2">
                          <span className="text-lg">⚠️</span>
                          <div>
                            <div className="text-xs font-bold mb-1" style={{ color: '#c0392b', fontFamily: "'Cinzel', serif" }}>ВНИМАНИЕ</div>
                            <div className="text-sm" style={{ color: '#e8dcc4' }}>{step.warning}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final Summary */}
        <div className="mt-8 rounded-xl border-2 p-6 text-center" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b' }}>
          <div className="text-4xl mb-3">⚜️</div>
          <h3 className="text-2xl font-bold mb-3" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
            ПУТЬ ОХОТНИКА ЗА СЛАВОЙ
          </h3>
          <p className="mb-4" style={{ color: '#8b7355' }}>
            Пройдите все 10 шагов и ваша игра покорит Яндекс Игры!
          </p>
          <div className="my-4" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #8b6234, #b8860b, #8b6234, transparent)' }} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-3xl mb-2">📜</div>
              <div className="font-bold" style={{ color: '#d4a843' }}>Регистрация</div>
              <div style={{ color: '#8b7355' }}>Создайте аккаунт</div>
            </div>
            <div>
              <div className="text-3xl mb-2">📦</div>
              <div className="font-bold" style={{ color: '#d4a843' }}>Сборка</div>
              <div style={{ color: '#8b7355' }}>Соберите ZIP</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-bold" style={{ color: '#d4a843' }}>Загрузка</div>
              <div style={{ color: '#8b7355' }}>Загрузите на платформу</div>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <div className="font-bold" style={{ color: '#d4a843' }}>Доход</div>
              <div style={{ color: '#8b7355' }}>Получайте выплаты</div>
            </div>
          </div>
        </div>

        {/* Useful Links */}
        <div className="mt-6 rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>🔗 Полезные ссылки</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <a href="https://games.yandex.ru" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg border transition-colors hover:border-amber-600" style={{ backgroundColor: '#1a1208', borderColor: '#5c3d1e', color: '#e8dcc4' }}>
              <div className="font-bold" style={{ color: '#f0c75e' }}>🎮 Яндекс Игры</div>
              <div className="text-xs" style={{ color: '#8b7355' }}>games.yandex.ru</div>
            </a>
            <a href="https://yandex.ru/games/dev" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg border transition-colors hover:border-amber-600" style={{ backgroundColor: '#1a1208', borderColor: '#5c3d1e', color: '#e8dcc4' }}>
              <div className="font-bold" style={{ color: '#f0c75e' }}>⚙️ Консоль разработчика</div>
              <div className="text-xs" style={{ color: '#8b7355' }}>yandex.ru/games/dev</div>
            </a>
            <a href="https://yandex.ru/dev/games/doc/ru/sdk/sdk-about" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg border transition-colors hover:border-amber-600" style={{ backgroundColor: '#1a1208', borderColor: '#5c3d1e', color: '#e8dcc4' }}>
              <div className="font-bold" style={{ color: '#f0c75e' }}>📚 Документация SDK</div>
              <div className="text-xs" style={{ color: '#8b7355' }}>SDK Reference</div>
            </a>
            <a href="https://yandex.ru/dev/games/doc/ru/rules" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg border transition-colors hover:border-amber-600" style={{ backgroundColor: '#1a1208', borderColor: '#5c3d1e', color: '#e8dcc4' }}>
              <div className="font-bold" style={{ color: '#f0c75e' }}>📜 Правила платформы</div>
              <div className="text-xs" style={{ color: '#8b7355' }}>Требования к играм</div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-4 text-xs" style={{ color: '#5c3d1e' }}>
          © Loot Hunter Stories • Пошаговое руководство по публикации на Яндекс Играх
        </div>
      </div>
    </div>
  );
}

export default App;
