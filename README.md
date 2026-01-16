# 🎓 UniCalc Scholar - Full-Stack CGPA Management System

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **All Phases**: Complete

UniCalc Scholar is a professional, multi-year CGPA (Cumulative Grade Point Average) calculator designed specifically for the Nigerian university grading system. It has been transformed from a frontend-only application into a complete **full-stack system** with backend persistence, user authentication, and comprehensive management features.

## ✨ Key Features

### Calculator Features
* **Multi-Year Support**: Add as many academic years as needed (100L, 200L, 300L, 400L)
* **Real-time Dashboard**: 3-column summary showing Total Credit Units, Semester GPAs, and Cumulative CGPA
* **Responsive Design**: Fully optimized for mobile and desktop screens
* **PDF Export**: Generate professional academic transcripts
* **Smart Classification**: Automatic degree class determination based on CGPA

### Backend Features (NEW - Phase 1-3)
* **User Authentication**: Secure JWT-based login and registration
* **Cloud Storage**: Persistent data storage in MongoDB
* **Profile Management**: Upload and manage profile images
* **Newsletter System**: Subscribe to academic metrics and transcripts
* **Settings Management**: Manage account, academic, and security preferences
* **CGPA Calculation**: Server-side calculation using Nigerian 5.0 scale
* **Data Export**: Export records as CSV or JSON

## 🛠️ Tech Stack

### Frontend
* HTML5 & CSS3 - Modern, responsive design
* Vanilla JavaScript - All calculations and interactions
* Ionicons v7.1.0 - Professional icons
* Fetch API - API communication

### Backend
* **Express.js** - Web framework
* **Node.js** - Runtime environment
* **MongoDB** - Database
* **Mongoose** - ODM
* **JWT** - Authentication
* **Bcryptjs** - Password hashing
* **Multer** - File uploads

### Architecture
* RESTful API with 21+ endpoints
* 3 MongoDB collections (User, Record, Newsletter)
* JWT-based authentication
* File storage system for profile images

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### Frontend Access
```bash
npx http-server
# Access at http://localhost:8080
```

### First Steps
1. Navigate to login page
2. Create new account
3. Update account settings
4. Use CGPA calculator
5. Subscribe to newsletters

## 📁 Project Structure

```
UniCalc/
├── backend/                  # Express.js backend
│   ├── controllers/         # Business logic (5 modules)
│   ├── routes/              # API endpoints (5 modules)
│   ├── models/              # MongoDB schemas (3 models)
│   ├── middleware/          # JWT verification
│   ├── uploads/profiles/    # Profile image storage
│   ├── server.js            # Express server
│   └── package.json         # Dependencies
│
├── pages/                   # HTML pages (6 updated)
├── assets/
│   ├── css/                 # Styling
│   └── js/                  # JavaScript (updated with API)
├── auth/                    # Authentication pages
├── utils/                   # Utilities
│
└── Documentation/           # 10+ comprehensive guides
    ├── QUICK_REFERENCE.md
    ├── TESTING_GUIDE.md
    ├── DEPLOYMENT_GUIDE.md
    ├── COMPLETE_IMPLEMENTATION_SUMMARY.md
    └── ... (more guides)
```

## 📊 API Endpoints (21 Total)

### Authentication (2)
* `POST /api/auth/register` - Create account
* `POST /api/auth/login` - Login user

### Records (5)
* `POST /api/records/save` - Save CGPA records
* `GET /api/records/load` - Load records
* `POST /api/records/calculate` - Calculate CGPA
* `GET /api/records/export-pdf` - Export transcript
* `DELETE /api/records/clear` - Clear records

### Newsletter (4)
* `POST /api/newsletter/subscribe` - Subscribe
* `GET /api/newsletter/check` - Check status
* `GET /api/newsletter/unsubscribe` - Unsubscribe
* `GET /api/newsletter/subscribers` - List subscribers

### Settings (7)
* `GET /api/settings` - Get all settings
* `POST /api/settings/account` - Update account
* `POST /api/settings/academic` - Update academic
* `POST /api/settings/password` - Change password
* ... (4 more endpoints)

### Profile (3)
* `POST /api/profile/upload-image` - Upload image
* `GET /api/profile/image` - Get image
* `DELETE /api/profile/delete-image` - Delete image

## 🔐 Security Features

- ✅ JWT authentication (7-day expiration)
- ✅ Password hashing (bcryptjs, 10 rounds)
- ✅ User data isolation
- ✅ CORS protection
- ✅ Input validation
- ✅ File upload validation
- ✅ Bearer token authentication

## 📚 Documentation

Comprehensive documentation is provided:

| Document | Purpose |
|----------|---------|
| **QUICK_REFERENCE.md** | Quick API reference and examples |
| **TESTING_GUIDE.md** | Comprehensive API testing guide |
| **DEPLOYMENT_GUIDE.md** | Production deployment instructions |
| **COMPLETE_IMPLEMENTATION_SUMMARY.md** | Full architecture overview |
| **PHASE3_SUMMARY.md** | Phase 3 implementation details |
| **VERIFICATION_REPORT.md** | Quality assurance report |

**Start here**: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

## 📦 Installation

### Prerequisites
- Node.js v14+
- MongoDB (Atlas or local)
- npm or yarn

### Backend Installation
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
```

### Frontend Installation
```bash
# No build required - all vanilla JavaScript
# Use any HTTP server:
npx http-server
# or use Live Server in VS Code
```

## 🧪 Testing

All endpoints have been tested and verified. See [TESTING_GUIDE.md](TESTING_GUIDE.md) for:
- Complete test cases
- Example API calls
- Error scenarios
- Integration workflows

## 🚀 Deployment

Ready for production deployment to:
- Heroku
- DigitalOcean
- AWS EC2
- Self-hosted VPS

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📈 Project Status

### ✅ Completed
- Phase 1: Records API ✅
- Phase 2: Newsletter API ✅
- Phase 3: Profile & Account API ✅
- Backend infrastructure ✅
- Frontend integration ✅
- Documentation ✅
- Security implementation ✅

### 🔄 Ready for
- User testing
- Production deployment
- Phase 4 (Dashboard statistics)
- Scaling

## 🎯 CGPA Calculation

### Nigerian 5.0 Scale
| Grade | Points |
|-------|--------|
| A | 5.0 |
| B | 4.0 |
| C | 3.0 |
| D | 2.0 |
| E | 1.0 |
| F | 0.0 |

### Formula
```
CGPA = Total Quality Points / Total Units
Quality Points = Grade Points × Units
```

## 📞 Support

For questions or issues:
1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for quick answers
2. See [TESTING_GUIDE.md](TESTING_GUIDE.md) for API examples
3. Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) troubleshooting section
4. Read [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for guide to all docs

## 📄 License

Open source project for educational use.

## 👥 Support

For detailed documentation, see:
- [Documentation Index](DOCUMENTATION_INDEX.md)
- [Quick Reference](QUICK_REFERENCE.md)
- [Complete Implementation Summary](COMPLETE_IMPLEMENTATION_SUMMARY.md)

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2024



* Add Years: If you are in a higher level, click the "+ Add Another Academic Year" button to expand your record.

* Export: Click "Download Full Transcript PDF" to save a copy for your records or applications.

This project is open-source and free to use.

