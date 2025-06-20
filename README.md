# Music Education Scheduler

A comprehensive web application for music teachers, schools, and students to efficiently organize teaching schedules, manage lesson bookings, and share practice materials.

## Overview

The Music Education Scheduler streamlines administrative tasks for music education while enhancing the learning experience. It provides tools for managing schedules, tracking student progress, and facilitating communication between teachers, students, and parents.

## Key Features

- **User Management**: Role-based access system for administrators, teachers, students, and parents
- **Scheduling System**: Advanced calendar interface with availability management, booking, and cancellation
- **Notification System**: Automated reminders for lessons, schedule changes, and practice
- **Lesson Management**: Support for individual, group, and ensemble lessons with flexible location options
- **Student Progress Tracking**: Attendance recording, performance assessment, and achievement milestones
- **Practice Material Management**: File sharing for sheet music, assignments, and recordings
- **Reporting & Analytics**: Generate insights on attendance, progress, and finances

## Technology Stack

### Frontend
- React.js with Material-UI components
- Redux for state management
- FullCalendar.js for interactive calendar interface
- Formik with Yup for form handling and validation

### Backend
- Node.js with Express.js
- RESTful API architecture
- JWT with OAuth 2.0 for authentication

### Database
- PostgreSQL for primary data storage
- Redis for caching and performance optimization

### Cloud Services
- AWS/Google Cloud for hosting
- AWS S3/Google Cloud Storage for file storage
- SendGrid for email services
- Twilio for SMS services

### DevOps
- GitHub Actions for CI/CD
- Docker for containerization
- Kubernetes for deployment

## System Architecture

The application follows a microservices architecture with the following components:

1. **Client Application**: Responsive web interface that communicates with backend services
2. **API Gateway**: Manages authentication, routing, and security policies
3. **Core Services**: Specialized microservices for users, scheduling, notifications, and content
4. **Integration Layer**: Connects with external calendar systems, payment processors, and communication services
5. **Data Layer**: Manages data storage, caching, and file storage
6. **Monitoring & Analytics**: Tracks system performance and generates insights

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- PostgreSQL (v13 or later)
- Redis (v6 or later)
- Docker (optional, for containerized development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/dxaginfo/musicedu-scheduler-2025.git
   cd musicedu-scheduler-2025
   ```

2. Install dependencies:
   ```
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   ```
   # Create .env files in both backend and frontend directories
   # Use the provided .env.example as a template
   ```

4. Set up the database:
   ```
   # Run database migrations
   cd ../backend
   npm run migrate
   
   # Seed initial data (optional)
   npm run seed
   ```

5. Start the development servers:
   ```
   # Start backend server
   cd ../backend
   npm run dev

   # In a separate terminal, start frontend server
   cd ../frontend
   npm start
   ```

### Running with Docker

1. Build and run with Docker Compose:
   ```
   docker-compose up --build
   ```

2. Access the application at `http://localhost:3000`

## Project Structure

```
musicedu-scheduler-2025/
├── backend/                   # Backend Node.js/Express application
│   ├── config/                # Configuration files
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Express middleware
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── utils/                 # Utility functions
│   └── app.js                 # Application entry point
│
├── frontend/                  # React frontend application
│   ├── public/                # Static files
│   ├── src/                   # Source code
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── redux/             # Redux store, actions, and reducers
│   │   ├── services/          # API client services
│   │   ├── styles/            # CSS/SCSS files
│   │   ├── utils/             # Utility functions
│   │   └── App.js             # Application root component
│   └── package.json           # Frontend dependencies
│
├── database/                  # Database migrations and seeds
├── docker/                    # Docker configuration files
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
├── .gitignore                 # Git ignore file
├── docker-compose.yml         # Docker Compose configuration
├── package.json               # Project dependencies and scripts
└── README.md                  # Project documentation
```

## Deployment

### Production Setup

1. Build production-ready artifacts:
   ```
   # Build frontend
   cd frontend
   npm run build

   # Prepare backend for production
   cd ../backend
   npm run build
   ```

2. Deploy using Docker and Kubernetes:
   ```
   # Build Docker images
   docker build -t musicedu-scheduler-backend ./backend
   docker build -t musicedu-scheduler-frontend ./frontend

   # Deploy to Kubernetes cluster
   kubectl apply -f kubernetes/
   ```

### Environment Configuration

Configure the following environment variables for production:

- `NODE_ENV`: Set to "production"
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `AWS_*`: AWS credentials for S3 access
- `SENDGRID_API_KEY`: SendGrid API key for email services
- `TWILIO_*`: Twilio credentials for SMS services

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please open an issue on the GitHub repository.