# Elite Deals Hub - Affiliate Link Management Platform

## Overview

This is a full-stack affiliate link management platform built with React, Express, and PostgreSQL. The application allows users to manage affiliate links with a focus on conversion optimization through persuasive UI design and tracking capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

- **Password Protection**: Added secure Creator Mode access with password "9f$81r@V7#iwant"
- **Database Persistence**: Switched to PostgreSQL for permanent product storage
- **Invisible Controls**: Creator Mode button and delete buttons are completely invisible to users
- **Minimalist Design**: Simplified to clean, trustworthy interface with:
  - Dark blue gradient title for trust and security
  - Isolated search bar as main focal point
  - Removed distracting floating elements and excessive animations
  - Clean psychological triggers without overwhelming design
  - Professional blue color scheme throughout
- **Subliminal Psychology**: Maintained conversion elements while appearing minimalist:
  - Subtle scarcity indicators
  - Clean social proof displays  
  - Trust-building color palette
  - Professional guarantee sections
- **Search-Focused UX**: Large, prominent search bar without distracting popular searches
- **Photo Carousel System**: Multiple image support with scrollable carousel:
  - Image upload from camera roll/files (5MB limit)
  - URL input support maintained
  - Smooth navigation arrows on hover
  - Dot indicators for multiple images
  - Smart fallback to gradient backgrounds
- **Custom Pricing**: Optional price field with automatic "original price" psychology (2.2x markup)
- **Enhanced Creator UX**: Scrollable dialog, file upload buttons, success indicators

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **API Design**: RESTful API with JSON responses

### Development Stack
- **Package Manager**: npm
- **TypeScript**: Full-stack type safety
- **Build Process**: Vite for frontend, esbuild for backend
- **Hot Reload**: Vite development server with middleware integration

## Key Components

### Database Schema
- **Users Table**: Basic user authentication structure with username/password
- **Affiliate Links Table**: Core entity with title, URL, description, category, and click tracking
- **Schema Validation**: Zod schemas for runtime type checking and API validation

### Frontend Components
- **Layout Components**: Header, StatsBar, TrustIndicators for conversion optimization
- **Interactive Components**: CategoryFilter, AffiliateCard with click tracking
- **Admin Interface**: AdminPanel for CRUD operations on affiliate links
- **UI Components**: Comprehensive shadcn/ui component library

### Backend Services
- **Storage Layer**: Abstract storage interface with in-memory implementation (MemStorage)
- **API Routes**: RESTful endpoints for affiliate link management
- **Middleware**: Request logging, error handling, and JSON parsing

## Data Flow

1. **Frontend Requests**: React Query manages API calls to Express backend
2. **API Processing**: Express routes handle CRUD operations with validation
3. **Data Storage**: Drizzle ORM interfaces with PostgreSQL database
4. **Real-time Updates**: React Query invalidation for immediate UI updates
5. **Click Tracking**: POST requests increment click counts and redirect users

## External Dependencies

### Frontend Dependencies
- **UI Framework**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Data Fetching**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Hookform resolvers
- **Utilities**: clsx, date-fns, cmdk for enhanced functionality

### Backend Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for schema validation
- **Session Management**: connect-pg-simple for PostgreSQL session store

### Development Tools
- **Replit Integration**: Vite plugins for Replit-specific features
- **Development Server**: Vite with Express middleware integration
- **Database Migrations**: Drizzle Kit for schema management

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database Setup**: Drizzle migrations handle schema deployment

### Environment Configuration
- **Development**: NODE_ENV=development with tsx for TypeScript execution
- **Production**: NODE_ENV=production with compiled JavaScript
- **Database**: DATABASE_URL environment variable for connection

### Hosting Considerations
- **Static Assets**: Frontend served from Express in production
- **API Endpoints**: Express server handles both API and static file serving
- **Database**: PostgreSQL connection via environment variable
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Key Architectural Decisions

1. **Monorepo Structure**: Shared types and schemas between frontend/backend
2. **Type Safety**: Full TypeScript coverage with shared schema validation
3. **Conversion Focus**: UI designed with conversion psychology principles
4. **Scalable Storage**: Abstract storage interface allows easy database switching
5. **Development Experience**: Hot reload and integrated development server
6. **Modern Tooling**: Vite and esbuild for fast builds and development

The application prioritizes developer experience while maintaining production readiness with proper type safety, error handling, and scalable architecture patterns.