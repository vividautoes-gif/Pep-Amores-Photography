import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface Review {
  id: string;
  name: string;
  text: string;
  text_es?: string;
  text_en?: string;
  text_ca?: string;
  originalLang?: string;
  createdAt: any;
  isApproved: boolean;
}

export function useReviews(isAdmin: boolean = false) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      // If admin, show all. If public, only approved.
      setReviews(isAdmin ? reviewsData : reviewsData.filter(r => r.isApproved));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'reviews');
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const addReview = async (name: string, text: string) => {
    try {
      const { translateReview, translateMetadata } = await import('../services/geminiService');
      
      let text_es = text;
      let text_en = text;
      let text_ca = text;
      let originalLang = 'es'; // default
      
      try {
        // First get the original language and English translation (or another target)
        const reviewTrans = await translateReview(text, 'en');
        if (reviewTrans) {
          originalLang = reviewTrans.originalLang;
          text_en = reviewTrans.translatedText;
          
          // Now translate to the other languages
          const otherTrans = await translateMetadata(text, ['es', 'ca']);
          if (otherTrans.es) text_es = otherTrans.es;
          if (otherTrans.ca) text_ca = otherTrans.ca;
        }
      } catch (e) {
        console.error("Error translating review:", e);
      }

      await addDoc(collection(db, 'reviews'), {
        name,
        text,
        text_es,
        text_en,
        text_ca,
        originalLang,
        createdAt: serverTimestamp(),
        isApproved: false // Default to false for moderation
      });
      return { success: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reviews');
      return { success: false, error: err };
    }
  };

  const approveReview = async (id: string, isApproved: boolean) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'reviews', id), { isApproved });
      return { success: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'reviews');
      return { success: false, error: err };
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'reviews', id));
      return { success: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'reviews');
      return { success: false, error: err };
    }
  };

  return { reviews, loading, error, addReview, approveReview, deleteReview };
}
