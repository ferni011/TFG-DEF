# Sneaker Price Comparison Platform

## Overview

This project was developed as my **Bachelor’s Thesis (TFG)** and focuses on building a **full-stack web platform to compare sneaker prices across multiple online stores**, helping users find the best available deals in real time.

The goal of the project was to design and implement a **scalable, production-ready system** that aggregates product data from different sources, normalizes it, and presents it to users through a clean and intuitive interface.

---

## Problem Statement

Sneaker prices vary significantly between retailers and change frequently due to discounts, restocks, and limited offers. Manually checking multiple websites is time-consuming and inefficient.

The platform solves this by:

* Collecting sneaker prices from multiple online stores
* Unifying and normalizing product data
* Displaying price comparisons in a single interface
* Allowing users to track products and receive alerts

---

## Main Features

* **Sneaker price comparison** across multiple e-commerce sources
* **Search and filtering** by brand, model, size and price range
* **Product detail pages** with historical price information
* **Price alerts**: users can subscribe to notifications when a product drops below a target price
* **User authentication** and personal watchlists
* **Responsive UI** for desktop and mobile

---

## Architecture

The application follows a **classic full-stack architecture** with a clear separation of concerns:

### Frontend

* Built as a **Single Page Application (SPA)**
* Responsible for product search, filtering, comparison views and user interactions

### Backend

* RESTful API exposing endpoints for products, prices, users and alerts
* Handles business logic, data normalization and persistence

### Data Layer

* Centralized database to store products, prices, users and alert configurations
* Background processes to keep prices up to date

---

## Technology Stack

### Frontend

* **React**
* HTML5 / CSS3
* JavaScript (ES6+)

### Backend

* **Node.js**
* **Express.js**
* REST API design

### Database

* MongoDB (document-oriented model)

### Other

* JWT-based authentication
* Git for version control

---

## Key Technical Challenges

* **Data normalization**: different stores expose product data in different formats
* **Price update strategy** to keep information fresh without overloading sources
* **Scalable backend design** to support future stores and features
* **Clean API design** to decouple frontend and backend

---

## What I Learned

Through this project I gained hands-on experience in:

* Designing and implementing a **full-stack application from scratch**
* Building **REST APIs** and integrating them with a modern frontend
* Structuring real-world projects with scalability in mind
* Managing application state, authentication and user-specific data
* Working with asynchronous processes and external data sources

---

## Project Status

The project was completed successfully as an academic final degree project, but it was designed with **real-world applicability** in mind and could be extended with:

* More stores and data sources
* Advanced price analytics
* Mobile application support

---

## Author

**Fernando Pastrana**
Full-Stack Developer (Angular, Java, React, Node.js)

---

> This repository represents my Bachelor’s Thesis and demonstrates my ability to design, implement and deliver a complete software product end-to-end.

