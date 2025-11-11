# Frost Alert Hub - Black Ice Detection System

A real-time black ice detection and monitoring system with live maps, automated testing, and data management capabilities.

![Frost Alert Hub](https://img.shields.io/badge/status-active-success)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-green)

## 🌟 Features

- **Live Detection Map**: Interactive map showing real-time ice detection alerts with severity indicators
- **Sensor Monitoring**: Track the status and location of all sensors in the network
- **Automated Testing Suite**: Built-in tests for notification response time, reliability, and network robustness
- **Data Creation Tools**: Generate test data for demos and development
- **Real-time Updates**: Instant notifications when new ice is detected
- **Severity Levels**: Four-tier alert system (Low, Medium, High, Critical)

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your computer:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/downloads)
- A code editor like [VS Code](https://code.visualstudio.com/) (recommended)

### How to check if you have Node.js and Git installed:

Open your terminal/command prompt and run:
```bash
node --version
git --version
```

If you see version numbers, you're good to go! If not, download and install from the links above.

## 🚀 Getting Started

Follow these steps to get the application running on your local machine:

### Step 1: Clone the Repository

Open your terminal/command prompt and navigate to where you want to store the project, then run:

```bash
git clone https://github.com/amowzoon/frost-alert-hub.git
```

### Step 2: Navigate to the Project Folder

```bash
cd frost-alert-hub
```

### Step 3: Install Dependencies

Install all required packages:

```bash
npm install
```

This will take a few minutes. Wait for it to complete.

### Step 4: Install Mapping Libraries

Install the additional libraries needed for the map feature:

```bash
npm install leaflet react-leaflet@4.2.1 --legacy-peer-deps
npm install -D @types/leaflet
```

### Step 5: Start the Development Server

```bash
npm run dev
```

You should see output like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 6: Open in Browser

Open your web browser and go to:
```
http://localhost:5173
```

You should now see the Frost Alert Hub application! 🎉

## 📱 Using the Application

The application has three main sections accessible via tabs:

### 1. **Map View**
- View all sensors and active ice detections on an interactive map
- Click on markers to see detailed information
- Different colored circles indicate severity levels
- Green sensors are online, red are offline, orange are under maintenance

### 2. **Run Tests**
- Automated testing suite for system validation
- Three main tests:
  - **Test 1**: Notification Response Time (must be ≤ 3 seconds)
  - **Test 2**: Reliability Under Multiple Alerts (100% delivery rate)
  - **Test 3**: Network Robustness (no message loss)
- Click "Run All Tests" to execute the test suite

### 3. **Create Data**
- Generate test sensors and ice detections
- Useful for demos and development
- Quick action: "Generate Random Detection" creates instant test data
- Manual forms for creating specific test scenarios

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Mapping**: Leaflet + React-Leaflet
- **Backend**: Supabase (Database + Realtime)
- **Icons**: Lucide React

## 📁 Project Structure

```
frost-alert-hub/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── MapView.tsx   # Interactive map component
│   │   ├── TestingSuite.tsx
│   │   └── TestingPanel.tsx
│   ├── pages/            # Main application pages
│   ├── integrations/     # Supabase integration
│   ├── lib/              # Utility functions
│   └── App.tsx           # Main application component
├── public/               # Static assets
└── package.json          # Project dependencies
```

## 🔧 Configuration

### Environment Variables

If you need to configure Supabase or other services, create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

(Note: These are already configured in the Lovable.dev deployment)

## 📊 Database Schema

The application uses two main tables:

### `sensors` Table
- `id`: UUID (primary key)
- `sensor_id`: Text (unique identifier)
- `name`: Text (sensor name)
- `latitude`: Numeric (location)
- `longitude`: Numeric (location)
- `status`: Text (online/offline/maintenance)
- `last_ping`: Timestamp

### `ice_detections` Table
- `id`: UUID (primary key)
- `sensor_id`: Text (references sensor)
- `latitude`: Numeric
- `longitude`: Numeric
- `severity`: Text (low/medium/high/critical)
- `temperature`: Numeric (nullable)
- `humidity`: Numeric (nullable)
- `road_condition`: Text (nullable)
- `status`: Text (active/investigating/resolved)
- `detected_at`: Timestamp
- `notes`: Text (nullable)

## 🚨 Troubleshooting

### Port Already in Use

If you see an error about port 5173 being in use, you can either:
1. Stop the other process using that port
2. Or run with a different port:
   ```bash
   npm run dev -- --port 3000
   ```

### Map Not Showing

If the map doesn't display:
1. Make sure you ran the Leaflet installation command
2. Check that `@import 'leaflet/dist/leaflet.css';` is at the top of `src/index.css`
3. Clear your browser cache and refresh

### "Module not found" Errors

If you see module errors after cloning:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Realtime Updates Not Working

Make sure you have a valid Supabase connection. Check your environment variables and Supabase project settings.

## 🌐 Deployment

This project is deployed on Lovable.dev and synced with GitHub. 

To deploy your own version:
1. Push your changes to GitHub
2. The Lovable.dev integration will automatically deploy
3. Or deploy manually to other platforms like Vercel, Netlify, etc.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is part of a black ice detection system development effort.

## 👥 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Contact the development team

## 🎯 Roadmap

- [ ] Historical data visualization
- [ ] Weather API integration
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Machine learning predictions
- [ ] Multi-language support

---

**Built with ❄️ by the Frost Alert Team**

Live Demo: [https://frost-alert-hub.lovable.app](https://frost-alert-hub.lovable.app)

Repository: [https://github.com/amowzoon/frost-alert-hub](https://github.com/amowzoon/frost-alert-hub)
