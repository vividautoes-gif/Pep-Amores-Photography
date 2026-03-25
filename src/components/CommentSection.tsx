import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { MessageSquare } from 'lucide-react';
import { db } from '../firebase';
import { FlowButton } from './ui/flow-button';
import { formatDate } from '../lib/utils';
import { Strings } from '../data';
import { translateMetadata } from '../services/geminiService';

interface CommentSectionProps {
  targetId: string;
  targetType: 'photo' | 'journey' | 'guestbook';
  lang: string;
  isDark?: boolean;
  imageUrl?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ targetId, targetType, lang, isDark = true, imageUrl }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const s = (Strings as any)[lang] || Strings.es;

  useEffect(() => {
    const q = query(
      collection(db, 'comments'), 
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [targetId, targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Translate comment to es, en, ca
      const translations = await translateMetadata(newComment, ['es', 'en', 'ca']);
      
      await addDoc(collection(db, 'comments'), {
        targetId,
        targetType,
        userName,
        text: newComment,
        text_es: translations.es || newComment,
        text_en: translations.en || newComment,
        text_ca: translations.ca || newComment,
        isApproved: false,
        createdAt: serverTimestamp()
      });
      setNewComment('');
      setUserName('');
      alert(s.labels.moderationNote);
    } catch (error) {
      console.error("Error adding comment: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const textColor = isDark ? 'text-white' : 'text-neutral-900';
  const borderColor = isDark ? 'border-white/10' : 'border-neutral-200';
  const bgColor = isDark ? 'bg-white/5' : 'bg-neutral-50';
  const mutedTextColor = isDark ? 'text-white/40' : 'text-neutral-500';

  return (
    <div className={`mt-8 pt-8 border-t ${borderColor}`}>
      <h3 className={`text-lg font-serif italic mb-6 flex items-center gap-2 ${textColor}`}>
        <MessageSquare size={18} className="text-[#B45309]" />
        {s.labels.comments}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-12">
        {imageUrl && (
          <div className={`flex items-center gap-4 p-2 rounded-xl ${bgColor} border ${borderColor} mb-4`}>
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img src={imageUrl} alt="Context" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${mutedTextColor}`}>
                {targetType === 'photo' 
                  ? (lang === 'es' ? 'Comentando Fotografía' : lang === 'en' ? 'Commenting Photo' : 'Comentant Fotografia')
                  : (lang === 'es' ? 'Comentando Diario' : lang === 'en' ? 'Commenting Journal' : 'Comentant Diari')
                }
              </span>
              <span className={`text-[10px] font-serif italic ${textColor} opacity-80`}>
                {targetType === 'photo' ? 'Leica Photography' : 'Travel Journal'}
              </span>
            </div>
          </div>
        )}

        <input 
          type="text" 
          placeholder={s.labels.name} 
          value={userName} 
          onChange={e => setUserName(e.target.value)}
          className={`w-full ${bgColor} border ${borderColor} rounded-xl p-3 text-sm ${textColor} outline-none focus:ring-1 focus:ring-[#B45309]/50 transition-all`}
          required
        />
        <textarea 
          placeholder={s.labels.commentPlaceholder} 
          value={newComment} 
          onChange={e => setNewComment(e.target.value)}
          className={`w-full ${bgColor} border ${borderColor} rounded-xl p-3 text-sm ${textColor} outline-none focus:ring-1 focus:ring-[#B45309]/50 h-24 resize-none transition-all`}
          required
        />
        <div className="flex justify-end">
          <FlowButton 
            type="submit"
            text={s.labels.sendComment}
          />
        </div>
      </form>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <p className={`text-xs ${mutedTextColor} italic text-center py-4`}>
            {lang === 'es' ? 'No hay comentarios aún.' : lang === 'en' ? 'No comments yet.' : 'No hi ha comentaris encara.'}
          </p>
        ) : (
          comments.map(c => (
            <div key={c.id} className={`${bgColor} p-4 rounded-xl border ${isDark ? 'border-white/5' : 'border-neutral-100'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-[10px] uppercase tracking-widest text-[#B45309]">{c.userName}</span>
                <span className={`text-[9px] ${mutedTextColor} font-mono`}>
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-white/70' : 'text-neutral-700'} leading-relaxed`}>
                {lang === 'es' ? (c.text_es || c.text) : lang === 'en' ? (c.text_en || c.text) : (c.text_ca || c.text)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
