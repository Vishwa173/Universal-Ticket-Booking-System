This project has been done using react.js, tailwind css for the front end, and Express (NodeJs) and PostgreSQL for the backend. The front end runs on the port 5173, and the backend in the port 3000.


Universal Ticket Booking System

A full-stack application that allows users to book various types of tickets — including movie tickets, concert tickets, and railway tickets — through a single unified platform. The system supports core features such as user authentication, event listings, real-time seat selection, payments, and PDF ticket generation. Additionally, it includes an admin dashboard for event management and booking analytics.

There are three roles: users, vendors, and admins.

Users are customers who browse events and purchase tickets through the application.

Vendors are event organizers who list their events on the platform to sell tickets.

Admin oversees the platform, managing users, vendors, and moderating events to ensure smooth operations.

Each booking results in an email confirmation sent to the user, with a downloadable PDF ticket (containing QR code). The system supports both basic and advanced functionality depending on the deployment mode (Normal, Hacker, Hacker++), and can be extended with AI-powered features like dynamic pricing and recommendation systems.

The project is divided into three main development tiers, each building on the last:

NORMAL MODE

~~User Authentication~~

~~Implement Sign up, login, and Signout functionality for different roles, i.e., user, vendor, or admin.~~

~~Every user will be credited with some amount of money upon account creation.~~

~~Event Listing Page~~

~~Displays all available events across different categories (movie, concert, and train ticket booking are necessary).~~

~~Filtering by event type is supported.~~

~~Booking Form~~

~~For each event, users select the date, time, and number of seats (or passengers).~~

~~Includes specific fields for each event type (e.g., source and destination for trains).~~

~~Ticket Summary Page~~

~~Displays the user's selections before final submission.~~

~~Forgot Password Functionality~~

~~Implement forgot password functionality~~

~~Profile Page~~

~~Add a page to display the user profile, which has the following functionalities:~~

~~Enables to add profile picture~~

~~Edit the user details~~

~~Change password~~

~~Transaction History / User Bookings~~

~~Booking Cancellation~~

HACKER MODE

~~OAuth and DAuth~~

~~Integrate OAuth and DAuth along with the manual login.~~

~~Do not use external libraries/modules for OAuth authentication.~~

Basic Admin Panel

Implement an admin panel, which offers the following functionalities:

~~Log in as admin to add, edit, or delete events.~~

Admin can see the list of events organized by every vendor and, similarly, the list of events booked by every user.

Admin can view all bookings with filters for event/date/user.

Admin dashboard shows a list of top-performing events.

~~Admin can suspend/delete vendor and user accounts.~~

~~Seat Selection Grid~~

~~Use websockets for seat selection in real-time.~~

~~Users can visually pick their own seats in a grid layout.~~

~~A seat should have any one of the following statuses:~~

~~Available~~

~~Selected~~

~~Booked~~

~~Seats marked booked are disabled from further selection.~~

~~Prevent double-booking and updating the status of the seats in realtime.~~

~~Payment Integration~~

~~Razorpay or Stripe test mode integrated into booking flow (any other payment API can also be used).~~

~~Bookings are marked as successful only after payment.~~

~~PDF Ticket Generation with QR Code & Email Delivery~~

~~After a successful booking, the system automatically generates a PDF ticket containing:~~

~~User & booking details (name, event, date, seats, etc.)~~

~~Event-specific info~~

~~A unique QR code for check-in or verification~~

~~This ticket is:~~

~~Attached to the booking confirmation email~~

~~Available for download from the user’s dashboard~~

~~The PDF should be cleanly designed with headers, event details, and a scannable QR code for fast and secure entry.~~

HACKER++ MODE

~~Recommendation~~

~~Recommend different events to the user based on the user's previous bookings.~~

Analytics Dashboard

Charts showing the most popular events, revenue by date, and active users.

Chatbot Assistant

Helps users search for events, book tickets, and answer queries.

Provides a seamless, interactive experience with personalized recommendations and support.

No-Show Prediction

Predicts whether users will attend the event based on patterns in their past behavior.

Useful for train ticket overbooking models.

~~Dynamic Pricing Algorithm~~

~~Adjusts ticket costs based on event demand.~~
~~Increases prices for popular or near-sell-out events.~~
