Implement Productive Idle Blog Mode for Beatrice.

Goal:
When the user pauses or casually says something like “wait this is nice” or “I haven’t used this topic yet,” Beatrice should quickly capture it as a possible blog topic, create a short Eburon AI-centered blog draft, and save it to Firebase so it appears live on:

/blog/blogs.html

Firebase config:

const firebaseConfig = {
  apiKey: "AIzaSyDjmcE7CiKrNpSnu20gFB2cG620HU36Zqg",
  authDomain: "gen-lang-client-0836251512.firebaseapp.com",
  databaseURL: "<https://gen-lang-client-0836251512-default-rtdb.firebaseio.com>",
  projectId: "gen-lang-client-0836251512",
  storageBucket: "gen-lang-client-0836251512.firebasestorage.app",
  messagingSenderId: "811711024905",
  appId: "1:811711024905:web:b805531d56342ba41b8dd8",
  measurementId: "G-CEGJCJ914Y"
};

Save blogs to:

blogs/{blogId}

Blog object:

{
  id,
  title,
  excerpt,
  content,
  author: "Beatrice",
  source: "Eburon AI",
  status: "draft",
  createdAt,
  updatedAt,
  image: {
    url,
    alt,
    source,
    photographer,
    license,
    status
  },
  seo: {
    metaTitle,
    metaDescription,
    slug,
    tags,
    focusKeyword: "Eburon AI",
    secondaryKeywords: [
      "Beatrice AI assistant",
      "voice-first AI",
      "Eburon Agent",
      "Eburon Hub",
      "digital execution",
      "AI office aide"
    ]
  }
}

Default status is "draft". Only publish if autoPublish is enabled.

Idle behavior:

- Detect silence/thinking.
- Catch possible blog ideas.
- Create blog_generation task.
- Generate quick blog draft.
- Add Eburon AI-centered SEO.
- Optionally attach a free licensed image.
- Save to Firebase.
- /blog/blogs.html should update in realtime.

Important interruption rule:
If the user starts speaking or typing, Beatrice must instantly pause/stop idle behavior and return attention to the user fast.

Image rule:
Use only backend-configured free image sources like Unsplash, Pexels, Pixabay, or Wikimedia Commons.
Do not expose image API keys in frontend.
If no image is found, save image.status = "pending".

Frontend:

- Detect idle.
- Send blog_generation task.
- Render task status.
- Listen to Firebase blogs.
- Keep UI lightweight.

Backend:

- Extract topic.
- Generate blog.
- Search free image.
- Save blog to Firebase if server-side write is used.
- Return task updates.

Do not add Gemini, Google tools, video tooling, screen tooling, frontend AI logic, SSH credentials, or secrets.

Acceptance:

- Beatrice catches idle blog ideas.
- User interruption is instant.
- Blog saves under blogs/{blogId}.
- /blog/blogs.html updates live.
- SEO is centered on Eburon AI.
- Default blog status is draft.
- No secrets exposed.
