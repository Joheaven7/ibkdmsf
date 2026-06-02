# 🏛️ Ifa Bula Kebele Data Management System (IBKDMS)

## 📌 Project Overview

The **Ifa Bula Kebele Data Management System (IBKDMS)** is a full-stack web application designed to digitize and streamline administrative services at the Kebele level in Ethiopia.

The system replaces traditional manual processes with a **secure, role-based, and automated digital platform** for managing vital records and service requests.

---

## 🎯 Objectives

* Digitize Kebele services
* Reduce paperwork and human error
* Improve service efficiency
* Enhance transparency and accountability
* Provide secure role-based access

---

## 🧱 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB

### Additional Technologies

* JWT (Authentication & Authorization)
* Multer (File Upload)
* Nodemailer (Email Notifications)
* REST API Architecture

---

## 🏗️ System Architecture

```text
User → Frontend (React) → Backend API (Express) → Database (MongoDB)
                                 ↓
                          Response → UI Update
```

* **Frontend** handles UI and user interaction
* **Backend** processes logic and APIs
* **Database** stores users, requests, documents

---

## 👥 User Roles

### 👤 Resident

* Register/Login
* Submit service requests
* Upload documents
* Track request status
* View assigned appointments

---

### 🧑‍💼 Clerk

* View all requests
* Verify documents
* Update request status
* Register events (birth, marriage, divorce, death)

---

### 🛡️ Admin

* Approve or reject requests
* Assign appointments
* Manage service records

---

### 👑 Super Admin

* Assign roles (admin, clerk)
* Manage permissions
* Full system control

---

## 🧾 Services Provided

* Birth Certificate
* Death Certificate
* Marriage Certificate
* Divorce Certificate

---

## 🔄 System Workflow

1. User registers and logs in
2. User submits request with documents
3. Clerk reviews and verifies documents
4. Admin approves or rejects request
5. Admin assigns appointment
6. User visits Kebele office
7. Certificate is issued
8. User receives notification

---

## 📅 Appointment System

* Admin assigns date and time
* Prevents overcrowding
* Displayed in user dashboard

---

## 📂 Document Management

* Upload supporting files (PDF/Image)
* Backend handles file storage using Multer
* Clerk verifies documents
* Supports re-upload (version tracking)

---

## 🔔 Notification System

* Email notifications (Nodemailer)
* In-app alerts (frontend)

Triggers:

* Request submission
* Approval / Rejection
* Appointment assignment

---

## 🔐 Security Features

* JWT-based authentication
* Role-Based Access Control (RBAC)
* Protected API routes
* Input validation
* Secure file handling

---

## 📊 Dashboard Features

### Resident:

* Submit requests
* Track status
* View appointments

### Clerk:

* Verify documents
* Manage requests

### Admin:

* Approve/reject
* Assign appointments

### Super Admin:

* Role & permission management

---

## 🧾 Certificate System

* Generated after approval and verification
* Unique certificate ID

Example:

```text
IBKDMS-BR-2026-000123
```

---

## 🌐 Public Website

* Home
* About
* Services
* Contact

---

## 🎨 UI/UX Features

* Responsive design
* Dark mode support
* Clean and modern interface
* User-friendly forms

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone (https://github.com/Joheaven7/ibkdmsf)
cd ibkdms
```
 
---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```text
ibkdms/
 ├── frontend/
 │   ├── src/
 │   └── ...
 ├── backend/
 │   ├── controllers/
 │   ├── models/
 │   ├── routes/
 │   └── ...
```

---

## 🚀 Current Status

* Frontend: ✅ Completed
* Backend: ✅ Integrated
* Authentication: ✅ Working
* File Upload: ✅ Working
* Request System: ⚠️ Under Testing

---

## 🚧 Future Improvements

* SMS notifications
* National ID integration
* Cloud file storage
* QR code verification
* Multi-language support
* Mobile application

---

## 👨‍💻 Team Contribution

* Frontend Development
* Backend Development
* UI/UX Design
* System Architecture
* Testing & Debugging

---

## 📄 License

This project is for academic purposes.

---

## 🙌 Acknowledgment

Special thanks to our advisor and team members for their support and guidance.

---
