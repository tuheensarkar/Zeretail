# Zeretail Vendor Analytics Dashboard

A comprehensive analytics dashboard for B2B wholesale vendors, built with Next.js 16, TypeScript, and Tailwind CSS. This dashboard provides real-time insights into sales performance, order metrics, and vendor analytics for businesses operating in the restaurant, hotel, and cafe supply industry.

## Features

- **Real-time Analytics**: Monitor sales performance and order metrics
- **KPI Tracking**: Key performance indicators for business health
- **Sales Visualization**: Interactive charts for sales trends
- **Order Management**: Track and manage customer orders
- **Product Catalog**: Manage inventory and product information
- **Customer Insights**: View customer data and interactions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite with better-sqlite3
- **UI Components**: shadcn/ui, Recharts for data visualization
- **API Communication**: RESTful APIs with fetch

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Getting Started

### Installation

**1. Clone the repository:**
   git clone <repository-url>
   cd vendor-analytics-dashboard
**Install dependencies:**
  npm install
**Set up environment variables:**
**Create a .env.local file in the root directory with the following:**
  NEXT_PUBLIC_API_URL=http://localhost:4000
  
**Running the Application**
**Start the backend server:**
1. cd backend
   npm install
   npm start
2. **In a new terminal, start the frontend development server:**
  npm run dev
  Open your browser and navigate to http://localhost:3000
**Project Structure**
vendor-analytics-dashboard/
├── app/                   # Next.js 16 app directory
│   ├── api/               # API routes
│   ├── customers/         # Customer management page
│   ├── orders/            # Order management page
│   ├── products/          # Product catalog page
│   └── page.tsx           # Main dashboard page
├── backend/               # Express.js backend
│   └── src/
│       ├── data/          # SQLite database
│       ├── db.js          # Database connection
│       └── server.js      # Server implementation
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── customers/         # Customer-related components
│   ├── orders/            # Order-related components
│   ├── products/          # Product-related components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
└── public/                # Static assets
**Key Components**
**Dashboard**
KPI Cards: Overview of key metrics
Metrics Overview: Detailed performance indicators
Sales Chart: Revenue trends over time
Orders Chart: Order volume visualization
Top Products: Best-selling items
Recent Orders: Latest customer orders

**Customer Management**
View customer list with details
Add, edit, and delete customers
Search and filter functionality

**Order Management**
Track order status and details
View order history
Manage order fulfillment

**Product Catalog**
Maintain product inventory
Track stock levels
View product performance

**Database Schema**
The application uses SQLite with the following tables:
    customers: Customer information
    orders: Order details and status
    products: Product catalog and inventory
    
**Development**
**Available Scripts**
    npm run dev: Start development server
    npm run build: Build for production
    npm start: Start production server
    npm run lint: Run ESLint
    
**Code Quality**
TypeScript for type safety
ESLint for code linting
Prettier for code formatting

**Contributing**
Fork the repository
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a pull request

**License**
This project is licensed under the MIT License - see the LICENSE file for details.

**Acknowledgments**
Built with Next.js and shadcn/ui components
Data visualization powered by Recharts
Icons from Lucide React
