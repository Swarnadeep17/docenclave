# DocEnclave - Modern Document Processing Platform

A modern, responsive web application built with React, Vite, and Firebase for document processing tools.

## 🚀 Features

- **Modern UI/UX**: Clean, professional design with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Progressive Web App (PWA)**: Can be installed as a mobile app
- **Firebase Integration**: Ready for hosting, analytics, and authentication
- **Fast Performance**: Optimized Vite build with code splitting
- **SEO Optimized**: Proper meta tags and structure

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Hosting**: Firebase Hosting
- **Analytics**: Firebase Analytics
- **PWA**: Workbox service worker
- **Build Tool**: Vite with optimized production builds

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Swarnadeep17/docenclave.git
cd docenclave
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## 🔥 Firebase Deployment

### Option 1: Manual Deployment

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Deploy to Firebase:
```bash
npm run build
firebase deploy --only hosting
```

### Option 2: GitHub Actions (Recommended)

1. Add your Firebase service account key to GitHub Secrets:
   - Go to your GitHub repository settings
   - Navigate to Secrets and Variables > Actions
   - Add a new secret named `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Paste your Firebase service account JSON key

2. Create `.github/workflows/firebase-deploy.yml`:
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run build
    - uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: ${{ secrets.GITHUB_TOKEN }}
        firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}
        channelId: live
        projectId: docenclave-d5a43
```

## 🌐 Live URLs

- **GitHub Repository**: https://github.com/Swarnadeep17/docenclave.git
- **Firebase Hosting**: https://docenclave-d5a43.web.app (after deployment)

## 📱 Application Structure

```
src/
├── components/
│   ├── Home.jsx          # Landing page component
│   ├── Navbar.jsx        # Navigation component
│   ├── Footer.jsx        # Footer component
│   ├── ToolCard.jsx      # Tool card component
│   └── ToolsLayout.jsx   # Tools layout component
├── config/
│   ├── firebase.js       # Firebase configuration
│   └── tools.js          # Tools configuration
├── styles/
│   └── index.css         # Global styles
├── utils/
│   └── analytics.js      # Analytics utilities
├── App.jsx               # Main app component
└── main.jsx              # App entry point
```

## 🎨 Customization

### Adding New Tools

Edit `src/config/tools.js` to add new document processing tools:

```javascript
export const tools = [
  {
    id: 'new-tool',
    title: 'New Tool',
    description: 'Description of your new tool',
    icon: 'fas fa-icon-name',
    category: 'category-name'
  }
];
```

### Styling

The project uses Tailwind CSS for styling. Customize the design by:
- Editing `tailwind.config.js` for theme customization
- Modifying component styles in respective `.jsx` files
- Adding custom CSS in `src/styles/index.css`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env` file for local development:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue on GitHub.
