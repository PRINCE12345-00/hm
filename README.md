# Haryanvi Mandli Website

Full-stack cultural society management and engagement platform for Haryanvi Mandli, DCRUST (Deenbandhu Chhotu Ram University of Science and Technology).

## 🎨 Features

- **Modern & Responsive Design**: Built with React + Tailwind CSS for a beautiful, mobile-first experience
- **Warm Cultural Theme**: Color palette inspired by Haryana culture (red, mustard, earthy tones)
- **Smooth Animations**: Powered by Framer Motion for engaging user interactions
- **SEO Optimized**: Clean structure with proper meta tags
- **Fast Loading**: Optimized performance with Vite
- **Management Workspaces**: Role-aware member and admin dashboards
- **Platform API**: Events, registrations, attendance, members, certificates, announcements, auditions, archive, search, analytics, and chatbot endpoints

## 📄 Sections

1. **Hero Section**: Attractive banner with Haryana folk theme and call-to-action buttons
2. **About Us**: History, vision, mission, and founder details
3. **Activities**: Dance, Music, Theatre, Fine Arts, and Cultural Workshops
4. **Achievements**: Awards, recognitions, and prestigious platforms
5. **Gallery**: Masonry layout for photos and videos
6. **Team**: Faculty coordinators, executive team, and student members
7. **Events**: Upcoming events and past performances
8. **Testimonials**: Feedback from students and audiences
9. **Contact**: Contact form, social media links, and location map

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and visit `http://localhost:5173`

4. In a second terminal, start the backend API:
```bash
npm run server
```

The API runs at `http://localhost:3001`. Copy `.env.example` to `.env`, set `MONGO_URI` to your local MongoDB or MongoDB Atlas connection string, and set a private `JWT_SECRET` and admin password before deployment. When `MONGO_URI` is set, all application data is stored in MongoDB; without it, the backend uses the local `data/store.json` fallback.

For MongoDB Atlas: create a free cluster, create a database user, allow your development IP in Network Access, copy the Node.js connection string, and put it in `.env` as `MONGO_URI`. Example local value: `mongodb://127.0.0.1:27017/haryana_mandli`. Start the API with `npm run server`; it prints `MongoDB connected` when the connection succeeds and exits with an error if the configured MongoDB server is unavailable.

The default development admin is `admin@haryanamandli.in` with password `admin123`. Change it through `ADMIN_PASSWORD` in `.env` before using the application outside local development.

The dashboard is available from the `Login / Sign up` button. Members can view their profile and register for events. Administrators and coordinators can manage events, members, contact requests, auditions, announcements, and analytics. API details are listed in `openapi.json`.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎨 Customization

### Colors

The color palette is defined in `tailwind.config.js`:
- `haryana-red`: #C41E3A
- `haryana-mustard`: #FFD700
- `haryana-earth`: #8B4513
- `haryana-cream`: #FFF8DC
- `haryana-dark`: #2D1810

### Content

Update the content in each component file located in `src/components/`:
- `Hero.jsx` - Main banner and tagline
- `About.jsx` - History and mission
- `Activities.jsx` - Activity descriptions
- `Achievements.jsx` - Awards and recognitions
- `Gallery.jsx` - Add real images/videos
- `Team.jsx` - Team member information
- `Events.jsx` - Upcoming and past events
- `Testimonials.jsx` - User testimonials
- `Contact.jsx` - Contact information

### Images

Replace placeholder backgrounds with actual performance photos in the Gallery component. Recommended image size: 1920x1080 for best quality.

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## 🔧 Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

## 📄 License

This project is for Haryanvi Mandli, DCRUST. All rights reserved.

## 🤝 Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Contact

For any queries or support, contact:
- Email: haryanamandli@dcrust.ac.in
- Location: DCRUST, Murthal, Sonipat, Haryana 131027

---

Built with ❤️ for Haryanvi Mandli
