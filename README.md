[README.md](https://github.com/user-attachments/files/32452669/README.md)
# Joacohj

> Personal portfolio, blog and media platform built with Next.js.

Joacohj is a full-stack web application that combines a personal portfolio, blog, media gallery and authenticated dashboard into a single platform.

The project is designed as a real-world application rather than a static portfolio, with authentication, database persistence, media uploads, image/video processing, internationalization and a modular dashboard.

## ✨ Features

- 🌐 **Internationalization**
  - Spanish and English
  - Locale-based routing with `app/[locale]`

- 🖼️ **Media gallery**
  - Images and videos
  - Responsive galleries
  - Masonry layouts
  - Sliders and fullscreen viewing
  - Video thumbnails using posters
  - YouTube video support

- ✍️ **Post management**
  - Create and manage posts
  - Categories and topics
  - Public/private visibility
  - Media ordering
  - Interaction permissions

- 🔐 **Authentication**
  - Email/password authentication
  - GitHub OAuth
  - Session management
  - Protected dashboard routes
  - Persistent sessions

- 📤 **Media uploads**
  - Image and video uploads
  - Drag & drop
  - File reordering
  - Image optimization
  - Video compression
  - Media metadata

- 🖌️ **Image editing**
  - Crop and resize
  - Aspect ratio presets
  - Filters
  - Text overlays
  - Exporting edited images

- 📰 **Newsletter**
  - Newsletter subscriptions
  - Welcome emails
  - Unsubscribe flow
  - Email templates with React Email

- 📝 **Rich text editor**
  - Lexical
  - Headings
  - Lists
  - Quotes
  - Code blocks
  - Images

- 🎨 **Modern UI**
  - Tailwind CSS
  - shadcn/ui
  - Radix UI
  - Dark/light/system themes
  - Responsive design
  - Motion animations

- 🐳 **Docker development environment**
  - Next.js application container
  - PostgreSQL database
  - Development environment ready for containerized workflows

---

## 🛠️ Tech Stack

### Frontend

- [Next.js](https://nextjs.org/)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Motion
- Zustand
- React Hook Form
- Zod

### Backend

- Next.js Route Handlers
- Server Actions
- Prisma ORM
- PostgreSQL
- Better Auth

### Media

- UploadThing
- Sharp
- FFmpeg
- React Motion Gallery
- Plyr
- Fabric.js

### Content

- Lexical
- React Email
- Resend

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL

---

## 📁 Project Structure

```text
.
├── app/
│   ├── [locale]/
│   │   ├── dashboard/
│   │   ├── blog/
│   │   ├── projects/
│   │   └── ...
│   │
│   ├── api/
│   │   ├── data/
│   │   ├── newsletter/
│   │   ├── uploadthing/
│   │   └── ...
│   │
│   └── ...
│
├── components/
│   ├── shared/
│   ├── ui/
│   └── ...
│
├── services/
│   ├── newsletter/
│   ├── ...
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│
├── lib/
│
├── generated/
│   └── prisma/
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

> The structure may evolve as new features are added.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Docker
- Docker Compose

You will also need a PostgreSQL database if you are not using the provided Docker configuration.

### 1. Clone the repository

```bash
git clone https://github.com/JoacohDeveloper/joacohj.git

cd joacohj
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"

BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

UPLOADTHING_TOKEN="your-uploadthing-token"

RESEND_API_KEY="your-resend-api-key"
```

Additional environment variables may be required depending on the enabled services.

---

## 🗄️ Database

The project uses Prisma with PostgreSQL.

Generate the Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

If the project contains seed data:

```bash
npx prisma db seed
```

You can inspect the database using:

```bash
npx prisma studio
```

---

## 🐳 Docker

The project includes Docker configuration for local development.

Start the application and database:

```bash
docker compose up
```

Or rebuild the containers:

```bash
docker compose up --build
```

Stop the containers:

```bash
docker compose down
```

To remove the database volume as well:

```bash
docker compose down -v
```

> Removing volumes deletes the local PostgreSQL data.

---

## 💻 Development

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:3000
```

For Webpack development instead of Turbopack:

```bash
npm run dev -- --webpack
```

---

## 🔐 Authentication

Authentication is handled with Better Auth.

The application supports:

- Email/password authentication
- GitHub OAuth
- Session-based authentication
- Protected dashboard routes
- Persistent sessions

Authentication data is stored in PostgreSQL through Prisma.

---

## 🖼️ Media Pipeline

Media uploaded to the application can go through an optimization pipeline before being stored.

### Images

Images are processed with Sharp and can be:

- Resized
- Converted to WebP
- Compressed
- Constrained to a maximum resolution

Example optimization flow:

```text
Original image
      ↓
   Sharp
      ↓
Resize
      ↓
Convert to WebP
      ↓
Optimize
      ↓
Upload
```

### Videos

Videos can be processed with FFmpeg:

```text
Original video
      ↓
   FFmpeg
      ↓
Compression
      ↓
Optimized video
      ↓
Upload
```

The application also keeps information such as:

- Original file size
- Optimized file size
- Compression percentage
- Width
- Height
- Aspect ratio
- Media type
- Poster
- Ordering

---

## 🎞️ Media Types

A post can contain multiple media items.

```ts
type Media = {
    id: string;
    kind: "image" | "video";
    src: string;
    videoId: string | null;
    poster: string | null;
    width: number;
    height: number;
    aspectRatio: number;
    alt: string | null;
    order: number;
    postId: string;
};
```

Videos can represent either uploaded video files or YouTube content.

For video thumbnails, the application can use the video's `poster` instead of the video URL:

```ts
const thumbnail =
    media.kind === "video" && media.poster
        ? media.poster
        : media.src;
```

---

## 📝 Rich Text Editor

The dashboard uses Lexical for rich text editing.

Current editor functionality includes:

- Paragraphs
- Headings
- Quotes
- Ordered lists
- Unordered lists
- Images
- Code blocks
- Slash commands

---

## 📬 Newsletter

The newsletter system stores subscribers in PostgreSQL and sends transactional emails.

The flow is approximately:

```text
User subscribes
      ↓
Validate email
      ↓
Create subscriber
      ↓
Create notification
      ↓
Send welcome email
      ↓
User receives email
```

Email templates are created with React Email.

---

## 🌍 Internationalization

The application uses locale-based routing.

Examples:

```text
/en
/es
/en/blog
/es/blog
/en/dashboard
/es/dashboard
```

The locale is handled through the application routing structure:

```text
app/
└── [locale]/
```

---

## 🎨 UI

The UI is built around a minimal and modern visual language.

Main technologies include:

- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide icons
- Motion

The application supports:

- Light mode
- Dark mode
- System theme

---

## 🔧 Useful Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Production server
npm run start

# Prisma client
npx prisma generate

# Prisma migrations
npx prisma migrate dev

# Prisma Studio
npx prisma studio

# Docker
docker compose up

# Docker rebuild
docker compose up --build
```

---

## 📌 Roadmap

Possible future improvements include:

- [ ] More advanced media management
- [ ] Improved video processing pipeline
- [ ] Cloud deployment
- [ ] Automated media optimization
- [ ] Advanced analytics
- [ ] More blog functionality
- [ ] Improved search
- [ ] More granular permissions
- [ ] Progressive Web App support
- [ ] Automated testing
- [ ] CI/CD pipeline

---

## 👨‍💻 Author

**Joaquín Álvarez**

Software Systems Engineering student and web developer from Uruguay.

Interested in:

- Full-stack development
- Next.js
- TypeScript
- Cloud infrastructure
- Databases
- Distributed systems
- AI-powered applications

---

## 📄 License

This project is currently a personal project and does not specify an open-source license.

All rights are reserved unless otherwise stated.
```
