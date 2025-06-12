# docflow-server

> document processing system

This repository contains the processing server for a document processing system. It receives documents from a Windows application, processes them using OCR services, and maps extracted data to predefined layouts. After processing, the data is sent back for user verification and correction. Once finalized, the server forwards the document based on configured rules, such as saving it locally, uploading via FTP, or sending it to an external API. This repo focuses on the processing server, which interacts with separate repositories for the [Windows application](https://github.com/kanitakadusic/si-docflow-windows.git) and [admin dashboard](https://github.com/HarisMalisevic/si-docflow-admin.git).

## Architecture 🗂️

The component diagram of the system is provided below.  

![System architecture](documentation/images/systemArchitecture.png)

## How to Use ⚙️

> To clone and run this application, you will need [Git](https://git-scm.com/), [Node.js](https://nodejs.org/) and [PostgreSQL](https://www.postgresql.org/download/).

### Option 1: Using processing server independently

To set up and run the application independently, follow steps **1** through **4** below. After initial setup, step **5** covers ongoing development.

### Option 2: Using admin dashboard together with processing server

For a complete setup, first follow the instructions in the [si-docflow-admin](https://github.com/HarisMalisevic/si-docflow-admin) repository. Then, proceed with steps **1**, **2** and **5** below for the processing server.

---

#### 1. Environment Setup & Dependency Installation
```
# Clone the repository
$ git clone https://github.com/kanitakadusic/si-docflow-server.git

# Navigate to the project directory
$ cd si-docflow-server

# Install all dependencies
$ npm install
```

#### 2. Configuration File Setup

Create a _.env_ file in the project root with required environment variables. See [env-setup.md](./documentation/env-setup.md) for details.  

#### 3. Code Build & Database Seed
```
# Compile TypeScript to JavaScript
$ npm run build

# Load and export environment variables
$ npm run vars

# Create database tables and insert seed data
$ npm run seed
```

#### 4. Bootstrap & Application Startup
```
# Perform initial setup tasks
$ npm run bootstrap

# Start the application
$ npm run serve
```

#### 5. Development
```
# For further development
$ npm run dev
```

## Documentation 📚

- [Environment Variables Setup](./documentation/env-setup.md)
- [API documentation](https://docflow-server.up.railway.app/api-docs/)
- [Questions and Answers](./documentation/q&a.md)

## Instructional Videos 🎥

👉 [Click here to watch the local setup video](https://drive.google.com/file/d/1wA7gXKN9DZgM2DjyqakIQcsxJYVoVDWQ/view?usp=sharing) (4 minutes 39 seconds)

👉 [Click here to watch the Railway deployment video](https://drive.google.com/file/d/1AthoUzsoxkc6dAKwPNVe76llghace6MH/view?usp=sharing) (10 minutes 26 seconds)
