import React, { useState, useEffect } from 'react';
import { X, Camera, User, Save, Trash2, AlertTriangle, Palette, Moon, Sun, Check, UserCircle } from 'lucide-react';
import { ThemeColor } from './ThemeSelectionModal'; // Importando o tipo para consistência

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentPhoto: string | null;
  onSave: (name: string, photo: string | null) => void;
  onDeleteAccount?: () => void;
  themeColor: string;
  currentTheme: ThemeColor;
  onSelectTheme: (theme: ThemeColor) => void;
  onToggleDarkMode: () => void;
  isDarkMode?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  currentName, 
  currentPhoto, 
  onSave, 
  onDeleteAccount,
  themeColor,
  currentTheme,
  onSelectTheme,
  onToggleDarkMode,
  isDarkMode = true
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance'>('profile');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  
  const fileInputId = 'profile-photo-input-id';

  const themes: { id: ThemeColor; name: string; colorClass: string }[] = [
    { id: 'lime', name: 'Lima', colorClass: 'bg-lime-500' },
    { id: 'emerald', name: 'Esmeralda', colorClass: 'bg-emerald-500' },
    { id: 'green', name: 'Verde', colorClass: 'bg-green-600' },
    { id: 'teal', name: 'Menta', colorClass: 'bg-teal-400' },
    { id: 'cyan', name: 'Ciano', colorClass: 'bg-cyan-500' },
    { id: 'yellow', name: 'Citrus', colorClass: 'bg-yellow-400' },
    { id: 'amber', name: 'Ouro', colorClass: 'bg-amber-500' },
    { id: 'slate', name: 'Grafite', colorClass: 'bg-slate-500' },
  ];

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setPhoto(currentPhoto);
      setActiveTab('profile'); // Reset to profile tab on open
    }
  }, [isOpen, currentName, currentPhoto]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert("A imagem é muito grande. Tente uma menor que 1MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, photo);
    onClose();
  };

  const triggerFileSelect = () => {
    document.getElementById(fileInputId)?.click();
  };

  const handleDeleteConfirm = () => {
      if (onDeleteAccount) {
          // Mantendo o confirm nativo apenas para o delete account por ser crítico
          const confirm = window.confirm("Tem certeza absoluta? Esta ação excluirá permanentemente sua conta e todos os dados associados.");
          if (confirm) {
              onDeleteAccount();
          }
      }
  };

  const styles = isDarkMode ? {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    textHead: 'text-white',
    textLabel: 'text-slate-400',
    inputBg: 'bg-slate-950',
    inputBorder: 'border-slate-800',
    inputText: 'text-white',
    closeHover: 'hover:text-white',
    photoBg: 'bg-slate-950',
    photoBorder: 'border-slate-800',
    deleteBg: 'bg-slate-950 border-rose-900/30',
    tabActive: `bg-slate-800 text-white border-${themeColor}-500`,
    tabInactive: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
    cardBg: 'bg-slate-950',
    cardBorder: 'border-slate-800'
  } : {
    bg: 'bg-white',
    border: 'border-slate-200',
    textHead: 'text-slate-900',
    textLabel: 'text-slate-500',
    inputBg: 'bg-slate-50',
    inputBorder: 'border-slate-200',
    inputText: 'text-slate-900',
    closeHover: 'hover:text-slate-700',
    photoBg: 'bg-slate-50',
    photoBorder: 'border-slate-200',
    deleteBg: 'bg-rose-50 border-rose-200',
    tabActive: `bg-slate-100 text-slate-900 border-${themeColor}-500`,
    tabInactive: 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
    cardBg: 'bg-slate-50',
    cardBorder: 'border-slate-200'
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        
        {/* Header with Tabs */}
        <div className={`flex flex-col border-b ${styles.border}`}>
            <div className="flex justify-between items-center p-5 pb-2">
                <h2 className={`text-lg font-bold ${styles.textHead}`}>Configurações</h2>
                <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
                    <X size={20} />
                </button>
            </div>
            <div className="flex px-5 gap-4">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 px-2 text-sm font-medium transition-all border-b-2 ${activeTab === 'profile' ? `text-${themeColor}-500 border-${themeColor}-500` : 'text-slate-500 border-transparent hover:text-slate-400'}`}
                >
                    <div className="flex items-center gap-2">
                        <UserCircle size={16} /> Perfil
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('appearance')}
                    className={`pb-3 px-2 text-sm font-medium transition-all border-b-2 ${activeTab === 'appearance' ? `text-${themeColor}-500 border-${themeColor}-500` : 'text-slate-500 border-transparent hover:text-slate-400'}`}
                >
                    <div className="flex items-center gap-2">
                        <Palette size={16} /> Aparência
                    </div>
                </button>
            </div>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
            
            {/* --- TAB PERFIL --- */}
            {activeTab === 'profile' && (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Foto Area */}
                        <div className="flex flex-col items-center gap-4">
                            <div 
                            className={`relative w-28 h-28 rounded-full overflow-hidden border-4 ${styles.photoBorder} shadow-xl group cursor-pointer ${styles.photoBg} flex items-center justify-center`}
                            onClick={triggerFileSelect}
                            >
                            {photo ? (
                                <img src={photo} alt="Perfil" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className={`text-${themeColor}-500 opacity-50`} />
                            )}
                            
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                            </div>
                            
                            <input 
                            id={fileInputId}
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            />

                            <button 
                                type="button" 
                                onClick={triggerFileSelect}
                                className={`text-xs ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'} underline`}
                            >
                                Alterar Foto
                            </button>
                        </div>

                        {/* Nome Input */}
                        <div>
                            <label className={`block text-sm font-medium ${styles.textLabel} mb-2`}>Seu Nome</label>
                            <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full ${styles.inputBg} border ${styles.inputBorder} rounded-xl px-4 py-3 ${styles.inputText} outline-none focus:border-${themeColor}-500 transition-colors`}
                            placeholder="Como você quer ser chamado?"
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-3 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-bold rounded-xl shadow-lg shadow-${themeColor}-900/20 transition-all flex items-center justify-center gap-2`}
                        >
                            <Save size={18} />
                            Salvar Alterações
                        </button>
                    </form>

                    {onDeleteAccount && (
                        <div className={`pt-6 mt-6 border-t ${styles.border}`}>
                            <div className={`${styles.deleteBg} border rounded-xl p-4`}>
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                                    <div>
                                        <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Zona de Perigo</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Excluir sua conta removerá todos os seus dados.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDeleteConfirm}
                                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 border border-rose-500/20 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Excluir Minha Conta
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- TAB APARÊNCIA --- */}
            {activeTab === 'appearance' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    
                    {/* Dark Mode Toggle */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${styles.cardBg} ${styles.cardBorder}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-lime-500/20 text-lime-400' : 'bg-amber-500/20 text-amber-500'}`}>
                                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                    {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
                                </p>
                                <p className="text-xs text-slate-500">Aparência do ambiente</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={onToggleDarkMode}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-lime-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className={`h-px w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

                    {/* Colors Grid */}
                    <div>
                        <p className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cor de Destaque</p>
                        <div className="grid grid-cols-2 gap-3">
                        {themes.map((theme) => (
                            <button
                            key={theme.id}
                            onClick={() => onSelectTheme(theme.id)}
                            className={`relative p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 group ${
                                currentTheme === theme.id 
                                ? (isDarkMode ? 'bg-slate-800 border-white/20 ring-1 ring-white/20' : 'bg-slate-100 border-slate-300 ring-1 ring-slate-300') 
                                : (isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300')
                            }`}
                            >
                            <div className={`w-6 h-6 rounded-full ${theme.colorClass} shadow-md flex items-center justify-center shrink-0`}>
                                {currentTheme === theme.id && <Check size={12} className={['lime', 'yellow', 'cyan', 'teal'].includes(theme.id) ? "text-slate-900" : "text-white"} />}
                            </div>
                            <span className={`text-xs font-medium ${
                                currentTheme === theme.id 
                                ? (isDarkMode ? 'text-white' : 'text-slate-900') 
                                : 'text-slate-400'
                            }`}>
                                {theme.name}
                            </span>
                            </button>
                        ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};