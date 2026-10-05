import { useState } from 'react';

type OS = 'windows' | 'mac' | 'linux';

function App() {
  const [selectedOS, setSelectedOS] = useState<OS>('windows');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const commands = {
    windows: [
      {
        id: 'w1',
        title: 'Скачайте и установите Node.js',
        description: 'Перейдите на nodejs.org и скачайте LTS-версию для Windows',
        link: 'https://nodejs.org',
        code: null,
      },
      {
        id: 'w2',
        title: 'Скачайте проект',
        description: 'Скачайте ZIP-архив проекта и распакуйте его в любую папку',
        link: null,
        code: null,
      },
      {
        id: 'w3',
        title: 'Откройте командную строку',
        description: 'В папке проекта нажмите Shift + правый клик → «Открыть окно PowerShell здесь»',
        link: null,
        code: null,
      },
      {
        id: 'w4',
        title: 'Установите зависимости',
        description: 'Установите все необходимые пакеты',
        link: null,
        code: 'npm install',
      },
      {
        id: 'w5',
        title: 'Запустите сборку',
        description: 'Соберите проект командой',
        link: null,
        code: 'npm run build',
      },
      {
        id: 'w6',
        title: 'Создайте ZIP-архив',
        description: 'Упакуйте папку dist в ZIP-архив',
        link: null,
        code: 'Compress-Archive -Path dist\\* -DestinationPath loot-hunter-stories.zip',
      },
      {
        id: 'w7',
        title: 'Готово!',
        description: 'Файл loot-hunter-stories.zip создан в папке проекта',
        link: null,
        code: null,
      },
    ],
    mac: [
      {
        id: 'm1',
        title: 'Установите Node.js',
        description: 'Установите через Homebrew или скачайте с nodejs.org',
        link: 'https://nodejs.org',
        code: 'brew install node',
      },
      {
        id: 'm2',
        title: 'Скачайте проект',
        description: 'Скачайте ZIP-архив проекта и распакуйте его',
        link: null,
        code: null,
      },
      {
        id: 'm3',
        title: 'Откройте терминал',
        description: 'Перейдите в папку проекта',
        link: null,
        code: 'cd ~/Downloads/loot-hunter-stories',
      },
      {
        id: 'm4',
        title: 'Установите зависимости',
        description: 'Установите все необходимые пакеты',
        link: null,
        code: 'npm install',
      },
      {
        id: 'm5',
        title: 'Запустите сборку',
        description: 'Соберите проект командой',
        link: null,
        code: 'npm run build',
      },
      {
        id: 'm6',
        title: 'Создайте ZIP-архив',
        description: 'Упакуйте папку dist в ZIP-архив',
        link: null,
        code: 'cd dist && zip -r ../loot-hunter-stories.zip . && cd ..',
      },
      {
        id: 'm7',
        title: 'Готово!',
        description: 'Файл loot-hunter-stories.zip создан в папке проекта',
        link: null,
        code: null,
      },
    ],
    linux: [
      {
        id: 'l1',
        title: 'Установите Node.js',
        description: 'Установите через пакетный менеджер',
        link: 'https://nodejs.org',
        code: 'sudo apt install nodejs npm',
      },
      {
        id: 'l2',
        title: 'Скачайте проект',
        description: 'Скачайте ZIP-архив проекта и распакуйте его',
        link: null,
        code: 'unzip loot-hunter-stories-source.zip',
      },
      {
        id: 'l3',
        title: 'Перейдите в папку проекта',
        description: 'Откройте терминал и перейдите в директорию',
        link: null,
        code: 'cd loot-hunter-stories',
      },
      {
        id: 'l4',
        title: 'Установите зависимости',
        description: 'Установите все необходимые пакеты',
        link: null,
        code: 'npm install',
      },
      {
        id: 'l5',
        title: 'Запустите сборку',
        description: 'Соберите проект командой',
        link: null,
        code: 'npm run build',
      },
      {
        id: 'l6',
        title: 'Создайте ZIP-архив',
        description: 'Упакуйте папку dist в ZIP-архив',
        link: null,
        code: 'cd dist && zip -r ../loot-hunter-stories.zip . && cd ..',
      },
      {
        id: 'l7',
        title: 'Готово!',
        description: 'Файл loot-hunter-stories.zip создан в папке проекта',
        link: null,
        code: null,
      },
    ],
  };

  const currentCommands = commands[selectedOS];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1208', fontFamily: "'Crimson Text', Georgia, serif", color: '#e8dcc4' }}>
      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider mb-2" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
            📦 Скачивание ZIP-архива игры
          </h1>
          <div className="my-3" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #8b6234, #b8860b, #8b6234, transparent)' }} />
          <p style={{ color: '#8b7355' }}>
            Пошаговая инструкция для создания ZIP-архива для Яндекс Игр
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* OS Selector */}
        <div className="rounded-xl border-2 p-4 mb-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b' }}>
          <h3 className="text-lg font-bold mb-3 text-center" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
            Выберите вашу операционную систему
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'windows' as OS, icon: '🪟', name: 'Windows' },
              { id: 'mac' as OS, icon: '🍎', name: 'macOS' },
              { id: 'linux' as OS, icon: '🐧', name: 'Linux' },
            ].map(os => (
              <button
                key={os.id}
                onClick={() => setSelectedOS(os.id)}
                className="p-4 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: selectedOS === os.id ? '#3d2d14' : '#1a1208',
                  borderColor: selectedOS === os.id ? '#b8860b' : '#5c3d1e',
                  boxShadow: selectedOS === os.id ? '0 0 15px rgba(184,134,11,0.3)' : 'none',
                }}
              >
                <div className="text-3xl mb-1">{os.icon}</div>
                <div className="font-bold" style={{ color: selectedOS === os.id ? '#f0c75e' : '#8b7355' }}>
                  {os.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {currentCommands.map((cmd, index) => (
            <div
              key={cmd.id}
              className="rounded-xl border-2 p-4"
              style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #8b6234 0%, #5c3d1e 100%)',
                    border: '2px solid #b8860b',
                    color: '#f0c75e',
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-1" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
                    {cmd.title}
                  </h4>
                  <p className="text-sm mb-3" style={{ color: '#a89880' }}>{cmd.description}</p>

                  {cmd.link && (
                    <a
                      href={cmd.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 rounded-lg border-2 transition-all hover:border-amber-600"
                      style={{ backgroundColor: '#1a1208', borderColor: '#b8860b', color: '#f0c75e' }}
                    >
                      🔗 Перейти по ссылке
                    </a>
                  )}

                  {cmd.code && (
                    <div className="mt-3 rounded-lg border overflow-hidden" style={{ borderColor: '#5c3d1e' }}>
                      <div className="flex justify-between items-center px-3 py-1.5" style={{ backgroundColor: '#3d2d14' }}>
                        <span className="text-xs" style={{ color: '#b8860b', fontFamily: "'Cinzel', serif" }}>
                          💻 КОМАНДА
                        </span>
                        <button
                          onClick={() => copyToClipboard(cmd.code!, cmd.id)}
                          className="text-xs px-2 py-1 rounded transition-colors"
                          style={{
                            backgroundColor: copiedCommand === cmd.id ? '#6b8e4e' : '#5c3d1e',
                            color: copiedCommand === cmd.id ? '#fff' : '#d4a843',
                          }}
                        >
                          {copiedCommand === cmd.id ? '✓ Скопировано' : '📋 Копировать'}
                        </button>
                      </div>
                      <pre className="p-3 text-sm overflow-x-auto" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
                        <code>{cmd.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick one-liner */}
        <div className="mt-6 rounded-xl border-2 p-4" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
            ⚡ Быстрая команда (все в одной строке)
          </h3>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#5c3d1e' }}>
            <div className="flex justify-between items-center px-3 py-1.5" style={{ backgroundColor: '#3d2d14' }}>
              <span className="text-xs" style={{ color: '#b8860b', fontFamily: "'Cinzel', serif" }}>
                {selectedOS === 'windows' ? '💻 PowerShell' : '💻 Terminal'}
              </span>
              <button
                onClick={() => {
                  const quickCmd = selectedOS === 'windows'
                    ? 'npm install; npm run build; Compress-Archive -Path dist\\* -DestinationPath loot-hunter-stories.zip'
                    : 'npm install && npm run build && cd dist && zip -r ../loot-hunter-stories.zip . && cd ..';
                  copyToClipboard(quickCmd, 'quick');
                }}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{
                  backgroundColor: copiedCommand === 'quick' ? '#6b8e4e' : '#5c3d1e',
                  color: copiedCommand === 'quick' ? '#fff' : '#d4a843',
                }}
              >
                {copiedCommand === 'quick' ? '✓ Скопировано' : '📋 Копировать'}
              </button>
            </div>
            <pre className="p-3 text-sm overflow-x-auto" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
              <code>
                {selectedOS === 'windows'
                  ? 'npm install; npm run build; Compress-Archive -Path dist\\* -DestinationPath loot-hunter-stories.zip'
                  : 'npm install && npm run build && cd dist && zip -r ../loot-hunter-stories.zip . && cd ..'}
              </code>
            </pre>
          </div>
        </div>

        {/* After ZIP */}
        <div className="mt-6 rounded-xl border-2 p-6 text-center" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b' }}>
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-bold mb-3" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
            ZIP-архив готов!
          </h3>
          <p className="mb-4" style={{ color: '#8b7355' }}>
            Теперь загрузите файл <code className="px-2 py-1 rounded" style={{ backgroundColor: '#0d0a04', color: '#d4a843' }}>loot-hunter-stories.zip</code> в консоль разработчика Яндекс Игр
          </p>
          <div className="my-4" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #8b6234, #b8860b, #8b6234, transparent)' }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="text-2xl mb-1">📤</div>
              <div className="font-bold" style={{ color: '#d4a843' }}>Загрузите</div>
              <div style={{ color: '#8b7355' }}>ZIP в консоль</div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="text-2xl mb-1">📝</div>
              <div className="font-bold" style={{ color: '#d4a843' }}>Заполните</div>
              <div style={{ color: '#8b7355' }}>Описание и теги</div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="text-2xl mb-1">🚀</div>
              <div className="font-bold" style={{ color: '#d4a843' }}>Отправьте</div>
              <div style={{ color: '#8b7355' }}>На модерацию</div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-6 rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
            📋 Требования к ZIP-архиву
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span style={{ color: '#6b8e4e' }}>✓</span>
              <span>Размер не более 50 МБ</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#6b8e4e' }}>✓</span>
              <span>Должен содержать index.html</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#6b8e4e' }}>✓</span>
              <span>Все пути относительные</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#6b8e4e' }}>✓</span>
              <span>Интегрирован Yandex SDK</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#6b8e4e' }}>✓</span>
              <span>Адаптивный интерфейс</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#6b8e4e' }}>✓</span>
              <span>Без внешних ресурсов</span>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-6 rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
            🔧 Решение проблем
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#c0392b' }}>❌ npm: command not found</div>
              <div style={{ color: '#8b7355' }}>Установите Node.js с nodejs.org</div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#c0392b' }}>❌ Архив больше 50 МБ</div>
              <div style={{ color: '#8b7355' }}>Удалите неиспользуемые ресурсы, оптимизируйте изображения</div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#c0392b' }}>❌ zip: command not found</div>
              <div style={{ color: '#8b7355' }}>Windows: используйте PowerShell. Linux/Mac: <code>sudo apt install zip</code></div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#c0392b' }}>❌ Ошибка сборки</div>
              <div style={{ color: '#8b7355' }}>Удалите node_modules и package-lock.json, затем снова <code>npm install</code></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-4 text-xs" style={{ color: '#5c3d1e' }}>
          © Loot Hunter Stories • Инструкция по скачиванию ZIP-архива
        </div>
      </div>
    </div>
  );
}

export default App;
