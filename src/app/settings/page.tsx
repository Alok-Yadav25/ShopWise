'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Globe, Shield, Bell, Trash2, Download, Info, AlertTriangle, Volume2, Upload } from 'lucide-react';
import { MobileNavigation, DesktopNavigation } from '@/components/ui/Navigation';
import { useUserStore } from '@/store/userStore';
import { useShoppingStore } from '@/store/shoppingStore';
import { cn } from '@/lib/utils';

/** Components extracted outside render to avoid "cannot create components during render" error */

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{title}</h2>
      <div className="bg-surface rounded-xl border border-border/50 divide-y divide-border/50">
        {children}
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center">
          <Icon size={16} className="text-text-secondary" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
          {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-200',
        checked ? 'bg-primary' : 'bg-border',
      )}
      role="switch"
      aria-checked={checked}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const {
    name, language, darkMode, dietaryPreferences,
    toggleDarkMode, setLanguage, setDietaryPreferences, setVoiceResponseEnabled: setStoreVoiceResponse,
    voiceResponseEnabled, speechRate: storeSpeechRate, speechPitch: storeSpeechPitch,
    setSpeechRate: setStoreSpeechRate, setSpeechPitch: setStoreSpeechPitch,
  } = useUserStore();
  const {
    items, pantryItems,
    resetAll,
  } = useShoppingStore();


  const [micStatus, setMicStatus] = useState<'granted' | 'denied' | 'prompt' | 'unavailable' | 'unknown'>('unknown');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  // Voice settings local state
  const [speechRate, setSpeechRateLocal] = useState(storeSpeechRate ?? 1);
  const [speechPitch, setSpeechPitchLocal] = useState(storeSpeechPitch ?? 1);
  const [vrEnabled, setVrEnabled] = useState(voiceResponseEnabled ?? true);

  // Import file input ref
  const importInputRef = useRef<HTMLInputElement>(null);

  // Sync local voice settings to store on change
  useEffect(() => {
    if (speechRate !== storeSpeechRate) setStoreSpeechRate(speechRate);
  }, [speechRate, storeSpeechRate, setStoreSpeechRate]);
  useEffect(() => {
    if (speechPitch !== storeSpeechPitch) setStoreSpeechPitch(speechPitch);
  }, [speechPitch, storeSpeechPitch, setStoreSpeechPitch]);
  useEffect(() => {
    if (vrEnabled !== voiceResponseEnabled) setStoreVoiceResponse(vrEnabled);
  }, [vrEnabled, voiceResponseEnabled, setStoreVoiceResponse]);

  // Check real mic permission
  useEffect(() => {
    async function checkMicPermission() {
      try {
        if (typeof navigator === 'undefined' || !navigator.permissions) {
          setMicStatus('unavailable');
          return;
        }
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicStatus(status.state as 'granted' | 'denied' | 'prompt');
        status.addEventListener('change', () => {
          setMicStatus(status.state as 'granted' | 'denied' | 'prompt');
        });
      } catch {
        setMicStatus('unavailable');
      }
    }
    checkMicPermission();
  }, []);

  const micStatusLabel: Record<string, { text: string; color: string }> = {
    granted: { text: 'Granted', color: 'text-success' },
    denied: { text: 'Denied', color: 'text-danger' },
    prompt: { text: 'Not yet asked', color: 'text-warning' },
    unavailable: { text: 'Unavailable', color: 'text-text-muted' },
    unknown: { text: 'Unknown', color: 'text-text-muted' },
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { code: 'hi-en', label: 'Hinglish', flag: '🇮🇳' },
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Sugar-free', 'Organic', 'Keto', 'Halal',
  ];

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      shoppingItems: items,
      pantry: pantryItems,
      preferences: { name, language, dietaryPreferences, darkMode },
      commandHistory: [],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopwise-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        // Validate basic structure
        if (!data.version || typeof data.version !== 'number') {
          alert('Invalid file: missing version');
          return;
        }

        // Replace existing data with imported data
        if (data.shoppingItems) {
          useShoppingStore.setState({ items: data.shoppingItems });
        }
        if (data.pantry) {
          useShoppingStore.setState({ pantryItems: data.pantry });
        }

        if (data.preferences) {
          const p = data.preferences;
          if (p.name) useUserStore.setState({ name: p.name });
          if (p.language) useUserStore.setState({ language: p.language });
          if (typeof p.darkMode === 'boolean') useUserStore.setState({ darkMode: p.darkMode });
          if (p.dietaryPreferences) useUserStore.setState({ dietaryPreferences: p.dietaryPreferences });
        }

        alert('Data imported successfully!');
      } catch {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be imported again
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  const handleDelete = () => {
    if (deleteInput !== 'DELETE') return;
    resetAll();        // Clear user preferences
    useUserStore.setState({
      name: 'Shopper',
      language: 'en',
      dietaryPreferences: [],
      darkMode: false,
      showDemo: false,
    });
    setShowDeleteConfirm(false);
    setDeleteInput('');
  };

  const pageContent = (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Customize your experience</p>
      </div>

      <SettingSection title="Appearance">
        <SettingRow icon={darkMode ? Moon : Sun} label="Dark Mode" description="Switch between light and dark themes">
          <Toggle checked={darkMode} onChange={toggleDarkMode} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Language">
        <SettingRow icon={Globe} label="Voice Language" description="Language for voice recognition">
          <div className="flex gap-1.5">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as 'en' | 'hi' | 'hi-en')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  language === lang.code
                    ? 'bg-primary text-white'
                    : 'bg-surface-hover text-text-secondary hover:bg-border',
                )}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Voice Responses">
        <SettingRow
          icon={Volume2}
          label="Voice Responses"
          description="Speak responses after voice commands"
        >
          <Toggle checked={vrEnabled} onChange={() => setVrEnabled(!vrEnabled)} />
        </SettingRow>
        {vrEnabled && (
          <>
            <div className="px-4 py-3.5">
              <p className="text-xs text-text-muted mb-2">Speech Rate</p>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRateLocal(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>Slow</span>
                <span>{speechRate.toFixed(1)}×</span>
                <span>Fast</span>
              </div>
            </div>
            <div className="px-4 py-3.5">
              <p className="text-xs text-text-muted mb-2">Speech Pitch</p>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitchLocal(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>Low</span>
                <span>{speechPitch.toFixed(1)}</span>
                <span>High</span>
              </div>
            </div>
          </>
        )}
      </SettingSection>

      <SettingSection title="Preferences">
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center">
              <Bell size={16} className="text-text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Dietary Preferences</p>
              <p className="text-xs text-text-muted mt-0.5">Used for personalized recommendations</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 ml-11">
            {dietaryOptions.map(option => {
              const isActive = dietaryPreferences.includes(option.toLowerCase());
              return (
                <button
                  key={option}
                  onClick={() => {
                    const lower = option.toLowerCase();
                    if (isActive) {
                      setDietaryPreferences(dietaryPreferences.filter(p => p !== lower));
                    } else {
                      setDietaryPreferences([...dietaryPreferences, lower]);
                    }
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-surface-hover text-text-secondary hover:bg-border',
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Privacy">
        <SettingRow icon={Shield} label="Voice Data" description="Audio is processed locally and not stored">
          <span className="text-xs text-success font-medium">Local Only</span>
        </SettingRow>
        <SettingRow icon={Shield} label="Microphone Permission" description="Required for voice commands">
          <span className={cn('text-xs font-medium', micStatusLabel[micStatus]?.color)}>
            {micStatusLabel[micStatus]?.text}
          </span>
        </SettingRow>
        <SettingRow icon={Download} label="Export Data" description="Download your shopping data as JSON">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-hover text-text-secondary hover:bg-border transition-all"
          >
            Export
          </button>
        </SettingRow>
        <SettingRow icon={Upload} label="Import Data" description="Restore from a previously exported file">
          <button
            onClick={() => importInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-hover text-text-secondary hover:bg-border transition-all"
          >
            Import
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </SettingRow>
        <SettingRow icon={Trash2} label="Delete All Data" description="Remove all shopping data and reset to defaults">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-all"
          >
            Delete All
          </button>
        </SettingRow>
      </SettingSection>

      <SettingSection title="About">
        <SettingRow icon={Info} label="Shopwise" description="Voice-first shopping intelligence platform">
          <span className="text-xs text-text-muted">v1.0.0</span>
        </SettingRow>
      </SettingSection>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
            >
              <div className="bg-surface rounded-2xl shadow-2xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-danger" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Delete All Data?</h3>
                  </div>
                </div>

                <p className="text-sm text-text-muted mb-4">
                  This will permanently remove:
                </p>
                <ul className="text-sm text-text-muted space-y-1 mb-4 ml-4">
                  <li>• Shopping lists and sessions</li>
                  <li>• Pantry data</li>
                  <li>• Purchase history</li>
                  <li>• Preferences</li>
                </ul>
                <p className="text-xs text-danger mb-4">
                  Type <strong>DELETE</strong> to confirm. This action cannot be undone.
                </p>

                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder='Type "DELETE" to confirm'
                  className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-danger mb-4"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-hover text-text-secondary text-sm font-medium hover:bg-border transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteInput !== 'DELETE'}
                    className={cn(
                      'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                      deleteInput === 'DELETE'
                        ? 'bg-danger text-white hover:bg-danger/90'
                        : 'bg-danger/10 text-danger/50 cursor-not-allowed',
                    )}
                  >
                    Delete Everything
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:flex">
        <DesktopNavigation />
        <main className="flex-1 max-w-2xl mx-auto px-6 py-8">
          {pageContent}
        </main>
      </div>

      <div className="md:hidden">
        <MobileNavigation />
        <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
          {pageContent}
        </main>
      </div>
    </div>
  );
}
