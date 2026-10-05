// Yandex Games SDK Integration
// https://yandex.ru/dev/games/doc/ru/sdk/sdk-about

export class YandexSDK {
  private static ysdk: any = null;
  private static player: any = null;
  private static leaderboard: any = null;
  private static isInitialized = false;
  private static lastInterstitialTime = 0;

  // Инициализация SDK
  static async init(): Promise<boolean> {
    try {
      // Проверяем наличие YaGames (доступен только на платформе Яндекс)
      if (typeof YaGames === 'undefined') {
        console.log('Yandex SDK не доступен — работа в локальном режиме');
        return false;
      }

      this.ysdk = await YaGames.init();
      console.log('✅ Yandex SDK инициализирован');

      // Получаем игрока
      try {
        this.player = await this.ysdk.getPlayer();
        console.log('✅ Игрок получен:', this.player.getMode());
      } catch (e) {
        console.warn('Не удалось получить игрока:', e);
      }

      // Получаем лидерборды
      try {
        this.leaderboard = await this.ysdk.getLeaderboards();
        console.log('✅ Лидерборды инициализированы');
      } catch (e) {
        console.warn('Не удалось инициализировать лидерборды:', e);
      }

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('❌ Ошибка инициализации Yandex SDK:', e);
      return false;
    }
  }

  static getSDK() {
    return this.ysdk;
  }

  static getPlayer() {
    return this.player;
  }

  static isReady() {
    return this.isInitialized;
  }

  // ==================== СОХРАНЕНИЯ ====================

  // Сохранение прогресса в облако
  static async saveProgress(data: any): Promise<boolean> {
    if (!this.player) return false;

    try {
      await this.player.setData({
        gameData: JSON.stringify(data),
        timestamp: Date.now()
      }, true); // true = flush (немедленная запись)
      
      console.log('✅ Прогресс сохранён в облако');
      return true;
    } catch (e) {
      console.error('❌ Ошибка сохранения:', e);
      return false;
    }
  }

  // Загрузка прогресса из облака
  static async loadProgress(): Promise<any | null> {
    if (!this.player) return null;

    try {
      const data = await this.player.getData(['gameData']);
      if (data.gameData) {
        console.log('✅ Прогресс загружен из облака');
        return JSON.parse(data.gameData);
      }
    } catch (e) {
      console.error('❌ Ошибка загрузки:', e);
    }
    return null;
  }

  // ==================== РЕКЛАМА ====================

  // Показ rewarded-рекламы (за вознаграждение)
  static async showRewardedAd(
    onReward: () => void,
    onOpen?: () => void,
    onClose?: () => void
  ): Promise<void> {
    if (!this.ysdk) {
      // Fallback для локальной разработки
      console.log('🎁 Rewarded ad (локально): награда выдана');
      onReward();
      return;
    }

    try {
      await this.ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => {
            console.log('📺 Rewarded ad открыта');
            onOpen?.();
          },
          onRewarded: () => {
            console.log('🎁 Награда получена');
            onReward();
          },
          onClose: () => {
            console.log('📺 Rewarded ad закрыта');
            onClose?.();
          },
          onError: (e: any) => {
            console.error('❌ Ошибка rewarded ad:', e);
            onClose?.();
          }
        }
      });
    } catch (e) {
      console.error('❌ Не удалось показать rewarded ad:', e);
      onClose?.();
    }
  }

  // Показ interstitial-рекламы (межстраничная)
  static async showInterstitialAd(
    onOpen?: () => void,
    onClose?: () => void
  ): Promise<void> {
    if (!this.ysdk) {
      console.log('📺 Interstitial ad (локально): пропущена');
      return;
    }

    // Проверка кулдауна (минимум 2 минуты)
    const now = Date.now();
    if (now - this.lastInterstitialTime < 120000) {
      console.log('⏱️ Interstitial ad: кулдаун');
      return;
    }

    try {
      await this.ysdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => {
            console.log('📺 Interstitial ad открыта');
            this.lastInterstitialTime = now;
            onOpen?.();
          },
          onClose: (wasShown: boolean) => {
            console.log('📺 Interstitial ad закрыта, показана:', wasShown);
            onClose?.();
          },
          onError: (e: any) => {
            console.error('❌ Ошибка interstitial ad:', e);
            onClose?.();
          }
        }
      });
    } catch (e) {
      console.error('❌ Не удалось показать interstitial ad:', e);
      onClose?.();
    }
  }

  // ==================== ЛИДЕРБОРДЫ ====================

  // Отправка рекорда
  static async submitScore(score: number, leaderboardId: string = 'main'): Promise<void> {
    if (!this.leaderboard) return;

    try {
      await this.leaderboard.setLeaderboardScore(leaderboardId, score);
      console.log(`✅ Рекорд отправлен: ${leaderboardId} = ${score}`);
    } catch (e) {
      console.error('❌ Ошибка отправки рекорда:', e);
    }
  }

  // Получение топа игроков
  static async getTopPlayers(
    leaderboardId: string = 'main',
    quantity: number = 10
  ): Promise<any[]> {
    if (!this.leaderboard) return [];

    try {
      const result = await this.leaderboard.getLeaderboardEntries(
        leaderboardId,
        { quantityAround: 3, quantityTop: quantity }
      );
      return result.entries;
    } catch (e) {
      console.error('❌ Ошибка получения топа:', e);
      return [];
    }
  }

  // ==================== АНАЛИТИКА ====================

  // Отправка события
  static async trackEvent(eventName: string, params?: any): Promise<void> {
    if (!this.ysdk) return;

    try {
      await this.ysdk.features.analytics.dispatchEvent(
        eventName,
        params ? JSON.stringify(params) : ''
      );
    } catch (e) {
      console.error('❌ Ошибка аналитики:', e);
    }
  }

  // ==================== ШЕРИНГ ====================

  // Поделиться игрой
  static async share(text: string): Promise<void> {
    if (!this.ysdk) return;

    try {
      await this.ysdk.share({
        text: text
      });
    } catch (e) {
      console.error('❌ Ошибка шеринга:', e);
    }
  }

  // ==================== ЯЗЫК И ОКРУЖЕНИЕ ====================

  // Получить язык игрока
  static getLanguage(): string {
    if (!this.ysdk) return 'ru';
    return this.ysdk.environment.i18n.lang || 'ru';
  }

  // Получить домен (для локализации)
  static getDomain(): string {
    if (!this.ysdk) return 'ru';
    return this.ysdk.environment.i18n.tld || 'ru';
  }
}

// Глобальная переменная для доступа из HTML
(window as any).YandexSDK = YandexSDK;
