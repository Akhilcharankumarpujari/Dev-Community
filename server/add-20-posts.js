const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');
const slugify = require('slugify');

dotenv.config();

const adjectives = ['Ultimate', 'Complete', 'Modern', 'Advanced', 'Beginners', 'Essential', 'Practical', 'Quick', 'Deep'];
const topics = ['React', 'Node.js', 'MongoDB', 'GraphQL', 'Tailwind CSS', 'Next.js', 'TypeScript', 'Web Security', 'Docker', 'AWS', 'System Design', 'Vue.js', 'Python', 'Rust', 'Go'];
const suffixes = ['Guide', 'Tutorial', 'Masterclass', 'Introduction', 'Best Practices', 'Crash Course', 'Patterns', 'Tips and Tricks'];

const generateTitle = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${adj} ${topic} ${suffix}: A Developer's Perspective`;
};

const generateContent = (title, topic) => {
  return `# ${title}\n\nWelcome to this comprehensive guide on **${topic}**. In the modern landscape of software engineering, understanding ${topic} is absolutely critical for building scalable applications.\n\n## Why ${topic}?\n\nDevelopers all over the world are adopting ${topic} because it solves many of the traditional problems we face in daily development workflows. Let's look at some code:\n\n\`\`\`javascript\nfunction helloWorld() {\n  console.log("Hello from ${topic}!");\n}\n\nhelloWorld();\n\`\`\`\n\n## Key Concepts\n\n- **Performance**: Extremely fast execution and low overhead.\n- **Community**: Supported by millions of developers globally.\n- **Ecosystem**: Rich set of plugins and integrations.\n\n> "Adopting ${topic} changed the way we build software at our company. It's truly revolutionary." - Senior Engineer\n\n## Conclusion\n\nIf you haven't started using it yet, now is the perfect time to dive in. Happy coding!`;
};

const images = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1000&auto=format&fit=crop'
];

const tagsPool = ['javascript', 'webdev', 'programming', 'tutorial', 'react', 'nodejs', 'backend', 'frontend', 'devops', 'career'];
const categories = ['tutorials', 'general', 'news', 'showcase', 'careers'];

const addPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devblog');
    console.log('🌱 Connected to database...');

    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found. Please run seed.js first.');
      process.exit(1);
    }

    const newPosts = [];
    
    for (let i = 0; i < 20; i++) {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const title = generateTitle();
      const content = generateContent(title, topic);
      const coverImage = images[Math.floor(Math.random() * images.length)];
      
      const numTags = Math.floor(Math.random() * 3) + 2;
      const shuffledTags = tagsPool.sort(() => 0.5 - Math.random());
      const tags = shuffledTags.slice(0, numTags);
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const author = users[Math.floor(Math.random() * users.length)]._id;
      
      // Random likes
      const likes = [];
      const numLikes = Math.floor(Math.random() * users.length);
      const shuffledUsers = users.sort(() => 0.5 - Math.random());
      for(let j=0; j<numLikes; j++) {
          likes.push(shuffledUsers[j]._id);
      }

      const rawSlug = slugify(title, { lower: true, strict: true });
      // Add random string to slug to ensure uniqueness in loop
      const slug = `${rawSlug}-${Math.random().toString(36).substring(2, 8)}`;

      newPosts.push({
        title,
        slug,
        content,
        coverImage,
        tags,
        category,
        author,
        likes,
        views: Math.floor(Math.random() * 5000),
        published: true,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random date in the past
      });
    }

    const inserted = await Post.insertMany(newPosts);
    console.log(`✅ Successfully added ${inserted.length} new posts!`);
    
    const totalPosts = await Post.countDocuments();
    console.log(`📊 Total posts in database: ${totalPosts}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding posts:', error);
    process.exit(1);
  }
};

addPosts();
