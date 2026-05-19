const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Notification = require('./models/Notification');

dotenv.config();

const usersSeed = [
  {
    name: 'Linus Torvalds',
    username: 'linus_torvalds',
    email: 'linus@kernel.org',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linus',
    bio: 'Creator of Git and Linux. I do the coding and yell at people occasionally.',
    location: 'Portland, OR',
    website: 'https://kernel.org',
    work: 'Linux Foundation Fellow',
    skills: ['C', 'Git', 'Linux', 'Systems Programming'],
    role: 'admin',
    isVerified: true,
  },
  {
    name: 'Ada Lovelace',
    username: 'ada_lovelace',
    email: 'ada@computing.org',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ada',
    bio: 'First computer programmer in history. Passionate about analytical engines and poetry.',
    location: 'London, UK',
    website: 'https://wikipedia.org/wiki/Ada_Lovelace',
    work: 'Mathematical Engine Analyst',
    skills: ['Algorithms', 'Mathematics', 'Babbage Machine', 'History'],
    role: 'user',
    isVerified: true,
  },
  {
    name: 'Dan Abramov',
    username: 'dan_abramov',
    email: 'dan@reactjs.org',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dan',
    bio: 'Co-authored Redux and Create React App. Currently explaining JavaScript step-by-step.',
    location: 'London, UK',
    website: 'https://overreacted.io',
    work: 'React core team alumnus',
    skills: ['React', 'Redux', 'JavaScript', 'CSS', 'Education'],
    role: 'user',
    isVerified: true,
  }
];

const postsSeed = [
  {
    title: '1. Why I Created Git: Inside the Core Architecture of Distributed VCS',
    content: `# The Git Object Model\n\nGit is essentially a simple content-addressable filesystem. Under the hood, everything is stored as objects in a simple keyspace indexed by SHA-1.\n\n## Object Types\n\n1. **Blobs**: Simple file contents. Blobs do not contain metadata like filename, permissions, or directories.\n2. **Trees**: Directory mappings linking filenames to blob keys.\n3. **Commits**: Commits reference a root tree object, metadata (author, committer, date), and parent commit hashes.\n\n\`\`\`c\n// A simple look at Git object formatting\nint write_sha1_file(const void *buf, unsigned long len, const char *type, unsigned char *returnsha1) {\n    // Computes header: "type len\\0"\n    // Prepends header to buf, compresses with zlib, computes SHA1, and writes to disk\n}\n\`\`\`\n\n## Key Takeaways\n- Distributed history allows zero-latency local workflows.\n- Content integrity is guaranteed by cryptographically hashing data.\n- Git is fast because it operates on diff offsets in packed files.`,
    coverImage: 'https://images.unsplash.com/photo-1556075798-482a134b5321?w=1000&auto=format&fit=crop',
    tags: ['git', 'systems', 'c', 'vcs'],
    category: 'tutorials',
    published: true,
  },
  {
    title: '2. Mastering React 19 Server Actions: A Clean Architectural Approach',
    content: `React 19 introduces native support for server side execution contexts, removing the boilerplate of REST routing for basic database operations.\n\n## How Server Actions Work\n\nBy specifying the \`"use server"\` directive at the top of a file or function block, React automatically compiles the function into an API endpoint under the hood.\n\n\`\`\`javascript\n// actions.js\n"use server";\n\nimport { db } from './db';\n\nexport async function addComment(postId, content) {\n  const comment = await db.insert({ postId, content });\n  return comment;\n}\n\`\`\`\n\nYou can call this action directly from your frontend components:\n\n\`\`\`jsx\n// FormComponent.jsx\nimport { addComment } from './actions';\n\nexport default function Form({ postId }) {\n  return (\n    <form action={async (formData) => {\n      const content = formData.get('content');\n      await addComment(postId, content);\n    }}>\n      <textarea name="content" />\n      <button type="submit">Submit Reply</button>\n    </form>\n  );\n}\n\`\`\`\n\n### Advantages\n1. **Zero Endpoint Configuration**: No more Express endpoints just to write to the DB.\n2. **Type Safety**: Automatic types shared between server-rendered functions and Client bundles.\n3. **Progressive Enhancement**: Action forms work even before JS loads!`,
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1000&auto=format&fit=crop',
    tags: ['react', 'javascript', 'frontend', 'webdev'],
    category: 'tutorials',
    published: true,
  },
  {
    title: '3. Coding the Analytical Engine: My First Algorithm for Bernoulli Numbers',
    content: `Many ask how Babbage's system could calculate complicated arithmetic numbers. In Note G of my translation, I mapped the sequence of cards needed to solve Bernoulli sequence values.\n\n## The Computation Scheme\n\nWe use variable cards ($V_1$, $V_2$, $V_3$) to preserve intermediate calculations. The sequence repeats iteratively, using cards to direct the mechanical Mill.\n\n| Operation | Input 1 | Input 2 | Output | Description |\n|---|---|---|---|---|\n| Multiplication | $V_1$ | $V_2$ | $V_3$ | Multiply coefficients |\n| Addition | $V_3$ | $V_4$ | $V_5$ | Accumulate sums |\n\n> "The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves."\n\nMechanical systems represent the logic of equations perfectly. We are only scratching the surface of what automated reasoning machines can accomplish!`,
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1000&auto=format&fit=crop',
    tags: ['algorithms', 'math', 'history'],
    category: 'general',
    published: true,
  },
  {
    title: '4. Understanding CSS Grid: Building Complex Layouts with Ease',
    content: `# CSS Grid Layout\n\nCSS Grid Layout is the most powerful layout system available in CSS. It is a 2-dimensional system, meaning it can handle both columns and rows, unlike Flexbox which is largely a 1-dimensional system.\n\n## Basic Setup\n\nTo get started, simply define a container element as a grid:\n\n\`\`\`css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-gap: 20px;\n}\n\`\`\`\n\nThis creates a 3-column grid where each column takes up an equal fraction of the available space.\n\n## Why use Grid over Flexbox?\n\n- Grid is perfect for overall page layouts.\n- Flexbox is excellent for UI components.\n- You can use both together for maximum flexibility!`,
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop',
    tags: ['css', 'frontend', 'design'],
    category: 'tutorials',
    published: true,
  },
  {
    title: '5. The Rise of WebAssembly: High Performance on the Web',
    content: `WebAssembly (Wasm) is a new type of code that can be run in modern web browsers. It provides new features and major gains in performance.\n\n## What is WebAssembly?\n\nIt is a low-level assembly-like language with a compact binary format that runs with near-native performance. It provides languages such as C/C++, C# and Rust with a compilation target so that they can run on the web.\n\n## Key Benefits\n\n- **Fast**: Executes at native speed.\n- **Safe**: Runs in a memory-safe, sandboxed execution environment.\n- **Open**: Part of the open web platform, managed by the W3C.\n\nAre you ready to port your heavy computation logic to the browser?`,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop',
    tags: ['wasm', 'performance', 'web'],
    category: 'news',
    published: true,
  },
  {
    title: '6. A Deep Dive into Node.js Event Loop',
    content: `The Event Loop is what allows Node.js to perform non-blocking I/O operations despite the fact that JavaScript is single-threaded.\n\n## Phases of the Event Loop\n\n1. **Timers**: This phase executes callbacks scheduled by \`setTimeout()\` and \`setInterval()\$.\n2. **Pending Callbacks**: Executes I/O callbacks deferred to the next loop iteration.\n3. **Idle, Prepare**: Only used internally.\n4. **Poll**: Retrieve new I/O events; execute I/O related callbacks.\n5. **Check**: \`setImmediate()\` callbacks are invoked here.\n6. **Close Callbacks**: e.g., \`socket.on('close', ...)\`.\n\nUnderstanding these phases is crucial for writing performant backend applications.`,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop',
    tags: ['nodejs', 'backend', 'javascript'],
    category: 'tutorials',
    published: true,
  },
  {
    title: '7. Designing Restful APIs: Best Practices in 2026',
    content: `Creating a robust API is an art. Here are some modern best practices to follow:\n\n## 1. Use Meaningful HTTP Methods\n\n- **GET**: Retrieve a resource.\n- **POST**: Create a new resource.\n- **PUT/PATCH**: Update a resource.\n- **DELETE**: Remove a resource.\n\n## 2. Resource Naming\n\nUse plural nouns for resource names. E.g., \`/users\` instead of \`/getUser\`.\n\n## 3. Versioning\n\nAlways version your APIs! \`/api/v1/users\` is much safer than \`/api/users\` when introducing breaking changes.`,
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop',
    tags: ['api', 'rest', 'backend'],
    category: 'tutorials',
    published: true,
  },
  {
    title: '8. Top 5 VS Code Extensions for Frontend Developers',
    content: `Boost your productivity with these essential VS Code extensions:\n\n1. **Prettier**: Code formatting made easy. Never argue over tabs vs spaces again.\n2. **ESLint**: Find and fix problems in your JavaScript code.\n3. **Tailwind CSS IntelliSense**: Intelligent autocomplete for Tailwind classes.\n4. **GitLens**: Supercharge the Git capabilities built into VS Code.\n5. **Live Server**: Launch a local development server with live reload feature for static & dynamic pages.`,
    coverImage: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1000&auto=format&fit=crop',
    tags: ['vscode', 'tools', 'productivity'],
    category: 'showcase',
    published: true,
  },
  {
    title: '9. Introduction to TypeScript: Adding Types to JS',
    content: `TypeScript is JavaScript with syntax for types. It helps you catch errors early in your editor.\n\n## Why TypeScript?\n\n- **Early error detection**: Catch typos and type mismatches before running the code.\n- **Better autocomplete**: Editors can understand your code structure much better.\n- **Easier refactoring**: Types act as a contract, making it safer to change code.\n\n\`\`\`typescript\ninterface User {\n  name: string;\n  id: number;\n}\n\nconst user: User = {\n  name: 'Hayes',\n  id: 0,\n};\n\`\`\`\n\nStart migrating your projects today!`,
    coverImage: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1000&auto=format&fit=crop',
    tags: ['typescript', 'javascript', 'frontend'],
    category: 'tutorials',
    published: true,
  },
  {
    title: '10. The Future of AI in Web Development',
    content: `Artificial Intelligence is rapidly changing how we build software. From AI-assisted coding tools like GitHub Copilot to automated UI generation.\n\n## What to Expect\n\n- **Automated Testing**: AI generating comprehensive test suites.\n- **Design to Code**: AI converting Figma designs directly into React components.\n- **Smart Debugging**: AI identifying the root cause of complex bugs instantly.\n\nEmbrace the AI revolution to stay ahead in the tech industry!`,
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1000&auto=format&fit=crop',
    tags: ['ai', 'future', 'webdev'],
    category: 'news',
    published: true,
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devblog');
    console.log('🌱 Connected to database for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️ Cleared existing database data.');

    // Create users
    const createdUsers = [];
    for (const u of usersSeed) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`👤 Seeded ${createdUsers.length} users.`);

    // Map posts with authors and generate slugs
    const linus = createdUsers[0];
    const ada = createdUsers[1];
    const dan = createdUsers[2];

    const postsData = postsSeed.map((post, index) => {
        // Distribute authors
        const author = index % 3 === 0 ? linus._id : index % 3 === 1 ? dan._id : ada._id;
        // Distribute likes
        const likes = [];
        if(index % 2 === 0) likes.push(linus._id);
        if(index % 3 === 0) likes.push(ada._id);
        if(index % 4 === 0) likes.push(dan._id);
        
        return {
            ...post,
            author,
            likes,
            views: Math.floor(Math.random() * 2000) + 100,
        }
    });

    const createdPosts = [];
    for (const p of postsData) {
      const slugify = require('slugify');
      p.slug = slugify(p.title, { lower: true, strict: true });
      const post = new Post(p);
      await post.save();
      createdPosts.push(post);
    }
    console.log(`📝 Seeded ${createdPosts.length} posts.`);

    // Create seed comments
    const gitPost = createdPosts[0];
    const reactPost = createdPosts[1];

    const c1 = await Comment.create({
      content: 'This explains Git commits perfectly! I always thought they were index diffs.',
      author: dan._id,
      post: gitPost._id,
    });

    const c2 = await Comment.create({
      content: 'Glad you found it clear. I wrote it in a hurry to replace BitKeeper.',
      author: linus._id,
      post: gitPost._id,
      parentComment: c1._id,
    });

    const c3 = await Comment.create({
      content: 'Truly ahead of its time. The choice of SHA-1 keyspace keeps object lookup extremely fast.',
      author: ada._id,
      post: gitPost._id,
    });

    const c4 = await Comment.create({
      content: 'Server Actions are great, but how do you handle state revalidation?',
      author: ada._id,
      post: reactPost._id,
    });

    // Update comments counts in posts
    gitPost.commentsCount = 3;
    await gitPost.save();

    reactPost.commentsCount = 1;
    await reactPost.save();

    console.log('💬 Seeded nested discussion comments.');

    // Seed mock notifications
    await Notification.create({
      recipient: linus._id,
      sender: dan._id,
      type: 'comment',
      post: gitPost._id,
      comment: c1._id,
    });

    await Notification.create({
      recipient: dan._id,
      sender: linus._id,
      type: 'reply',
      post: gitPost._id,
      comment: c2._id,
    });

    console.log('🔔 Seeded mock notifications.');

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
