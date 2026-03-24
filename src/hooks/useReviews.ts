import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface Review {
  id: string;
  name: string;
  text: string;
  createdAt: any;
  approved: boolean;
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
      setReviews(isAdmin ? reviewsData : reviewsData.filter(r => r.approved));
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
      await addDoc(collection(db, 'reviews'), {
        name,
        text,
        createdAt: serverTimestamp(),
        approved: false // Default to false for moderation
      });
      return { success: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reviews');
      return { success: false, error: err };
    }
  };

  const approveReview = async (id: string, approved: boolean) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'reviews', id), { approved });
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
