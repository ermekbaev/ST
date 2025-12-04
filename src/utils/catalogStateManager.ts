interface CatalogState {
  page: number;
  scrollPosition: number;
  filters: string;
  timestamp: number;
}

const STORAGE_KEY = "catalog_state";
const STATE_EXPIRY = 30 * 60 * 1000; // 30 минут

export const CatalogStateManager = {
  saveState(page: number, filters: string) {
    const state: CatalogState = {
      page,
      scrollPosition: window.scrollY,
      filters,
      timestamp: Date.now(),
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save catalog state:", error);
    }
  },

  // Получить сохранённое состояние
  getState(): CatalogState | null {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const state: CatalogState = JSON.parse(saved);

      // Проверяем, не истекло ли время хранения
      if (Date.now() - state.timestamp > STATE_EXPIRY) {
        this.clearState();
        return null;
      }

      return state;
    } catch (error) {
      console.warn("Failed to get catalog state:", error);
      return null;
    }
  },

  // Очистить сохранённое состояние
  clearState() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear catalog state:", error);
    }
  },

  // Восстановить скролл с несколькими попытками
  restoreScroll(position: number) {
    window.scrollTo(0, position);

    // Повторно через 100мс (когда контент загрузится)
    setTimeout(() => {
      window.scrollTo(0, position);
    }, 100);

    // И ещё раз через 300мс (для медленных изображений)
    setTimeout(() => {
      window.scrollTo(0, position);
    }, 300);

    // Финальная попытка через 500мс
    setTimeout(() => {
      window.scrollTo(0, position);
    }, 500);
  },
};
