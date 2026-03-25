import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { doc, updateDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { usePhotos, useJourneys, Photo, Journey } from '../../hooks/usePhotos';
import { translateMetadata, translateObject } from '../../services/geminiService';
import { formatDate } from '../../lib/utils';
import { Loader2, Trash2, Save, Edit2, X, MapPin, Tag, Camera, Calendar, Award, Star, Globe } from 'lucide-react';

export const PhotoManager: React.FC = () => {
  const { photos, loading } = usePhotos();
  const { journeys, loading: journeysLoading } = useJourneys();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Photo>>({});
  const [saving, setSaving] = useState(false);

  const handleEdit = (photo: Photo) => {
    setEditingId(photo.id);
    setEditData({
      ...photo,
      tags: photo.tags.join(', ')
    } as any);
  };

  const handleSave = async (id: string) => {
    try {
      setSaving(true);
      console.log("Saving photo with translation...", editData);
      const finalData = { ...editData };
      if (typeof finalData.tags === 'string') {
        finalData.tags = (finalData.tags as string).split(',').map(t => t.trim().toLowerCase()).filter(t => t);
      }
      
      const originalPhoto = photos.find(p => p.id === editingId);
      const captionChanged = originalPhoto && originalPhoto.caption !== finalData.caption;

      if (captionChanged && !finalData.caption) {
        finalData.caption_en = '';
        finalData.caption_ca = '';
      }

      // Translate fields
      const fieldsToTranslate: any = {};
      if (finalData.caption && captionChanged) fieldsToTranslate.caption = finalData.caption;
      if (!finalData.country_en || !finalData.country_ca) fieldsToTranslate.country = finalData.country || '';
      if (!finalData.city_en || !finalData.city_ca) fieldsToTranslate.city = finalData.city || '';
      if (!finalData.neighborhood_en || !finalData.neighborhood_ca) fieldsToTranslate.neighborhood = finalData.neighborhood || '';
      fieldsToTranslate.subtheme = finalData.subtheme || '';
      if (!finalData.tags_en || !finalData.tags_ca) {
        fieldsToTranslate.tags = Array.isArray(finalData.tags) ? finalData.tags.join(', ') : (finalData.tags || '');
      }
      const objTrans = await translateObject(fieldsToTranslate, ['es', 'en', 'ca']);
      
      if (objTrans.es) {
        if (objTrans.es.caption && captionChanged) finalData.caption = objTrans.es.caption;
        if (objTrans.es.country) finalData.country = finalData.country || objTrans.es.country;
        if (objTrans.es.city) finalData.city = finalData.city || objTrans.es.city;
        if (objTrans.es.neighborhood) finalData.neighborhood = finalData.neighborhood || objTrans.es.neighborhood;
        if (objTrans.es.subtheme) finalData.subtheme = finalData.subtheme || objTrans.es.subtheme;
        if (objTrans.es.tags && !finalData.tags) finalData.tags = objTrans.es.tags.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t);
      }
      if (typeof finalData.tags === 'string') {
        finalData.tags = finalData.tags.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t);
      }
      if (objTrans.en) {
        if (objTrans.en.caption && captionChanged) finalData.caption_en = objTrans.en.caption;
        if (objTrans.en.country) finalData.country_en = finalData.country_en || objTrans.en.country;
        if (objTrans.en.city) finalData.city_en = finalData.city_en || objTrans.en.city;
        if (objTrans.en.neighborhood) finalData.neighborhood_en = finalData.neighborhood_en || objTrans.en.neighborhood;
        if (objTrans.en.subtheme) finalData.subtheme_en = finalData.subtheme_en || objTrans.en.subtheme;
        if (objTrans.en.tags && !finalData.tags_en) finalData.tags_en = objTrans.en.tags.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t);
      }
      if (typeof finalData.tags_en === 'string') {
        finalData.tags_en = finalData.tags_en.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t);
      }
      if (objTrans.ca) {
        if (objTrans.ca.caption && captionChanged) finalData.caption_ca = objTrans.ca.caption;
        if (objTrans.ca.country) finalData.country_ca = finalData.country_ca || objTrans.ca.country;
        if (objTrans.ca.city) finalData.city_ca = finalData.city_ca || objTrans.ca.city;
        if (objTrans.ca.neighborhood) finalData.neighborhood_ca = finalData.neighborhood_ca || objTrans.ca.neighborhood;
        if (objTrans.ca.subtheme) finalData.subtheme_ca = finalData.subtheme_ca || objTrans.ca.subtheme;
        if (objTrans.ca.tags && !finalData.tags_ca) finalData.tags_ca = objTrans.ca.tags.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t);
      }
      if (typeof finalData.tags_ca === 'string') {
        finalData.tags_ca = finalData.tags_ca.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t);
      }
      
      console.log("Final photo data to save:", finalData);
      await updateDoc(doc(db, 'photos', id), finalData);
      setEditingId(null);
      setSaving(false);
      alert('Foto actualizada con éxito');
    } catch (error) {
      console.error(error);
      setSaving(false);
      alert('Error al actualizar la fotografía');
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm('¿Estás seguro de que quieres eliminar permanentemente esta fotografía? Esta acción no se puede deshacer.')) return;
    try {
      await deleteDoc(doc(db, 'photos', photo.id));
      try {
        const storageRef = ref(storage, photo.url);
        await deleteObject(storageRef);
      } catch (e) {
        console.warn('No se pudo borrar el archivo de storage:', e);
      }
      alert('Fotografía eliminada');
    } catch (error) {
      console.error(error);
      alert('Error al eliminar la fotografía');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        {photos.map(photo => (
          <div key={photo.id} className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Image Preview */}
              <div className="lg:w-1/3 relative aspect-video lg:aspect-square">
                <img src={photo.url} className="w-full h-full object-cover" />
                {photo.isLFI && (
                  <div className="absolute top-4 left-4 bg-leica-red text-white text-[10px] font-black uppercase px-2 py-1 rounded-sm shadow-lg">
                    LFI
                  </div>
                )}
              </div>

              {/* Content / Editor */}
              <div className="flex-1 p-6 lg:p-8">
                {editingId === photo.id ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Título</label>
                          <input 
                            value={editData.title || ''} 
                            onChange={e => setEditData({...editData, title: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Descripción</label>
                          <textarea 
                            value={editData.caption || ''} 
                            onChange={e => setEditData({...editData, caption: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none h-24" 
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">País (ES)</label>
                          <input 
                            value={editData.country || ''} 
                            onChange={e => setEditData({...editData, country: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">País (EN)</label>
                          <input 
                            value={editData.country_en || ''} 
                            onChange={e => setEditData({...editData, country_en: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">País (CA)</label>
                          <input 
                            value={editData.country_ca || ''} 
                            onChange={e => setEditData({...editData, country_ca: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Ciudad (ES)</label>
                          <input 
                            value={editData.city || ''} 
                            onChange={e => setEditData({...editData, city: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Ciudad (EN)</label>
                          <input 
                            value={editData.city_en || ''} 
                            onChange={e => setEditData({...editData, city_en: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Ciudad (CA)</label>
                          <input 
                            value={editData.city_ca || ''} 
                            onChange={e => setEditData({...editData, city_ca: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Barrio (ES)</label>
                          <input 
                            value={editData.neighborhood || ''} 
                            onChange={e => setEditData({...editData, neighborhood: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Barrio (EN)</label>
                          <input 
                            value={editData.neighborhood_en || ''} 
                            onChange={e => setEditData({...editData, neighborhood_en: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Barrio (CA)</label>
                          <input 
                            value={editData.neighborhood_ca || ''} 
                            onChange={e => setEditData({...editData, neighborhood_ca: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Subtema (ES)</label>
                          <input 
                            value={editData.subtheme || ''} 
                            onChange={e => setEditData({...editData, subtheme: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Subtema (EN)</label>
                          <input 
                            value={editData.subtheme_en || ''} 
                            onChange={e => setEditData({...editData, subtheme_en: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Subtema (CA)</label>
                          <input 
                            value={editData.subtheme_ca || ''} 
                            onChange={e => setEditData({...editData, subtheme_ca: e.target.value})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Año</label>
                        <input 
                          type="number"
                          value={editData.year || ''} 
                          onChange={e => setEditData({...editData, year: parseInt(e.target.value)})} 
                          className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Viaje</label>
                        <select 
                          value={editData.journeyId || ''} 
                          onChange={e => setEditData({...editData, journeyId: e.target.value})} 
                          className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none"
                        >
                          <option value="">Ninguno</option>
                          {journeys.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                        </select>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Hashtags (ES)</label>
                          <input 
                            value={editData.tags as any || ''} 
                            onChange={e => setEditData({...editData, tags: e.target.value as any})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Hashtags (EN)</label>
                          <input 
                            value={editData.tags_en as any || ''} 
                            onChange={e => setEditData({...editData, tags_en: e.target.value as any})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-gray-400 mb-1 block">Hashtags (CA)</label>
                          <input 
                            value={editData.tags_ca as any || ''} 
                            onChange={e => setEditData({...editData, tags_ca: e.target.value as any})} 
                            className="w-full p-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none" 
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-4 pt-2">
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editData.isFavorite} onChange={e => setEditData({...editData, isFavorite: e.target.checked})} className="rounded text-black focus:ring-black" />
                            <span className="text-xs font-medium uppercase tracking-wider">Favorita</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editData.isHero} onChange={e => setEditData({...editData, isHero: e.target.checked})} className="rounded text-black focus:ring-black" />
                            <span className="text-xs font-medium uppercase tracking-wider">Hero</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editData.isLFI} onChange={e => setEditData({...editData, isLFI: e.target.checked})} className="rounded text-red-600 focus:ring-red-600" />
                            <span className="text-xs font-medium uppercase tracking-wider text-red-600">LFI</span>
                          </label>
                        </div>

                        {editData.isLFI && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                            <div>
                              <label className="text-[10px] font-mono uppercase text-red-400 mb-1 block">Tipo LFI</label>
                              <select 
                                value={editData.lfiType || 'none'} 
                                onChange={e => setEditData({...editData, lfiType: e.target.value as any})} 
                                className="w-full p-2 bg-white border-none rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none"
                              >
                                <option value="none">Ninguno</option>
                                <option value="lfimastershot">Mastershot</option>
                                <option value="lfiexhibition">Exhibition</option>
                                <option value="lfi-picture-of-the-week">Picture of the Week</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-mono uppercase text-red-400 mb-1 block">Fecha Leica</label>
                              <input 
                                type="date"
                                value={editData.lfiDate || ''} 
                                onChange={e => setEditData({...editData, lfiDate: e.target.value})} 
                                className="w-full p-2 bg-white border-none rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none" 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-neutral-100">
                      <button 
                        onClick={() => handleSave(photo.id)} 
                        disabled={saving}
                        className="flex-1 py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Guardando y traduciendo...' : 'Guardar Cambios'}
                      </button>
                      <button 
                        onClick={() => setEditingId(null)} 
                        disabled={saving}
                        className="px-6 py-3 bg-neutral-100 text-gray-500 rounded-xl font-medium hover:bg-neutral-200 transition-all disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-serif italic">{photo.title || 'Sin título'}</h3>
                          <div className="flex items-center gap-3 mt-1 text-gray-400">
                            <div className="flex items-center gap-1 text-xs">
                              <MapPin size={12} />
                              {photo.city}, {photo.country}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar size={12} />
                              {photo.photoDate ? formatDate(photo.photoDate) : photo.year}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {photo.isFavorite && <Star size={16} className="text-amber-500 fill-amber-500" />}
                          {photo.isHero && <Globe size={16} className="text-blue-500" />}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {photo.tags?.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-neutral-100 text-[10px] text-gray-500 rounded-md flex items-center gap-1">
                            <Tag size={8} />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {photo.caption && (
                        <p className="text-sm text-gray-600 line-clamp-3 mt-4">
                          {photo.caption}
                        </p>
                      )}

                      {photo.isLFI && (
                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                          <Award size={16} className="text-leica-red" />
                          <div className="text-[10px] font-mono uppercase text-leica-red font-bold">
                            {photo.lfiType} {photo.lfiDate && `• ${formatDate(photo.lfiDate)}`}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-8 pt-6 border-t border-neutral-100">
                      <button 
                        onClick={() => handleEdit(photo)} 
                        className="flex-1 py-3 bg-neutral-100 text-black rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all"
                      >
                        <Edit2 size={18} />
                        Editar Datos
                      </button>
                      <button 
                        onClick={() => handleDelete(photo)} 
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                        title="Eliminar Fotografía"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
