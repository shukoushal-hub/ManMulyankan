# ManMulyankan — Online Cognitive Assessment Platform

## What's Inside

```
manmulyankan/
├── server.js                    ← Main server (Express + SQLite)
├── package.json                 ← Dependencies
├── db/                          ← Database auto-created here
│   └── manmulyankan.db           ← (created on first run)
├── views/
│   ├── index.html               ← Homepage — test selection
│   ├── login.html               ← Admin login page
│   └── admin.html               ← Admin dashboard
└── public/
    └── tests/
        ├── depression_screening.html
        ├── trail_making.html
        ├── stroop_test.html
        ├── digit_span.html
        └── quality_of_life.html
```

## URLs After Deployment

| URL | Purpose |
|-----|---------|
| `yoursite.com/` | Homepage — participants pick a test |
| `yoursite.com/test/depression_screening` | Depression Screening |
| `yoursite.com/test/trail_making` | Trail Making Test |
| `yoursite.com/test/stroop_test` | Stroop Color Test |
| `yoursite.com/test/digit_span` | Digit Span Test |
| `yoursite.com/test/quality_of_life` | Quality of Life |
| `yoursite.com/admin/login` | Admin login |
| `yoursite.com/admin` | Admin dashboard (view/search/export results) |

## Default Admin Login

- **Username:** `admin`
- **Password:** `admin123`
- Change this immediately after first login!

---

## OPTION 1: Deploy to Railway (FREE — Recommended)

Railway gives you a free server with a public URL in under 5 minutes.

### Step 1: Create accounts
1. Go to https://github.com — create account if needed
2. Go to https://railway.app — sign in with GitHub

### Step 2: Upload code to GitHub
1. Go to https://github.com/new
2. Name it `manmulyankan`, click "Create repository"
3. Upload all the files from the `manmulyankan/` folder
   - Drag and drop the entire folder contents
   - Or use git commands (see below)

### Step 3: Deploy on Railway
1. Go to https://railway.app/new
2. Click "Deploy from GitHub Repo"
3. Select your `manmulyankan` repository
4. Railway auto-detects Node.js and deploys
5. Click "Generate Domain" in Settings to get your public URL
6. Done! Your site is live at `something.up.railway.app`

### Git commands (alternative to drag-drop):
```bash
cd manmulyankan
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/manmulyankan.git
git push -u origin main
```

---

## OPTION 2: Deploy to Render (FREE)

1. Push code to GitHub (same as above)
2. Go to https://render.com — sign in with GitHub
3. Click "New Web Service"
4. Connect your `manmulyankan` repo
5. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Click "Create Web Service"
7. Your URL: `something.onrender.com`

---

## OPTION 3: Run on Your Own Computer

```bash
# 1. Install Node.js from https://nodejs.org (download LTS version)

# 2. Open Terminal/Command Prompt, navigate to the folder
cd manmulyankan

# 3. Install dependencies
npm install

# 4. Start the server
npm start

# 5. Open browser
# http://localhost:3000        ← Tests
# http://localhost:3000/admin  ← Admin panel
```

---

## OPTION 4: Deploy to VPS (DigitalOcean, etc.)

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Upload your code (or git clone)
git clone https://github.com/YOUR_USERNAME/manmulyankan.git
cd manmulyankan

# Install dependencies
npm install

# Set environment variables
export PORT=3000
export SESSION_SECRET="your-random-secret-string-here"

# Run with process manager (keeps it running)
npm install -g pm2
pm2 start server.js --name manmulyankan
pm2 save
pm2 startup
```

---

## How It Works

### For Participants:
1. Visit homepage → pick a test
2. Enter name + age
3. Complete the assessment
4. Results display → automatically saved to database

### For Admin:
1. Go to `/admin/login`
2. Sign in with admin credentials
3. Dashboard shows:
   - Total sessions, participants, today's count
   - Searchable/filterable results table
   - Click "View" on any result for full detail (scores + raw answers)
   - Click "Delete" to remove a result
   - Click "Export CSV" to download all data as spreadsheet
4. Change password from the admin panel

### Data Flow:
```
Participant completes test
        ↓
Browser sends POST to /api/results
        ↓
Server stores in SQLite database
        ↓
Admin views at /admin dashboard
        ↓
Admin can export as CSV
```

---

## Security Notes

- Change the default admin password immediately
- Set a strong `SESSION_SECRET` environment variable in production
- The SQLite database file is at `db/manmulyankan.db` — back this up regularly
- For production, consider adding HTTPS (Railway/Render do this automatically)
