# Man Mulyankan — Online Cognitive & Psychological Assessment Platform

**30 Free Standardised Tests** across Intelligence, Wellness, and Clinical categories.

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
    ├── game-fx.js               ← Sound & particle effects
    └── tests/                   ← 30 assessment HTML files
        ├── wisc_v.html           ← IQ (5–16 Yrs)
        ├── wais_v_young.html     ← IQ (17–30 Yrs)
        ├── wais_v_adult.html     ← IQ (31–55 Yrs)
        ├── moca.html             ← Cognitive (56+ Yrs)
        ├── daily_mood.html       ← Daily Mood Tracker
        ├── stress_level.html     ← Stress Level (PSS)
        ├── sleep_quality.html    ← Sleep Quality (PSQI)
        ├── work_life_balance.html← Work-Life Balance
        ├── mindfulness_focus.html← Mindfulness (MAAS)
        ├── social_connection.html← Social Connection
        ├── energy_vitality.html  ← Energy & Vitality
        ├── emotional_intelligence.html ← EQ Assessment
        ├── anxiety_screening.html← Anxiety (GAD-7)
        ├── mmpi2.html            ← MMPI-2 Personality
        ├── cpi_test.html         ← California PI
        ├── pf16_test.html        ← 16 Personality Factors
        ├── big_five.html         ← Big Five (OCEAN)
        ├── mmse_test.html        ← Mini-Mental State
        ├── tmt_test.html         ← Trail Making Test
        ├── caps_test.html        ← PTSD (CAPS)
        ├── pcl5_test.html        ← PTSD (PCL-5)
        ├── iesr_test.html        ← Impact of Event (IES-R)
        ├── ymrs_test.html        ← Young Mania (YMRS)
        ├── bdi_test.html         ← Beck Depression (BDI)
        ├── mdq_test.html         ← Mood Disorder (MDQ)
        ├── hdrs_test.html        ← Hamilton Depression
        ├── ybocs_test.html       ← Yale-Brown OCD
        ├── oci_test.html         ← OC Inventory
        ├── foci_test.html        ← Florida OCI
        └── mocq_test.html        ← Maudsley OCD
```

---

## All 30 Assessments

### 🧠 General Intelligence Screening (4 tests)
| Test | Age | Qs | Time | Based On |
|------|-----|-----|------|----------|
| Intelligence Screening (5–16 Yrs) | 5–16 | 50 | ~15 min | WISC-V |
| Intelligence Screening (17–30 Yrs) | 17–30 | 50 | ~20 min | WAIS-V |
| Intelligence Screening (31–55 Yrs) | 31–55 | 50 | ~20 min | WAIS-V |
| Cognitive Screening (56+ Yrs) | 56+ | 30 | ~10 min | MoCA |

### 🌿 Wellness & Daily Health (9 tests)
| Test | Age | Qs | Time | Based On |
|------|-----|-----|------|----------|
| Daily Mood Tracker | 12+ | 15 | ~5 min | Moodfit/Daylio |
| Stress Level | 14+ | 15 | ~6 min | PSS (Cohen) |
| Sleep Quality | 14+ | 15 | ~5 min | PSQI & Epworth |
| Work-Life Balance | 16+ | 15 | ~6 min | WLB Scale |
| Mindfulness & Focus | 14+ | 15 | ~5 min | MAAS & FFMQ |
| Social Connection | 14+ | 15 | ~5 min | SCS & ISEL |
| Energy & Vitality | 14+ | 15 | ~5 min | Vitality & FSS |
| Emotional Intelligence | 14+ | 15 | ~7 min | EQ-i & TEIQue |
| Anxiety Assessment | 13+ | 15 | ~5 min | GAD-7 & BAI |

### 🏥 Clinical Assessment & Personality Tests (17 tests)

**Personality:** MMPI-2 (18+), CPI (16+), 16PF (16+), Big Five OCEAN (14+)

**Cognitive:** MMSE (50+), Trail Making TMT (8+)

**PTSD:** CAPS (16+), PCL-5 (16+), IES-R (16+)

**Bipolar:** YMRS (16+), BDI-II (13+), MDQ (16+), HDRS (16+)

**OCD:** Y-BOCS (14+), OCI-R (14+), FOCI (14+), MOCQ (14+)

---

## Features

- 30 standardised assessments across 4 categories
- Gender selection (Male/Female/Other) on all tests
- Age validation — each test enforces its target age range
- Animated progress bars with particle effects
- Domain-based scoring — 5 domains per test
- Results auto-saved to SQLite database
- Admin dashboard — search, filter, view details, export CSV
- AI-powered search assistant on homepage
- Responsive dark theme with scroll animations
- Brain hologram SVG animation on homepage

---

## Default Admin Login

- **Username:** `admin`
- **Password:** `admin123`
- Change immediately after first login!

---

## Deploy to Railway (FREE)

1. Push to GitHub: https://github.com/new → name `manmulyankan` → upload files
2. Go to https://railway.app/new → Deploy from GitHub → select repo
3. Click "Generate Domain" → live at `something.up.railway.app`

```bash
cd manmulyankan
git init && git add . && git commit -m "30 assessments"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/manmulyankan.git
git push -u origin main
```

## Run Locally

```bash
cd manmulyankan
npm install
npm start
# → http://localhost:3000
```

---

**Created by Shubham Kaushal** | manmulyankan@gmail.com | https://manmulyankan.com
