# docflow-server

> document processing system

This repository contains the processing server for a document processing system. It receives documents from a Windows application, processes them using OCR services, and maps extracted data to predefined layouts. After processing, the data is sent back for user verification and correction. Once finalized, the server forwards the document based on configured rules, such as saving it locally, uploading via FTP, or sending it to an external API. This repo focuses on the processing server, which interacts with separate repositories for the [Windows application](https://github.com/kanitakadusic/si-docflow-windows.git) and [admin dashboard](https://github.com/HarisMalisevic/si-docflow-admin.git).

## Architecture 🗂️

The component diagram of the system is provided below.  

![System architecture](documentation/images/systemArchitecture.png)

## How to Use ⚙️

To clone and run this application, you will need [Git](https://git-scm.com/), [Node.js](https://nodejs.org/) and [PostgreSQL](https://www.postgresql.org/download/).

```
# Clone the repository
$ git clone https://github.com/kanitakadusic/si-docflow-server.git

# Go into the root directory
$ cd si-docflow-server

# Install all dependencies
$ npm install

# In the project root, add .env with appropriate values
# Follow the instructions provided in ./documentation/env-setup.md

# Create tables and insert seed data
$ npm run build
$ npm run vars
$ npm run seed

# Run the application
$ npm run bootstrap
$ npm run serve

# For further development
$ npm run dev
```

## Instructional Videos 🎥

👉 [Click here to watch the local setup video](https://drive.google.com/file/d/1wA7gXKN9DZgM2DjyqakIQcsxJYVoVDWQ/view?usp=sharing) (4 minutes 39 seconds)

👉 [Click here to watch the Railway deployment video](https://drive.google.com/file/d/1AthoUzsoxkc6dAKwPNVe76llghace6MH/view?usp=sharing) (10 minutes 26 seconds)
