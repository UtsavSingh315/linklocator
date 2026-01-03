# Link Locator - URL Shortener

A professional URL shortener built with **Next.js 15**, **Drizzle ORM**, and **NeonDB**, featuring a full-fledged admin panel for managing short URLs.

## 🚀 Features

- ✅ Create custom short URLs with optional custom codes
- ✅ Track clicks and analytics for each URL
- ✅ Enable/disable URLs without deleting them
- ✅ Secure admin authentication with NextAuth
- ✅ Beautiful, responsive dashboard
- ✅ Dark mode support
- ✅ Built with modern technologies

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: NeonDB (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth v5
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ installed
- A NeonDB account and database (free tier available at [neon.tech](https://neon.tech))
- npm or yarn package manager

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd linklocator
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# NeonDB Connection String
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# NextAuth Configuration
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Admin user creation
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Admin User
```

**Important**:

- Get your `DATABASE_URL` from your NeonDB dashboard
- Generate a secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

### 3. Set Up Database Schema

Push your schema to the database:

```bash
npm run db:push
```

This will create the necessary tables (`admins` and `urls`) in your NeonDB database.

### 4. Create an Admin User

Run the admin creation script:

```bash
npm run create-admin
```

This will create an admin user with the credentials from your `.env` file (or defaults if not set).

**Default credentials** (if not specified in `.env`):

- Email: `admin@example.com`
- Password: `admin123`

### 5. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application!

## 📖 Usage

### Admin Panel

1. Navigate to `/admin/login`
2. Sign in with your admin credentials
3. Access the dashboard at `/admin/dashboard`

### Dashboard Features

- **Create URLs**: Click "Create New URL" to add a short URL
  - Enter the original long URL
  - Optionally provide a custom short code
  - Add title and description for organization
- **Manage URLs**:

  - View all URLs in a table with click statistics
  - Edit existing URLs
  - Toggle URLs active/inactive
  - Delete URLs
  - Copy short URLs to clipboard

- **Statistics**: View total URLs, active URLs, and total clicks

### Using Short URLs

Once created, your short URLs will be accessible at:

```
https://yourdomain.com/{shortCode}
```

For example: `https://yourdomain.com/abc123`

## 🗄️ Database Schema

### Admins Table

- `id` - Unique identifier
- `email` - Admin email (unique)
- `password` - Hashed password
- `name` - Admin name
- `createdAt` - Creation timestamp

### URLs Table

- `id` - Unique identifier
- `shortCode` - Short code for the URL (unique)
- `originalUrl` - The original long URL
- `title` - Optional title
- `description` - Optional description
- `clicks` - Number of times clicked
- `isActive` - Whether the URL is active
- `createdBy` - Reference to admin who created it
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run create-admin` - Create a new admin user

## 🔒 Security

- All passwords are hashed using bcrypt
- Admin routes are protected with NextAuth middleware
- JWT-based session management
- Environment variables for sensitive data

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

Don't forget to:

- Update `NEXTAUTH_URL` to your production domain
- Run the admin creation script after deployment

### Environment Variables for Production

Make sure to set these in your hosting platform:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Drizzle ORM for the type-safe database toolkit
- NeonDB for serverless PostgreSQL
- NextAuth for authentication

---

Made with ❤️ using Next.js, Drizzle, and NeonDB
