import React, { useState, useEffect } from 'react';
import { X, Camera, User, Save, Trash2, AlertTriangle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentPhoto: string | null;
  onSave: (name: string, photo: string | null) => void;
  onDeleteAccount?: () => void;
  themeColor: string;
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
  isDarkMode = true
}) => {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Usar ID fixo em vez de useRef
  const fileInputId = 'profile-photo-input-id';

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setPhoto(currentPhoto);
      setIsDeleting(false);
    }
  }, [isOpen, currentName, currentPhoto]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit for Firestore sync safety
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
    deleteBg: 'bg-slate-950 border-rose-900/30'
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
    deleteBg: 'bg-rose-50 border-rose-200'
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${styles.bg} border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden`}>
        <div className={`flex justify-between items-center p-5 border-b ${styles.border}`}>
          <h2 className={`text-lg font-bold ${styles.textHead}`}>Editar Perfil</h2>
          <button onClick={onClose} className={`text-slate-400 ${styles.closeHover} transition-colors`}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto Area */}
            <div className="flex flex-col items-center gap-4">
                <div 
                className={`relative w-32 h-32 rounded-full overflow-hidden border-4 ${styles.photoBorder} shadow-xl group cursor-pointer ${styles.photoBg} flex items-center justify-center`}
                onClick={triggerFileSelect}
                >
                {photo ? (
                    <img src={photo} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                    <User size={48} className={`text-${themeColor}-500 opacity-50`} />
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

                <div className="flex gap-2">
                <button 
                    type="button" 
                    onClick={triggerFileSelect}
                    className={`text-xs ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'} underline`}
                >
                    Alterar Foto
                </button>
                {photo && (
                    <button 
                    type="button" 
                    onClick={() => setPhoto(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 underline"
                    >
                    Remover
                    </button>
                )}
                </div>
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
                                    Excluir sua conta removerá todos os seus dados. Esta ação não pode ser desfeita.
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
      </div>
    </div>
  );
};