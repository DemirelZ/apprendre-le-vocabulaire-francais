import { initializeApp } from "firebase/app";
import { collection, doc, getFirestore, writeBatch } from "firebase/firestore";
import {
  mockCategories,
  mockUnits,
  mockUserProgress,
  mockWords,
} from "../src/data/mockData";

// Firebase konfigürasyonu - gerçek değerlerinizi buraya yazın
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Veri aktarım fonksiyonları
export const uploadDataToFirebase = async () => {
  try {
    console.log("🔥 Firebase'e veri aktarımı başlıyor...");

    // Batch işlemi başlat
    const batch = writeBatch(db);

    // 1. Kategorileri yükle
    console.log("📚 Kategoriler yükleniyor...");
    mockCategories.forEach((category) => {
      const docRef = doc(collection(db, "categories"));
      batch.set(docRef, category);
    });

    // 2. Üniteleri yükle
    console.log("📖 Üniteler yükleniyor...");
    mockUnits.forEach((unit) => {
      const docRef = doc(collection(db, "units"));
      batch.set(docRef, unit);
    });

    // 3. Kelimeleri yükle (1000 kelime için batch işlemi)
    console.log("📝 Kelimeler yükleniyor...");
    mockWords.forEach((word) => {
      const docRef = doc(collection(db, "words"));
      batch.set(docRef, word);
    });

    // 4. Varsayılan kullanıcı ilerlemesini yükle
    console.log("👤 Kullanıcı ilerlemesi yükleniyor...");
    const userProgressRef = doc(collection(db, "userProgress"), "default");
    batch.set(userProgressRef, mockUserProgress);

    // Batch işlemini commit et
    await batch.commit();

    console.log("✅ Tüm veriler başarıyla Firebase'e yüklendi!");
    console.log(`📊 İstatistikler:`);
    console.log(`   - ${mockCategories.length} kategori`);
    console.log(`   - ${mockUnits.length} ünite`);
    console.log(`   - ${mockWords.length} kelime`);
  } catch (error) {
    console.error("❌ Veri aktarımında hata:", error);
    throw error;
  }
};

// Kategorilere göre kelime sayılarını göster
export const showWordCounts = () => {
  const counts: { [key: string]: number } = {};

  mockWords.forEach((word) => {
    counts[word.category] = (counts[word.category] || 0) + 1;
  });

  console.log("📊 Kategori bazında kelime sayıları:");
  Object.entries(counts).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} kelime`);
  });
};

// Script çalıştırma
if (require.main === module) {
  showWordCounts();
  uploadDataToFirebase()
    .then(() => {
      console.log("🎉 Script başarıyla tamamlandı!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script hatası:", error);
      process.exit(1);
    });
}
