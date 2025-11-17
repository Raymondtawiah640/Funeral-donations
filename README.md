# Legacy Donation - Full Stack Application

A complete full-stack donation platform with Angular 17 frontend and Python Flask backend.

## 🚀 Features

**Frontend (Angular 17 + Tailwind CSS v3):**
- Modern responsive design with Tailwind CSS v3
- Donation form with preset and custom amounts
- Contact form with validation
- Angular Router navigation
- Lazy-loaded components for optimal performance

**Backend (Python + Flask + MySQL):**
- REST API endpoints for donations and contact forms
- MySQL database connection with PDO-style functionality
- CORS-enabled for frontend communication
- JSON API responses with proper error handling

## 📁 Project Structure

```
legacy-donation/
├── src/                           # Angular frontend
│   ├── app/
│   │   ├── components/           # Angular components
│   │   │   ├── home/
│   │   │   ├── about/
│   │   │   ├── donate/
│   │   │   └── contact/
│   │   ├── app.component.ts      # Main layout
│   │   ├── app.config.ts         # Angular config
│   │   └── app.routes.ts         # Routing
│   ├── styles.scss               # Tailwind CSS
│   └── index.html                # Main HTML
├── includes/                      # Python backend modules
│   └── db_connect.py             # Database connection
├── app.py                         # Flask API server
├── requirements.txt               # Python dependencies
├── database_schema.sql           # MySQL database schema
├── tailwind.config.js            # Tailwind configuration
├── angular.json                   # Angular CLI config
└── package.json                   # Node dependencies
```

## 🛠️ Setup Instructions

### 1. Database Setup

1. **Create MySQL Database:**
```sql
CREATE DATABASE smms;
```

2. **Run Database Schema:**
```bash
mysql -u root -p smms < database_schema.sql
```

### 2. Python Backend Setup

1. **Install Python Dependencies:**
```bash
pip install -r requirements.txt
```

2. **Start Flask API Server:**
```bash
python app.py
```

The API will be available at: `http://localhost:5000`

**Available API Endpoints:**
- `GET /api/health` - Health check with database connection test
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create new donation
- `POST /api/contact` - Submit contact form
- `GET /api/statistics` - Get donation statistics

### 3. Angular Frontend Setup

1. **Install Dependencies:**
```bash
npm install
```

2. **Start Development Server:**
```bash
npm start
# or
ng serve
```

The frontend will be available at: `http://localhost:4200`

## 🔧 Configuration

### Database Connection

Update the database configuration in `includes/db_connect.py`:

```python
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "dbuser",
    "password": "kilnpassword1",
    "database": "smms",
    "charset": "utf8mb4"
}
```

### API Endpoints

The Angular frontend communicates with the Python backend through these endpoints:

- **Donation Creation:** `POST http://localhost:5000/api/donations`
- **Contact Form:** `POST http://localhost:5000/api/contact`
- **Statistics:** `GET http://localhost:5000/api/statistics`

## 🗃️ Database Schema

The application uses the following main tables:

- **donations** - Stores donation records
- **contact_messages** - Stores contact form submissions
- **organizations** - Organization information
- **donation_campaigns** - Donation campaigns

## 🎨 Frontend Components

### Home Component
- Welcome message with call-to-action
- Mission statement and features
- Statistics display

### About Component
- Organization information
- Impact statistics
- Team information

### Donate Component
- Preset donation amounts ($25, $50, $100, $250, $500)
- Custom amount input
- Donor information form
- One-time vs monthly options
- Form validation

### Contact Component
- Contact information display
- Contact form with validation
- Business hours and location

## 🔒 Security Features

- Input validation on all forms
- SQL injection prevention using parameterized queries
- CORS configuration for secure frontend-backend communication
- Error handling with proper HTTP status codes

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Tailwind CSS utility classes
- Responsive navigation menu
- Touch-friendly interface

## 🚀 Deployment

### Frontend (Angular)
```bash
npm run build
# Deploy dist/ folder to your web server
```

### Backend (Python)
```bash
# For production deployment
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🛡️ Environment Variables

For production, create a `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=dbuser
DB_PASS=kilnpassword1
DB_NAME=smms
FLASK_ENV=production
FLASK_DEBUG=False
```

## 📞 Support

For questions or support, contact:
- Email: info@legacydonation.org
- Phone: (555) 123-4567

## 📄 License

This project is licensed under the MIT License.