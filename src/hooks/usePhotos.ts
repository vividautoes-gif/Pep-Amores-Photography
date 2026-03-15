import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export interface Photo {
  id: string;
  title: string;
  title_en: string;
  title_ca: string;
  url: string;
  orientation: 'landscape' | 'portrait' | 'square';
  country: string;
  city: string;
  neighborhood?: string;
  year: number;
  journeyId?: string;
  subtheme?: string;
  tags: string[];
  isLFI: boolean;
  lfiType: 'lfimastershot' | 'lfiexhibition' | 'lfi-picture-of-the-week' | 'none';
  isFavorite: boolean;
  favoriteScore: number;
  isHero?: boolean;
  caption: string;
  caption_en: string;
  caption_ca: string;
  storyId?: string;
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
  city?: string;
  intro: string;
  intro_en?: string;
  intro_ca?: string;
  coverUrl?: string;
  subthemes: string[];
  createdAt: any;
}

export interface Story {
  id: string;
  title: string;
  title_en?: string;
  title_ca?: string;
  description: string;
  description_en?: string;
  description_ca?: string;
  coverUrl?: string;
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
    const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("usePhotos: onSnapshot received data, docs length:", snapshot.docs.length);
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      setPhotos(photoData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching photos:", err);
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

  useEffect(() => {
    const q = query(collection(db, 'journeys'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJourneys(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Journey[]);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching journeys:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { journeys, loading };
};

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Story[]);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching stories:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { stories, loading };
};
