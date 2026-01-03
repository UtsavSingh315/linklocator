# Quick Setup Guide

Follow these steps to get your URL shortener running:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up NeonDB

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string from the dashboard

## 3. Configure Environment Variables

Create a `.env` file in the root directory and add:

```env
DATABASE_URL=your_neon_connection_string_here
NEXTAUTH_SECRET=generate_using_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=Admin User
```

To generate a secure `NEXTAUTH_SECRET`, run:

```bash
openssl rand -base64 32
```

## 4. Push Database Schema

```bash
npm run db:push
```

This creates the necessary tables in your NeonDB database.

## 5. Create Admin User

```bash
npm run create-admin
```

## 6. Start Development Server

```bash
npm run dev
```

## 7. Access Your Application

- Homepage: http://localhost:3000
- Admin Login: http://localhost:3000/admin/login
- Dashboard: http://localhost:3000/admin/dashboard

## Default Login (if not changed in .env)

- Email: `admin@example.com`
- Password: `admin123`

**Important**: Change the default password immediately after first login!

## Troubleshooting

### Database Connection Issues

- Make sure your NeonDB connection string is correct
- Check that your database is active (Neon databases auto-suspend after inactivity)

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set in your `.env` file
- Make sure `NEXTAUTH_URL` matches your current URL

### Build Errors

- Try deleting `.next` folder and `node_modules`, then run `npm install` again
- Make sure you're using Node.js 18 or higher

## Next Steps

1. Log in to the admin panel
2. Create your first short URL
3. Test the short URL by visiting it
4. Customize the styling to match your brand
5. Deploy to Vercel or your preferred hosting platform

## Need Help?

Check the main README.md file for detailed documentation.
