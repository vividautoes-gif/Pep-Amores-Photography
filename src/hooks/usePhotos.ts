import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export interface Photo {
  id: string;
  title: string;
  url: string;
  orientation: 'landscape' | 'portrait' | 'square';
  country: string;
  country_en?: string;
  country_ca?: string;
  city: string;
  city_en?: string;
  city_ca?: string;
  neighborhood?: string;
  neighborhood_en?: string;
  neighborhood_ca?: string;
  year: number;
  photoDate?: string;
  journeyId?: string;
  subtheme?: string;
  subtheme_en?: string;
  subtheme_ca?: string;
  tags: string[];
  tags_en?: string[];
  tags_ca?: string[];
  isLFI: boolean;
  lfiType: 'lfimastershot' | 'lfiexhibition' | 'lfi-picture-of-the-week' | 'none';
  lfiDate?: string;
  isFavorite: boolean;
  favoriteScore: number;
  isHero?: boolean;
  caption: string;
  caption_en: string;
  caption_ca: string;
  cameraModel?: string;
  lens?: string;
  focalLength?: string;
  exposureTime?: string;
  aperture?: string;
  iso?: string;
  createdAt: any;
  authorUid: string;
}

export interface Journey {
  id: string;
  title: string;
  country: string;
  country_en?: string;
  country_ca?: string;
  city?: string;
  city_en?: string;
  city_ca?: string;
  intro: string;
  intro_en?: string;
  intro_ca?: string;
  coverUrl?: string;
  hoverImages?: string[];
  subthemes: string[];
  subthemes_en?: string[];
  subthemes_ca?: string[];
  isSpecial?: boolean;
  createdAt: any;
}

export interface Comment {
  id: string;
  targetId: string;
  targetType: 'photo' | 'journey' | 'guestbook';
  userName: string;
  userEmail?: string;
  text: string;
  isApproved: boolean;
  createdAt: any;
}

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("usePhotos: initializing onSnapshot");
    const path = 'photos';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      console.log("usePhotos: onSnapshot received data, docs length:", snapshot.docs.length, "fromCache:", snapshot.metadata.fromCache);
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      setPhotos(photoData);
      
      // Only stop loading if we have data OR if it's not from cache (meaning we've hit the server)
      // This prevents flickering when the cache is empty but the server has data.
      if (photoData.length > 0 || !snapshot.metadata.fromCache) {
        setLoading(false);
      }
      setError(null);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    });

    return () => {
      console.log("usePhotos: unsubscribing");
      unsubscribe();
    };
  }, []);

  return { photos, loading, error };
};

export const useJourneys = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("useJourneys: initializing onSnapshot");
    const path = 'journeys';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      console.log("useJourneys: onSnapshot received data, docs length:", snapshot.docs.length, "fromCache:", snapshot.metadata.fromCache);
      const journeyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Journey[];
      setJourneys(journeyData);
      
      // If we have data, or we've received a response from the server (even if empty)
      if (journeyData.length > 0 || !snapshot.metadata.fromCache) {
        setLoading(false);
      }
      setError(null);
    }, (err) => {
      console.error("useJourneys: error", err);
      handleFirestoreError(err, OperationType.GET, path);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { journeys, loading, error };
};
