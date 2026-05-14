# Universal Ticket Booking System

A full-stack ticket booking platform supporting movies, concerts, and railway ticket reservations through a unified booking experience.

## Overview

Universal Ticket Booking System is a scalable full-stack application designed to manage event discovery, ticket booking, real-time seat selection, secure payments, and digital ticket delivery. The platform supports multiple user roles with role-based access control and provides end-to-end booking workflows for different event categories.

The system focuses on backend architecture, real-time synchronization, secure authentication, booking orchestration, and payment-driven workflows.

The application is built using:

* React.js and Tailwind CSS for the frontend
* Node.js and Express.js for the backend
* PostgreSQL as the primary database
* WebSockets for real-time seat synchronization
* Razorpay for payment integration
* JWT and OAuth-based authentication

Frontend runs on:

```text
http://localhost:5173
```

Backend runs on:

```text
http://localhost:3000
```

---

# Features

## Role-Based Access Control (RBAC)

The platform supports three primary roles:

### Users

* Browse events
* Select seats
* Book tickets
* View bookings and transaction history
* Download PDF tickets

### Vendors

* Create and manage events
* Monitor ticket sales
* Manage event details

### Admins

* Manage users and vendors
* Moderate platform events
* Monitor booking activity
* Access platform-level controls

---

# Authentication and Authorization

* JWT-based authentication system
* Secure login and signup flows
* OAuth integration
* Protected API routes using role-based authorization
* Password management and profile updates

---

# Event Booking System

Supports multiple event categories including:

* Movie ticket booking
* Concert ticket booking
* Railway ticket booking

Features include:

* Event listings and filtering
* Event-specific booking forms
* Date and time selection
* Passenger and seat selection
* Booking confirmation workflows

---

# Real-Time Seat Selection

Implemented using WebSockets for live synchronization.

Features:

* Real-time seat availability updates
* Dynamic seat status changes
* Prevention of double booking
* Interactive seat grid selection

Seat states:

* Available
* Selected
* Booked

---

# Payment Integration

Integrated Razorpay test mode into the booking workflow.

Features:

* Wallet-based payment handling
* Secure transaction flow
* Booking confirmation after successful payment
* Payment validation and booking persistence

---

# PDF Ticket Generation and Email Delivery

After successful booking, the system automatically:

* Generates downloadable PDF tickets
* Embeds QR codes for ticket verification
* Sends booking confirmation emails
* Stores booking records for future access

Ticket information includes:

* User details
* Event details
* Seat information
* Booking identifiers
* QR code verification

---

# Dynamic Pricing System

Implemented demand-driven ticket pricing.

Features:

* Tracks booking demand in real time
* Dynamically adjusts ticket prices
* Increases pricing as seat availability decreases
* Supports event-based pricing strategies

---

# Recommendation System

Implemented personalized event recommendations using user booking history.

Features:

* Booking pattern analysis
* Personalized event suggestions
* Category-based preference tracking
* Dynamic event prioritization

---

# System Architecture

## High-Level Flow

```text
User
   ↓
React Frontend
   ↓
Express API Layer
   ↓
Authentication Middleware
   ↓
Booking & Payment Services
   ↓
PostgreSQL Database
```

## Booking Workflow

```text
User Selects Event
        ↓
Seat Selection
        ↓
Real-Time Seat Validation
        ↓
Payment Processing
        ↓
Booking Confirmation
        ↓
PDF Ticket Generation
        ↓
Email Delivery
```

---

# Technologies Used

## Frontend

* React.js
* Tailwind CSS
* Axios
* React Router

## Backend

* Node.js
* Express.js
* PostgreSQL
* Sequelize ORM
* JWT Authentication
* OAuth
* WebSockets

## Integrations

* Razorpay
* QR Code Generation
* Nodemailer
* PDF Generation Libraries

---

# Project Structure

```text
Universal-Ticket-Booking-System/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   └── utils/
│
├── uploads/
├── tickets/
├── package.json
└── README.md
```

---

# Core Backend Features

## Booking Engine

* Booking creation and validation
* Seat availability verification
* Booking persistence
* Transaction management

## Authentication Layer

* JWT token generation and validation
* OAuth authentication flow
* Role-based middleware protection

## Real-Time Services

* WebSocket seat synchronization
* Concurrent booking prevention
* Live seat state updates

## Ticketing Services

* QR code generation
* PDF generation
* Automated email workflows

---

# Running the Project

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on:

```text
http://localhost:5173
```

## Backend

```bash
cd backend
npm install
npm run dev
```

Runs on:

```text
http://localhost:3000
```

---

# Key Engineering Concepts Explored

This project explores core concepts in:

* Full-Stack Development
* Real-Time Systems
* Role-Based Access Control (RBAC)
* Authentication and Authorization
* WebSocket Communication
* Payment System Integration
* Booking System Architecture
* Dynamic Pricing Algorithms
* Recommendation Systems
* Scalable Backend API Design
* Relational Database Design

---

# Design Decisions

## Why WebSockets for Seat Selection?

Real-time seat synchronization prevents race conditions and double booking while ensuring all users receive live updates during seat selection.

## Why JWT Authentication?

JWT enables stateless authentication and scalable API protection across multiple user roles and services.

## Why Dynamic Pricing?

Demand-driven pricing improves revenue optimization by adjusting ticket prices based on booking trends and seat availability.

## Why PostgreSQL?

PostgreSQL provides strong transactional guarantees and relational consistency required for booking and payment systems.

---

# Future Improvements

Potential future extensions include:

* Distributed booking services
* AI chatbot integration
* No-show prediction models
* Microservices architecture
* Containerized deployment
* Event recommendation optimization
* Analytics dashboards

---

# License

This project is intended for educational and research purposes.
