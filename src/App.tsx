import { useState } from 'react';

type Method = 'zip' | 'manual' | 'git';

function App() {
  const [selectedMethod, setSelectedMethod] = useState<Method>('zip');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const projectFiles = [
    { path: 'src/', type: 'folder', description: 'Исходный код игры' },
    { path: 'src/App.tsx', type: 'file', description: 'Основной компонент игры' },
    { path: 'src/gameData.ts', type: 'file', description: 'Игровые данные (монстры, предметы, навыки)' },
    { path: 'src/yandexSdk.ts', type: 'file', description: 'Интеграция Yandex Games SDK' },
    { path: 'src/yandex.d.ts', type: 'file', description: 'TypeScript декларации для SDK' },
    { path: 'src/index.css', type: 'file', description: 'Стили в фэнтезийном стиле' },
    { path: 'src/main.tsx', type: 'file', description: 'Точка входа приложения' },
    { path: 'index.html', type: 'file', description: 'Главная HTML страница' },
    { path: 'package.json', type: 'file', description: 'Зависимости проекта' },
    { path: 'vite.config.ts', type: 'file', description: 'Конфигурация Vite' },
    { path: 'tsconfig.json', type: 'file', description: 'Конфигурация TypeScript' },
    { path: 'tailwind.config.js', type: 'file', description: 'Конфигурация Tailwind CSS' },
    { path: 'build-yandex.sh', type: 'file', description: 'Скрипт сборки для Linux/Mac' },
    { path: 'build-yandex.bat', type: 'file', description: 'Скрипт сборки для Windows' },
    { path: 'README.md', type: 'file', description: 'Документация по интеграции' },
    { path: 'INSTRUCTIONS.md', type: 'file', description: 'Краткая инструкция' },
    { path: 'PUBLICATION.md', type: 'file', description: 'Инструкция по публикации' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1208', fontFamily: "'Crimson Text', Georgia, serif", color: '#e8dcc4' }}>
      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider mb-2" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
            📥 Скачивание проекта
          </h1>
          <div className="my-3" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #8b6234, #b8860b, #8b6234, transparent)' }} />
          <p style={{ color: '#8b7355' }}>
            Как получить исходный код игры Loot Hunter Stories
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Method Selector */}
        <div className="rounded-xl border-2 p-4 mb-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b' }}>
          <h3 className="text-lg font-bold mb-3 text-center" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
            Выберите способ скачивания
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'zip' as Method, icon: '📦', name: 'ZIP-архив', desc: 'Самый простой способ' },
              { id: 'manual' as Method, icon: '📋', name: 'Вручную', desc: 'Копировать файлы' },
              { id: 'git' as Method, icon: '🔀', name: 'Git', desc: 'Для разработчиков' },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className="p-4 rounded-lg border-2 transition-all text-left"
                style={{
                  backgroundColor: selectedMethod === method.id ? '#3d2d14' : '#1a1208',
                  borderColor: selectedMethod === method.id ? '#b8860b' : '#5c3d1e',
                  boxShadow: selectedMethod === method.id ? '0 0 15px rgba(184,134,11,0.3)' : 'none',
                }}
              >
                <div className="text-3xl mb-1">{method.icon}</div>
                <div className="font-bold" style={{ color: selectedMethod === method.id ? '#f0c75e' : '#8b7355' }}>
                  {method.name}
                </div>
                <div className="text-xs mt-1" style={{ color: '#8b7355' }}>{method.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ZIP Method */}
        {selectedMethod === 'zip' && (
          <div className="space-y-4">
            <div className="rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
                📦 Способ 1: Скачать ZIP-архив
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#1a1208', borderColor: '#b8860b' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <div className="flex-1">
                      <div className="font-bold mb-2" style={{ color: '#f0c75e' }}>Используйте кнопку скачивания</div>
                      <p className="text-sm mb-3" style={{ color: '#a89880' }}>
                        В интерфейсе среды разработки найдите кнопку <strong>«Download»</strong> или <strong>«Скачать»</strong> (обычно в верхнем меню или боковой панели)
                      </p>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#0d0a04' }}>
                        <div className="text-sm" style={{ color: '#d4a843' }}>
                          💡 Обычно это иконка <span className="text-2xl">⬇️</span> или кнопка в верхней панели
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#1a1208', borderColor: '#b8860b' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <div className="flex-1">
                      <div className="font-bold mb-2" style={{ color: '#f0c75e' }}>Сохраните архив</div>
                      <p className="text-sm" style={{ color: '#a89880' }}>
                        Браузер скачает ZIP-архив со всеми файлами проекта. Сохраните его в удобное место (например, в папку «Загрузки»)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#1a1208', borderColor: '#b8860b' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">3️⃣</span>
                    <div className="flex-1">
                      <div className="font-bold mb-2" style={{ color: '#f0c75e' }}>Распакуйте архив</div>
                      <p className="text-sm mb-3" style={{ color: '#a89880' }}>
                        Распакуйте ZIP-архив в любую папку на вашем компьютере
                      </p>
                      <div className="space-y-2 text-sm">
                        <div><strong style={{ color: '#d4a843' }}>Windows:</strong> <span style={{ color: '#a89880' }}>Правый клик → «Извлечь всё...»</span></div>
                        <div><strong style={{ color: '#d4a843' }}>macOS:</strong> <span style={{ color: '#a89880' }}>Двойной клик по архиву</span></div>
                        <div><strong style={{ color: '#d4a843' }}>Linux:</strong> <span style={{ color: '#a89880' }}><code>unzip loot-hunter-stories.zip</code></span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#1a1208', borderColor: '#6b8e4e' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div className="flex-1">
                      <div className="font-bold mb-2" style={{ color: '#6b8e4e' }}>Готово!</div>
                      <p className="text-sm" style={{ color: '#a89880' }}>
                        Теперь у вас есть полная папка проекта со всеми исходниками. Перейдите к разделу «Запуск проекта» ниже.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Method */}
        {selectedMethod === 'manual' && (
          <div className="space-y-4">
            <div className="rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
                📋 Способ 2: Копировать файлы вручную
              </h3>

              <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#1a1208', border: '1px solid #c0392b' }}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div className="text-sm" style={{ color: '#e8dcc4' }}>
                    <strong>Внимание:</strong> Этот способ занимает больше времени. Рекомендуется использовать ZIP-архив.
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold mb-3" style={{ color: '#f0c75e' }}>Структура проекта:</h4>
                <div className="space-y-1 text-sm">
                  {projectFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded" style={{ backgroundColor: '#1a1208' }}>
                      <span className="text-lg">{file.type === 'folder' ? '📁' : '📄'}</span>
                      <code className="flex-1" style={{ color: '#d4a843' }}>{file.path}</code>
                      <span className="text-xs" style={{ color: '#8b7355' }}>{file.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
                  <div className="font-bold mb-2" style={{ color: '#f0c75e' }}>1. Создайте папку проекта</div>
                  <p className="text-sm" style={{ color: '#a89880' }}>
                    Создайте новую папку с именем <code className="px-2 py-1 rounded" style={{ backgroundColor: '#0d0a04', color: '#d4a843' }}>loot-hunter-stories</code>
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
                  <div className="font-bold mb-2" style={{ color: '#f0c75e' }}>2. Скопируйте все файлы</div>
                  <p className="text-sm mb-2" style={{ color: '#a89880' }}>
                    Откройте каждый файл в редакторе кода и скопируйте его содержимое в соответствующий файл в вашей папке
                  </p>
                  <p className="text-sm" style={{ color: '#8b7355' }}>
                    💡 Начните с конфигурационных файлов (package.json, tsconfig.json), затем исходники (src/)
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
                  <div className="font-bold mb-2" style={{ color: '#f0c75e' }}>3. Установите зависимости</div>
                  <p className="text-sm" style={{ color: '#a89880' }}>
                    Откройте терминал в папке проекта и выполните: <code className="px-2 py-1 rounded" style={{ backgroundColor: '#0d0a04', color: '#d4a843' }}>npm install</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Git Method */}
        {selectedMethod === 'git' && (
          <div className="space-y-4">
            <div className="rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
                🔀 Способ 3: Через Git (для разработчиков)
              </h3>

              <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#1a1208', border: '1px solid #6b8e4e' }}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div className="text-sm" style={{ color: '#e8dcc4' }}>
                    <strong>Рекомендуется:</strong> Если вы планируете вносить изменения в код и отслеживать версии.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
                  <div className="font-bold mb-2" style={{ color: '#f0c75e' }}>1. Инициализируйте Git репозиторий</div>
                  <div className="rounded-lg border overflow-hidden mt-2" style={{ borderColor: '#5c3d1e' }}>
                    <div className="flex justify-between items-center px-3 py-1.5" style={{ backgroundColor: '#3d2d14' }}>
                      <span className="text-xs" style={{ color: '#b8860b' }}>💻 ТЕРМИНАЛ</span>
                      <button
                        onClick={() => copyToClipboard('git init', 'git1')}
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: copiedCommand === 'git1' ? '#6b8e4e' : '#5c3d1e', color: copiedCommand === 'git1' ? '#fff' : '#d4a843' }}
                      >
                        {copiedCommand === 'git1' ? '✓' : '📋'}
                      </button>
                    </div>
                    <pre className="p-3 text-sm" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
                      <code>git init</code>
                    </pre>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
                  <div className="font-bold mb-2" style={{ color: '#f0c75e' }}>2. Добавьте файлы</div>
                  <div className="rounded-lg border overflow-hidden mt-2" style={{ borderColor: '#5c3d1e' }}>
                    <div className="flex justify-between items-center px-3 py-1.5" style={{ backgroundColor: '#3d2d14' }}>
                      <span className="text-xs" style={{ color: '#b8860b' }}>💻 ТЕРМИНАЛ</span>
                      <button
                        onClick={() => copyToClipboard('git add .', 'git2')}
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: copiedCommand === 'git2' ? '#6b8e4e' : '#5c3d1e', color: copiedCommand === 'git2' ? '#fff' : '#d4a843' }}
                      >
                        {copiedCommand === 'git2' ? '✓' : '📋'}
                      </button>
                    </div>
                    <pre className="p-3 text-sm" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
                      <code>git add .</code>
                    </pre>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
                  <div className="font-bold mb-2" style={{ color: '#f0c75e' }}>3. Создайте первый коммит</div>
                  <div className="rounded-lg border overflow-hidden mt-2" style={{ borderColor: '#5c3d1e' }}>
                    <div className="flex justify-between items-center px-3 py-1.5" style={{ backgroundColor: '#3d2d14' }}>
                      <span className="text-xs" style={{ color: '#b8860b' }}>💻 ТЕРМИНАЛ</span>
                      <button
                        onClick={() => copyToClipboard('git commit -m "Initial commit: Loot Hunter Stories"', 'git3')}
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: copiedCommand === 'git3' ? '#6b8e4e' : '#5c3d1e', color: copiedCommand === 'git3' ? '#fff' : '#d4a843' }}
                      >
                        {copiedCommand === 'git3' ? '✓' : '📋'}
                      </button>
                    </div>
                    <pre className="p-3 text-sm" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
                      <code>git commit -m "Initial commit: Loot Hunter Stories"</code>
                    </pre>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
                  <div className="font-bold mb-2" style={{ color: '#f0c75e' }}>4. (Опционально) Загрузите на GitHub</div>
                  <div className="rounded-lg border overflow-hidden mt-2" style={{ borderColor: '#5c3d1e' }}>
                    <div className="flex justify-between items-center px-3 py-1.5" style={{ backgroundColor: '#3d2d14' }}>
                      <span className="text-xs" style={{ color: '#b8860b' }}>💻 ТЕРМИНАЛ</span>
                      <button
                        onClick={() => copyToClipboard('git remote add origin https://github.com/yourusername/loot-hunter-stories.git\ngit branch -M main\ngit push -u origin main', 'git4')}
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: copiedCommand === 'git4' ? '#6b8e4e' : '#5c3d1e', color: copiedCommand === 'git4' ? '#fff' : '#d4a843' }}
                      >
                        {copiedCommand === 'git4' ? '✓' : '📋'}
                      </button>
                    </div>
                    <pre className="p-3 text-sm" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
                      <code>{`git remote add origin https://github.com/yourusername/loot-hunter-stories.git
git branch -M main
git push -u origin main`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Run Project Section */}
        <div className="mt-6 rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
            🚀 Запуск проекта после скачивания
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-2" style={{ color: '#d4a843' }}>1. Установите зависимости</div>
              <div className="rounded-lg border overflow-hidden mt-2" style={{ borderColor: '#5c3d1e' }}>
                <div className="flex justify-between items-center px-3 py-1.5" style={{ backgroundColor: '#3d2d14' }}>
                  <span className="text-xs" style={{ color: '#b8860b' }}>💻 ТЕРМИНАЛ</span>
                  <button
                    onClick={() => copyToClipboard('npm install', 'run1')}
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: copiedCommand === 'run1' ? '#6b8e4e' : '#5c3d1e', color: copiedCommand === 'run1' ? '#fff' : '#d4a843' }}
                  >
                    {copiedCommand === 'run1' ? '✓' : '📋'}
                  </button>
                </div>
                <pre className="p-3 text-sm" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
                  <code>npm install</code>
                </pre>
              </div>
              <p className="text-xs mt-2" style={{ color: '#8b7355' }}>
                Установит все необходимые пакеты (займёт 1-2 минуты)
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-2" style={{ color: '#d4a843' }}>2. Запустите для разработки</div>
              <div className="rounded-lg border overflow-hidden mt-2" style={{ borderColor: '#5c3d1e' }}>
                <div className="flex justify-between items-center px-3 py-1.5" style={{ backgroundColor: '#3d2d14' }}>
                  <span className="text-xs" style={{ color: '#b8860b' }}>💻 ТЕРМИНАЛ</span>
                  <button
                    onClick={() => copyToClipboard('npm run dev', 'run2')}
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: copiedCommand === 'run2' ? '#6b8e4e' : '#5c3d1e', color: copiedCommand === 'run2' ? '#fff' : '#d4a843' }}
                  >
                    {copiedCommand === 'run2' ? '✓' : '📋'}
                  </button>
                </div>
                <pre className="p-3 text-sm" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
                  <code>npm run dev</code>
                </pre>
              </div>
              <p className="text-xs mt-2" style={{ color: '#8b7355' }}>
                Откройте http://localhost:5173 в браузере
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-2" style={{ color: '#d4a843' }}>3. Соберите для продакшена</div>
              <div className="rounded-lg border overflow-hidden mt-2" style={{ borderColor: '#5c3d1e' }}>
                <div className="flex justify-between items-center px-3 py-1.5" style={{ backgroundColor: '#3d2d14' }}>
                  <span className="text-xs" style={{ color: '#b8860b' }}>💻 ТЕРМИНАЛ</span>
                  <button
                    onClick={() => copyToClipboard('npm run build', 'run3')}
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: copiedCommand === 'run3' ? '#6b8e4e' : '#5c3d1e', color: copiedCommand === 'run3' ? '#fff' : '#d4a843' }}
                  >
                    {copiedCommand === 'run3' ? '✓' : '📋'}
                  </button>
                </div>
                <pre className="p-3 text-sm" style={{ backgroundColor: '#0d0a04', color: '#a89880', fontFamily: "'Courier New', monospace" }}>
                  <code>npm run build</code>
                </pre>
              </div>
              <p className="text-xs mt-2" style={{ color: '#8b7355' }}>
                Готовые файлы будут в папке <code>dist/</code>
              </p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-6 rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>
            📋 Системные требования
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#f0c75e' }}>Node.js</div>
              <div style={{ color: '#a89880' }}>Версия 18 или выше</div>
              <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-xs mt-1 inline-block" style={{ color: '#b8860b' }}>
                🔗 Скачать nodejs.org
              </a>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#f0c75e' }}>npm</div>
              <div style={{ color: '#a89880' }}>Устанавливается вместе с Node.js</div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#f0c75e' }}>Редактор кода</div>
              <div style={{ color: '#a89880' }}>VS Code (рекомендуется)</div>
              <a href="https://code.visualstudio.com" target="_blank" rel="noopener noreferrer" className="text-xs mt-1 inline-block" style={{ color: '#b8860b' }}>
                🔗 Скачать VS Code
              </a>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
              <div className="font-bold mb-1" style={{ color: '#f0c75e' }}>Браузер</div>
              <div style={{ color: '#a89880' }}>Chrome, Firefox, Safari, Edge</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-4 text-xs" style={{ color: '#5c3d1e' }}>
          © Loot Hunter Stories • Инструкция по скачиванию проекта
        </div>
      </div>
    </div>
  );
}

export default App;
