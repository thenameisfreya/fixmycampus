# Reficere

A campus maintenance reporting platform built for St Mary's University Twickenham as part of CPS7005 Web Application Development.

Students can report and track maintenance issues. The facilities team can manage and resolve them from a single dashboard.

## Live App

https://reficere.vercel.app

Facilities login: facilities@stmarys.ac.uk / password123

Student login: register at https://reficere.vercel.app/register with any email and password

## Stack

React / Node.js / Express / MongoDB Atlas / JWT / Leaflet.js

Deployed on Vercel (frontend) and Railway (backend)

## Running Locally

Clone the repo:

```
git clone https://github.com/thenameisfreya/fixmycampus.git
```

Install dependencies in both folders:

```
cd server && npm install
cd ../client && npm install
```

Create a .env file in the server folder:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5001
EMAIL_ADDRESS=your_gmail
EMAIL_PASSWORD=your_gmail_app_password
CLIENT_URL=http://localhost:3000
```

Run the server:

```
cd server && npm run dev
```

Run the client in a new terminal:

```
cd client && npm start
```

App runs at http://localhost:3000

## Releases

v1.0.0 Initial release with core features

v1.1.0 CSV export and campus map with OpenStreetMap

v1.2.0 Security updates including Helmet and rate limiting

## Module

CPS7005 Web Application Development
St Mary's University Twickenham