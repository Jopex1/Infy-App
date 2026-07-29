"use client";
import { useState, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const STORAGE_KEY = "infy_kids";

function syncToLocalStorage(kids) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kids));
  }
}

export function useChildren() {
  const [user, setUser] = useState(null);
  const [kids, setKids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        const stored = localStorage.getItem(STORAGE_KEY);
        setKids(stored ? JSON.parse(stored) : []);
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "children"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const kidsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setKids(kidsData);
      syncToLocalStorage(kidsData);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const addChild = async (childData, avatarFile = null) => {
    if (!user) {
      const newKid = {
        ...childData,
        id: Date.now().toString(),
        vaccineRecords: [],
        weighingRecords: [],
        vitaminARecords: [],
        dewormingRecords: [],
      };
      const updated = [...kids, newKid];
      setKids(updated);
      syncToLocalStorage(updated);
      return newKid.id;
    }

    let avatarUrl = childData.avatar || "";
    if (avatarFile) {
      const imageRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
      await uploadBytes(imageRef, avatarFile);
      avatarUrl = await getDownloadURL(imageRef);
    }

    const childDoc = {
      userId: user.uid,
      name: childData.name,
      dob: childData.dob,
      gender: childData.gender,
      weight: childData.weight || "",
      height: childData.height || "",
      placeBirth: childData.placeBirth || "",
      avatar: avatarUrl,
      vaccineRecords: [],
      weighingRecords: [],
      vitaminARecords: [],
      dewormingRecords: [],
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "children"), childDoc);
    return docRef.id;
  };

  const updateChild = async (id, childData, avatarFile = null) => {
    if (!user) {
      const updated = kids.map((k) => (k.id === id ? { ...k, ...childData } : k));
      setKids(updated);
      syncToLocalStorage(updated);
      return;
    }

    let avatarUrl = childData.avatar;
    if (avatarFile) {
      const imageRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
      await uploadBytes(imageRef, avatarFile);
      avatarUrl = await getDownloadURL(imageRef);
    }

    const kidRef = doc(db, "children", id);
    const updateData = {
      name: childData.name,
      dob: childData.dob,
      gender: childData.gender,
      weight: childData.weight || "",
      height: childData.height || "",
      placeBirth: childData.placeBirth || "",
    };
    if (avatarUrl) updateData.avatar = avatarUrl;
    await updateDoc(kidRef, updateData);
  };

  const deleteChild = async (id) => {
    if (!user) {
      const updated = kids.filter((k) => k.id !== id);
      setKids(updated);
      syncToLocalStorage(updated);
      return;
    }
    await deleteDoc(doc(db, "children", id));
  };

  return { kids, loading, user, addChild, updateChild, deleteChild };
}
