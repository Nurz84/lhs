import { useState } from 'react';

interface Step {
  id: number;
  title: string;
  icon: string;
  sections: {
    subtitle: string;
    content: string[];
    code?: string;
    tip?: string;
  }[];
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Регистрация разработчика',
    icon: '📜',
    sections: [
      {
        subtitle: 'Создание аккаунта',
        content: [
          'Перейдите на games.yandex.ru и войдите через Яндекс-аккаунт',
          'Откройте раздел «Консоль разработчика» (yandex.ru/games/console)',
          'Заполните профиль разработчика: имя, описание, контакты',
          'Примите соглашение о публикации игр на платформе',
          'Верификация занимает от 1 до 3 рабочих дней',
        ],
        tip: 'Для монетизации потребуется статус самозанятого или ИП. Физические лица тоже могут публиковать, но с ограничениями по выплатам.',
      },
      {
        subtitle: 'Требования к игре',
        content: [
          'Игра должна работать в браузере (HTML5 + JavaScript)',
          'Размер загружаемого архива — до 50 МБ (без внешних ресурсов)',
          'Обязательная интеграция Yandex Games SDK',
          'Адаптивный интерфейс для мобильных и десктопных устройств',
          'Отсутствие сторонней рекламы и ссылок',
          'Поддержка русского языка (желательно — других языков)',
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Подготовка сборки',
    icon: '🔨',
    sections: [
      {
        subtitle: 'Сборка проекта',
        content: [
          'Выполните команду npm run build в корне проекта',
          'Проверьте, что в папке dist/ есть index.html и assets/',
          'Все пути должны быть относительными (не абсолютными)',
          'Убедитесь, что игра работает локально через любой HTTP-сервер',
          'Заархивируйте папку dist/ в ZIP-файл',
        ],
        code: 'npm run build\nzip -r loot-hunter-stories.zip dist/',
        tip: 'Яндекс не поддерживает загрузку по FTP или Git — только ZIP-архив через консоль разработчика.',
      },
      {
        subtitle: 'Проверка перед загрузкой',
        content: [
          'Протестируйте игру в разных браузерах (Chrome, Firefox, Safari)',
          'Проверьте работу на мобильных устройствах',
          'Убедитесь, что нет консольных ошибок',
          'Проверьте производительность (цель: 60 FPS)',
          'Протестируйте сохранение прогресса',
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Интеграция Yandex Games SDK',
    icon: '⚙️',
    sections: [
      {
        subtitle: 'Подключение SDK',
        content: [
          'Добавьте скрипт SDK в index.html перед основным скриптом',
          'SDK загружается с CDN Яндекса автоматически',
          'Инициализация происходит асинхронно — дождитесь события ready',
        ],
        code: `<!-- В <head> файла index.html -->
<script src="/sdk.js"></script>`,
        tip: 'Файл sdk.js автоматически подменяется Яндексом на их CDN при загрузке игры на платформу. Локально он не работает — это нормально.',
      },
      {
        subtitle: 'Инициализация SDK',
        content: [
          'Вызовите YaGames.init() при загрузке игры',
          'Сохраните полученный объект player и environment',
          'Обработайте возможные ошибки инициализации',
        ],
        code: `// src/yandexSdk.ts
export class YandexSDK {
  private static ysdk: any = null;
  private static player: any = null;

  static async init() {
    try {
      this.ysdk = await YaGames.init();
      this.player = await this.ysdk.getPlayer();
      console.log('SDK инициализирован');
      return true;
    } catch (e) {
      console.error('Ошибка SDK:', e);
      return false;
    }
  }

  static getSDK() { return this.ysdk; }
  static getPlayer() { return this.player; }
}`,
      },
    ],
  },
  {
    id: 4,
    title: 'Сохранение прогресса',
    icon: '💾',
    sections: [
      {
        subtitle: 'Облачные сохранения',
        content: [
          'Яндекс предоставляет облачное хранилище для каждого игрока',
          'Данные привязываются к аккаунту — доступны на всех устройствах',
          'Максимальный размер — 100 КБ на игрока',
          'Сохраняйте только ключевые данные (уровень, золото, инвентарь)',
        ],
        code: `// Сохранение данных
export async function saveProgress(data: any) {
  const player = YandexSDK.getPlayer();
  if (!player) return;
  
  try {
    await player.setData({
      gameData: JSON.stringify(data),
      timestamp: Date.now()
    });
  } catch (e) {
    console.error('Ошибка сохранения:', e);
  }
}

// Загрузка данных
export async function loadProgress() {
  const player = YandexSDK.getPlayer();
  if (!player) return null;
  
  try {
    const data = await player.getData(['gameData']);
    if (data.gameData) {
      return JSON.parse(data.gameData);
    }
  } catch (e) {
    console.error('Ошибка загрузки:', e);
  }
  return null;
}`,
        tip: 'Всегда делайте fallback на localStorage — если SDK недоступен, игра должна работать автономно.',
      },
      {
        subtitle: 'Что сохранять',
        content: [
          'Уровень персонажа и опыт',
          'Количество золота и очков навыков',
          'Список экипированных предметов (ID)',
          'Уровни навыков и пассивок',
          'Текущая зона и прогресс',
          'ID текущего сезона',
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'Подключение рекламы',
    icon: '💰',
    sections: [
      {
        subtitle: 'Rewarded Video (за вознаграждение)',
        content: [
          'Игрок сам решает посмотреть рекламу за бонус',
          'Идеально для: удвоение золота, бесплатный лут, бонусы',
          'Можно показывать неограниченно, но с кулдауном',
          'Приносит основной доход — 60-80% монетизации',
        ],
        code: `// Показ rewarded-рекламы
export async function showRewardedAd(
  onReward: () => void
) {
  const ysdk = YandexSDK.getSDK();
  if (!ysdk) {
    // Fallback для локальной разработки
    onReward();
    return;
  }

  try {
    await ysdk.adv.showRewardedVideo({
      callbacks: {
        onOpen: () => {
          // Поставьте игру на паузу
          pauseGame();
        },
        onRewarded: () => {
          // Выдайте награду игроку
          onReward();
        },
        onClose: () => {
          // Возобновите игру
          resumeGame();
        },
        onError: (e) => {
          console.error('Ошибка рекламы:', e);
          resumeGame();
        }
      }
    });
  } catch (e) {
    console.error('Не удалось показать рекламу:', e);
  }
}

// Примеры использования в Loot Hunter Stories:
// - Удвоение золота за убийство босса
// - Бесплатная трансмутация у Мистика
// - Дополнительный предмет из инвентаря
// - Бонус к удаче на 30 минут`,
      },
      {
        subtitle: 'Interstitial (межстраничная)',
        content: [
          'Показывается между игровыми сессиями',
          'Нельзя показывать чаще 1 раза в 2 минуты',
          'Не показывайте во время боя или важных действий',
          'Лучшее время: смена зоны, смерть, переход между вкладками',
        ],
        code: `// Показ interstitial-рекламы
export async function showInterstitialAd() {
  const ysdk = YandexSDK.getSDK();
  if (!ysdk) return;

  // Проверка кулдауна (минимум 2 минуты)
  const now = Date.now();
  const lastShow = localStorage.getItem('lastAdShow') || '0';
  if (now - parseInt(lastShow) < 120000) return;

  try {
    await ysdk.adv.showFullscreenAdv({
      callbacks: {
        onOpen: () => pauseGame(),
        onClose: (wasShown) => {
          resumeGame();
          if (wasShown) {
            localStorage.setItem('lastAdShow', String(now));
          }
        },
        onError: (e) => {
          console.error('Ошибка:', e);
          resumeGame();
        }
      }
    });
  } catch (e) {
    console.error('Не удалось показать рекламу:', e);
  }
}

// Где показывать в игре:
// - После победы над боссом
// - При переходе в новую зону
// - Раз в 5-10 минут активного геймплея`,
      },
      {
        subtitle: 'Идеи для rewarded-наград',
        content: [
          '🎁 Удвоение золота за убийство босса (x2 reward)',
          '⚔️ Бесплатное улучшение предмета у Зачарователя',
          '🎲 Дополнительная трансмутация у Мистика',
          '🍀 Бонус +50% удачи на 30 минут',
          '💎 Бесплатный уровень случайной пассивки',
          '📦 Открыть сундук с редким предметом',
          '✨ Мгновенная смена сезона (для тестирования)',
          '🏆 x3 опыт за следующие 10 убийств',
        ],
        tip: 'Чем ценнее награда — тем охотнее игроки смотрят рекламу. Оптимально: 4-6 точек монетизации с разной ценностью.',
      },
    ],
  },
  {
    id: 6,
    title: 'Лидерборды и социальные функции',
    icon: '🏆',
    sections: [
      {
        subtitle: 'Таблицы лидеров',
        content: [
          'Яндекс предоставляет готовые лидерборды',
          'Создайте таблицы в консоли разработчика',
          'Отправляйте рекорды через SDK',
          'Игроки видят позиции друзей и глобальный рейтинг',
        ],
        code: `// Отправка рекорда
export async function submitScore(
  score: number, 
  leaderboardId: string = 'main'
) {
  const ysdk = YandexSDK.getSDK();
  if (!ysdk) return;

  try {
    const lb = await ysdk.getLeaderboards();
    await lb.setLeaderboardScore(leaderboardId, score);
  } catch (e) {
    console.error('Ошибка отправки рекорда:', e);
  }
}

// Получение топа игроков
export async function getTopPlayers(
  leaderboardId: string = 'main',
  quantity: number = 10
) {
  const ysdk = YandexSDK.getSDK();
  if (!ysdk) return [];

  try {
    const lb = await ysdk.getLeaderboards();
    const result = await lb.getLeaderboardEntries(
      leaderboardId, 
      { quantityAround: 3, quantityTop: quantity }
    );
    return result.entries;
  } catch (e) {
    console.error('Ошибка получения топа:', e);
    return [];
  }
}

// Рекомендуемые таблицы для Loot Hunter Stories:
// - 'main' — максимальный уровень персонажа
// - 'zone' — максимальная достигнутая зона
// - 'bosses' — количество убитых боссов
// - 'gold' — всего золота заработано`,
      },
      {
        subtitle: 'Приглашение друзей',
        content: [
          'Используйте SDK для шеринга игры',
          'Давайте бонусы за приглашённых друзей',
          'Интегрируйте sharing через соцсети Яндекса',
        ],
        code: `// Поделиться игрой
export async function shareGame() {
  const ysdk = YandexSDK.getSDK();
  if (!ysdk) return;

  try {
    await ysdk.share({
      image: 'share-image.png', // из папки с игрой
      text: 'Я играю в Loot Hunter Stories — попробуй и ты!'
    });
  } catch (e) {
    console.error('Ошибка шеринга:', e);
  }
}`,
      },
    ],
  },
  {
    id: 7,
    title: 'Публикация в консоли',
    icon: '🚀',
    sections: [
      {
        subtitle: 'Создание страницы игры',
        content: [
          'В консоли разработчика нажмите «Добавить игру»',
          'Заполните название, описание, жанр',
          'Укажите теги: RPG, Idle, Фэнтези, Лут',
          'Добавьте возрастное ограничение (6+ или 12+)',
          'Выберите ориентацию: ландшафтная или портретная',
        ],
        tip: 'Хорошее описание — ключ к успеху. Первые 2 строки видны в поиске, поэтому сделайте их цепляющими.',
      },
      {
        subtitle: 'Загрузка файлов',
        content: [
          'Загрузите ZIP-архив с игрой (папка dist/)',
          'Добавьте иконку 512x512 px (PNG)',
          'Загрузите 3-5 скриншотов геймплея (1280x720 или 1920x1080)',
          'Добавьте обложку для витрины (1920x1080)',
          'Укажите URL для тестирования (опционально)',
        ],
      },
      {
        subtitle: 'Описание игры (пример)',
        content: [
          '📝 Название: Loot Hunter Stories',
          '📝 Краткое: Средневековая RPG с бесконечным лутом, боссами и сетовыми предметами',
          '📝 Полное описание: Погрузись в мир охотников за сокровищами!',
          '   • Сражайся с 10 типами монстров и эпическими боссами',
          '   • Собирай предметы 10 уровней редкости',
          '   • Открывай уникальные именные артефакты',
          '   • Собирай полные сеты для мощных бонусов',
          '   • Прокачивай 10 навыков и 12 пассивных улучшений',
          '   • Торгуй с NPC и используй сезонные модификаторы',
        ],
      },
      {
        subtitle: 'Отправка на модерацию',
        content: [
          'Нажмите «Отправить на модерацию»',
          'Модерация занимает от 1 до 5 рабочих дней',
          'Частые причины отказа:',
          '   • Отсутствие интеграции SDK',
          '   • Баги и вылеты',
          '   • Неадаптивный интерфейс',
          '   • Нарушение правил платформы',
          'После одобрения игра появится в каталоге',
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'Монетизация и выплаты',
    icon: '💎',
    sections: [
      {
        subtitle: 'Источники дохода',
        content: [
          '📺 Rewarded Video — 50-70% дохода (основной источник)',
          '📺 Interstitial — 20-30% дохода',
          '💳 In-App Purchases — 10-20% дохода (опционально)',
          '💰 Выплаты: ежемесячно, минимум 1000 рублей',
          '📊 Доля разработчика: 50-70% от рекламного дохода',
        ],
      },
      {
        subtitle: 'Внутриигровые покупки (IAP)',
        content: [
          'Яндекс поддерживает покупки внутри игр',
          'Настройте каталог товаров в консоли разработчика',
          'Игроки покупают за реальные деньги через Яндекс',
          'Комиссия платформы — 30%',
        ],
        code: `// Покупка внутри игры
export async function purchaseItem(itemId: string) {
  const ysdk = YandexSDK.getSDK();
  if (!ysdk) return false;

  try {
    const result = await ysdk.purchase({
      id: itemId,
      developerPayload: 'some-data'
    });
    
    if (result.purchaseToken) {
      // Подтвердите покупку на сервере
      await confirmPurchase(result.purchaseToken);
      return true;
    }
  } catch (e) {
    console.error('Ошибка покупки:', e);
  }
  return false;
}

// Примеры товаров для Loot Hunter Stories:
// - "no_ads" — отключение interstitial-рекламы (299₽)
// - "starter_pack" — стартовый набор (99₽)
// - "vip_month" — VIP на месяц (499₽)
// - "gold_1000" — 1000 золота (49₽)
// - "unique_scroll" — свиток уникального предмета (199₽)`,
      },
      {
        subtitle: 'Оптимизация дохода',
        content: [
          '📈 A/B-тестируйте цены и локации рекламы',
          '📈 Добавляйте новые точки rewarded-рекламы',
          '📈 Увеличивайте удержание игроков (ежедневные награды)',
          '📈 Следите за метриками: DAU, сессии, ARPDAU',
          '📈 Обновляйте контент регулярно (сезоны, события)',
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'Продвижение и развитие',
    icon: '📣',
    sections: [
      {
        subtitle: 'ASO-оптимизация',
        content: [
          'Используйте ключевые слова в названии и описании',
          'Популярные запросы: RPG, idle, лут, фэнтези, прокачка',
          'Яркая иконка — главный фактор кликабельности',
          'Качественные скриншоты с геймплеем',
          'Регулярные обновления улучшают позиции',
        ],
      },
      {
        subtitle: 'Удержание игроков',
        content: [
          '🎁 Ежедневные награды за вход',
          '🎁 Оффлайн-прогресс (начисление за время отсутствия)',
          '🎁 Еженедельные события и соревнования',
          '🎁 Достижения и ачивки',
          '🎁 Сезонные обновления контента',
          '🎁 Push-уведомления (с разрешения игрока)',
        ],
        tip: 'Игры с удержанием D7 > 20% получают в 5-10 раз больше показов от Яндекса.',
      },
      {
        subtitle: 'Аналитика',
        content: [
          'Используйте встроенную аналитику Яндекса',
          'Отслеживайте ключевые метрики:',
          '   • DAU/MAU — активные игроки',
          '   • Средняя длительность сессии',
          '   • ARPDAU — доход на пользователя в день',
          '   • Retention D1, D7, D30',
          '   • Конверсия в просмотр рекламы',
          'Интегрируйте собственные счётчики для deeper analytics',
        ],
        code: `// Отправка событий в аналитику
export async function trackEvent(
  eventName: string, 
  params?: any
) {
  const ysdk = YandexSDK.getSDK();
  if (!ysdk) return;

  try {
    await ysdk.features.analytics.dispatchEvent(
      eventName,
      params ? JSON.stringify(params) : ''
    );
  } catch (e) {
    console.error('Ошибка аналитики:', e);
  }
}

// Важные события для отслеживания:
// - 'level_up' — повышение уровня
// - 'boss_killed' — убийство босса
// - 'item_looted' — получение предмета
// - 'ad_watched' — просмотр рекламы
// - 'purchase_made' — покупка
// - 'zone_reached' — достижение зоны`,
      },
    ],
  },
  {
    id: 10,
    title: 'Чек-лист перед публикацией',
    icon: '✅',
    sections: [
      {
        subtitle: 'Технический чек-лист',
        content: [
          '☑️ SDK инициализируется без ошибок',
          '☑️ Сохранения работают (и локально, и в облаке)',
          '☑️ Rewarded-реклама показывает и выдаёт награду',
          '☑️ Interstitial-реклама с кулдауном 2+ минуты',
          '☑️ Игра ставится на паузу во время рекламы',
          '☑️ Адаптивный интерфейс на мобильных',
          '☑️ Нет консольных ошибок',
          '☑️ Производительность > 30 FPS на слабых устройствах',
          '☑️ Лидерборды отправляют и получают данные',
          '☑️ Fallback для локальной разработки (без SDK)',
        ],
      },
      {
        subtitle: 'Контентный чек-лист',
        content: [
          '☑️ Иконка 512x512 px, яркая и читаемая',
          '☑️ 3-5 скриншотов геймплея',
          '☑️ Обложка для витрины 1920x1080',
          '☑️ Описание с ключевыми словами',
          '☑️ Теги: RPG, Idle, Фэнтези, Лут, Прокачка',
          '☑️ Возрастное ограничение указано',
          '☑️ Локализация на русский язык',
          '☑️ Обучение для новых игроков',
        ],
      },
    ],
  },
];

function App() {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  return (
    <div className="min-h-screen text-gold" style={{ backgroundColor: '#1a1208', fontFamily: "'Crimson Text', Georgia, serif" }}>
      {/* Header */}
      <header className="border-b-2 border-wood sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#2a1f0e' }}>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-wider mb-2" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
              ⚔️ Loot Hunter Stories
            </h1>
            <div className="ornate-divider my-3" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #8b6234, #b8860b, #8b6234, transparent)' }} />
            <p className="text-xl" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
              📜 ПУТЕВОДИТЕЛЬ ПО ЯНДЕКС ИГРАМ
            </p>
            <p className="text-sm mt-2" style={{ color: '#8b7355' }}>
              Пошаговая инструкция по публикации и монетизации
            </p>
          </div>
        </div>
      </header>

      {/* Summary */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Шагов', value: '10', icon: '📋' },
            { label: 'Время', value: '1-2 нед', icon: '⏳' },
            { label: 'Доход', value: 'от 5K₽/мес', icon: '💰' },
            { label: 'Сложность', value: 'Средняя', icon: '⚡' },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border-2 p-3 text-center" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs" style={{ color: '#8b7355' }}>{item.label}</div>
              <div className="text-lg font-bold" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map(step => (
            <div
              key={step.id}
              className="rounded-xl border-2 overflow-hidden"
              style={{
                backgroundColor: '#2a1f0e',
                borderColor: expandedStep === step.id ? '#b8860b' : '#5c3d1e',
                boxShadow: expandedStep === step.id ? '0 0 20px rgba(184,134,11,0.2)' : 'none',
              }}
            >
              {/* Step header */}
              <button
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                className="w-full p-4 flex items-center gap-4 text-left transition-all"
                style={{ backgroundColor: expandedStep === step.id ? '#3d2d14' : 'transparent' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #8b6234 0%, #5c3d1e 100%)',
                    border: '2px solid #b8860b',
                    color: '#f0c75e',
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="text-xs" style={{ color: '#8b7355' }}>ШАГ {step.id} ИЗ {STEPS.length}</div>
                  <div className="text-lg font-bold" style={{ color: '#e8dcc4', fontFamily: "'Cinzel', serif" }}>
                    {step.title}
                  </div>
                </div>
                <div className="text-2xl transition-transform" style={{ color: '#b8860b', transform: expandedStep === step.id ? 'rotate(180deg)' : 'rotate(0)' }}>
                  ▼
                </div>
              </button>

              {/* Step content */}
              {expandedStep === step.id && (
                <div className="p-4 border-t-2" style={{ borderColor: '#5c3d1e' }}>
                  {step.sections.map((section, i) => (
                    <div key={i} className="mb-6 last:mb-0">
                      <h4 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
                        <span style={{ color: '#b8860b' }}>❖</span>
                        {section.subtitle}
                      </h4>
                      
                      <ul className="space-y-2 mb-3">
                        {section.content.map((item, j) => (
                          <li key={j} className="flex gap-2 text-sm" style={{ color: '#e8dcc4' }}>
                            <span style={{ color: '#b8860b' }}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      {section.code && (
                        <div className="rounded-lg border overflow-hidden mb-3" style={{ borderColor: '#5c3d1e' }}>
                          <div className="px-3 py-1 text-xs" style={{ backgroundColor: '#3d2d14', color: '#b8860b', fontFamily: "'Cinzel', serif" }}>
                            💻 КОД
                          </div>
                          <pre className="p-3 text-xs overflow-x-auto" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
                            <code>{section.code}</code>
                          </pre>
                        </div>
                      )}

                      {section.tip && (
                        <div className="rounded-lg border-2 p-3 mt-3" style={{ backgroundColor: 'rgba(184,134,11,0.1)', borderColor: '#b8860b' }}>
                          <div className="flex gap-2">
                            <span className="text-lg">💡</span>
                            <div>
                              <div className="text-xs font-bold mb-1" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>СОВЕТ МУДРЕЦА</div>
                              <div className="text-sm" style={{ color: '#e8dcc4' }}>{section.tip}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 rounded-xl border-2 p-6 text-center" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b' }}>
          <div className="text-3xl mb-2">⚜️</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
            ПУТЬ ОХОТНИКА ЗА СОКРОВИЩАМИ
          </h3>
          <p className="text-sm mb-4" style={{ color: '#8b7355' }}>
            Следуйте этому гайду шаг за шагом, и ваша игра покорит Яндекс Игры!
          </p>
          <div className="ornate-divider my-4" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #8b6234, #b8860b, #8b6234, transparent)' }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-2xl mb-1">🎮</div>
              <div className="font-bold" style={{ color: '#d4a843' }}>Создайте игру</div>
              <div style={{ color: '#8b7355' }}>Качественный геймплей — основа всего</div>
            </div>
            <div>
              <div className="text-2xl mb-1">📢</div>
              <div className="font-bold" style={{ color: '#d4a843' }}>Интегрируйте SDK</div>
              <div style={{ color: '#8b7355' }}>Сохранения, реклама, лидерборды</div>
            </div>
            <div>
              <div className="text-2xl mb-1">💰</div>
              <div className="font-bold" style={{ color: '#d4a843' }}>Монетизируйте</div>
              <div style={{ color: '#8b7355' }}>Rewarded видео + IAP = доход</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs" style={{ color: '#5c3d1e' }}>
          © Loot Hunter Stories • Гайд по Яндекс Играм
        </div>
      </div>
    </div>
  );
}

export default App;
