# 🔥 Firebase Entegrasyon Rehberi

## 📋 Özet

Bu rehber, 1000 civarı kelimeyi Firebase Firestore'a aktarmak ve yönetmek için gerekli adımları içerir.

## 🚀 Kurulum Adımları

### 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. "Yeni Proje Oluştur" butonuna tıklayın
3. Proje adını girin (örn: "fransizca-yds-yokdil")
4. Google Analytics'i etkinleştirin (opsiyonel)
5. Projeyi oluşturun

### 2. Firestore Database Kurulumu

1. Sol menüden "Firestore Database"i seçin
2. "Veritabanı oluştur" butonuna tıklayın
3. Güvenlik modunu seçin:
   - **Test modu**: Geliştirme için (30 gün)
   - **Üretim modu**: Güvenli (önerilen)
4. Veritabanı konumunu seçin (Türkiye'ye yakın bir bölge)

### 3. Firebase Konfigürasyonu

1. Proje ayarlarına gidin (⚙️ simgesi)
2. "Genel" sekmesinde aşağıya kaydırın
3. "Firebase SDK snippet" bölümünü bulun
4. "Config" seçeneğini seçin
5. Konfigürasyon kodunu kopyalayın

### 4. Konfigürasyonu Uygulama

`src/config/firebase.ts` dosyasındaki `firebaseConfig` nesnesini güncelleyin:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

## 📊 Veri Yapısı

### Koleksiyonlar

- **`words`**: Tüm kelimeler (1000+ kayıt)
- **`units`**: Üniteler (20+ kayıt)
- **`categories`**: Kategoriler (5 kayıt)
- **`userProgress`**: Kullanıcı ilerlemesi

### Firestore Güvenlik Kuralları

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kelimeler - herkes okuyabilir, sadece admin yazabilir
    match /words/{wordId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Üniteler - herkes okuyabilir
    match /units/{unitId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Kategoriler - herkes okuyabilir
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Kullanıcı ilerlemesi - sadece kendi verilerini yazabilir
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔄 Veri Aktarımı

### Otomatik Aktarım

```bash
# Script'i çalıştır
npx ts-node scripts/uploadToFirebase.ts
```

### Manuel Aktarım

1. Firebase Console'da Firestore Database'e gidin
2. "Veri" sekmesini seçin
3. "Koleksiyon başlat" butonuna tıklayın
4. Koleksiyon adını girin (örn: "words")
5. İlk dokümanı ekleyin

## 💰 Maliyet Tahmini

### Firestore Fiyatlandırması (2024)

- **Okuma**: 100,000 okuma/ay = Ücretsiz
- **Yazma**: 20,000 yazma/ay = Ücretsiz
- **Silme**: 20,000 silme/ay = Ücretsiz
- **Depolama**: 1GB/ay = Ücretsiz

### 1000 Kelime İçin Tahmini Kullanım

- **Günlük okuma**: 1000 kelime × 10 kullanıcı = 10,000 okuma/gün
- **Aylık okuma**: 300,000 okuma/ay
- **Maliyet**: ~$0.36/ay (ücretsiz kotayı aştıktan sonra)

## 🚀 Performans Optimizasyonu

### 1. İndeksleme

Firestore'da otomatik indeksler oluşturun:

- `category` alanı için
- `unit` alanı için
- `difficulty` alanı için

### 2. Sayfalama

Büyük veri setleri için sayfalama kullanın:

```typescript
const getWordsWithPagination = async (limit: number, lastDoc?: any) => {
  let q = query(collection(db, "words"), orderBy("id"), limit(limit));

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  return getDocs(q);
};
```

### 3. Önbellekleme

React Query veya SWR kullanarak önbellekleme yapın:

```typescript
import { useQuery } from "@tanstack/react-query";

const useWords = () => {
  return useQuery({
    queryKey: ["words"],
    queryFn: wordService.getAllWords,
    staleTime: 5 * 60 * 1000, // 5 dakika
    cacheTime: 10 * 60 * 1000, // 10 dakika
  });
};
```

## 🔧 Geliştirme Ortamı

### Environment Variables

`.env` dosyası oluşturun:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id
```

### Konfigürasyonu Güncelleme

```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
```

## 🧪 Test Etme

### Veri Aktarım Testi

```bash
# Test script'ini çalıştır
npm run test:firebase
```

### Performans Testi

```bash
# 1000 kelimeyi yükle ve test et
npm run test:performance
```

## 📱 Uygulama Entegrasyonu

### Hook Kullanımı

```typescript
import { useFirebase } from "../hooks/useFirebase";

const MyComponent = () => {
  const { words, loading, error, getWordsByCategory } = useFirebase();

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div>
      {words.map((word) => (
        <div key={word.id}>{word.french}</div>
      ))}
    </div>
  );
};
```

## 🔒 Güvenlik

### Authentication

Firebase Auth kullanarak kullanıcı girişi:

```typescript
import { signInWithEmailAndPassword } from "firebase/auth";

const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Giriş hatası:", error);
  }
};
```

### Admin Paneli

Sadece admin kullanıcıların veri ekleyebilmesi için:

```typescript
const isAdmin = async () => {
  const user = auth.currentUser;
  if (!user) return false;

  const token = await user.getIdTokenResult();
  return token.claims.admin === true;
};
```

## 📈 Monitoring

### Firebase Analytics

Kullanıcı davranışlarını takip edin:

```typescript
import { getAnalytics, logEvent } from "firebase/analytics";

const analytics = getAnalytics(app);

// Kelime öğrenildiğinde
logEvent(analytics, "word_learned", {
  word_id: wordId,
  category: word.category,
  difficulty: word.difficulty,
});
```

### Error Tracking

Hataları takip edin:

```typescript
import { getPerformance } from "firebase/performance";

const perf = getPerformance(app);
```

## 🎯 Sonraki Adımlar

1. **Firebase Console'da proje oluşturun**
2. **Konfigürasyonu güncelleyin**
3. **Veri aktarım script'ini çalıştırın**
4. **Güvenlik kurallarını ayarlayın**
5. **Uygulamayı test edin**
6. **Performans optimizasyonu yapın**

## 📞 Destek

Sorun yaşarsanız:

- [Firebase Dokümantasyonu](https://firebase.google.com/docs)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
