import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, serverTimestamp } from 'firebase/database';

const blogFirebaseConfig = {
  apiKey: "AIzaSyDjmcE7CiKrNpSnu20gFB2cG620HU36Zqg",
  authDomain: "gen-lang-client-0836251512.firebaseapp.com",
  databaseURL: "https://gen-lang-client-0836251512-default-rtdb.firebaseio.com",
  projectId: "gen-lang-client-0836251512",
  storageBucket: "gen-lang-client-0836251512.firebasestorage.app",
  messagingSenderId: "811711024905",
  appId: "1:811711024905:web:b805531d56342ba41b8dd8"
};

const blogApp = initializeApp(blogFirebaseConfig, 'blogs');
const blogDb = getDatabase(blogApp);
const blogsRef = ref(blogDb, 'blogs');

export interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  source: string;
  status: 'draft' | 'published';
  createdAt: number;
  updatedAt: number;
  image: {
    url: string;
    alt: string;
    source: string;
    photographer: string;
    license: string;
    status: 'attached' | 'pending';
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    tags: string[];
    focusKeyword: string;
    secondaryKeywords: string[];
  };
}

export async function saveBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const newRef = push(blogsRef);
  const now = Date.now();
  const fullPost: BlogPost = {
    ...post,
    createdAt: now,
    updatedAt: now,
  };
  await set(newRef, fullPost);
  return newRef.key!;
}
