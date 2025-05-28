# docflow-server

## Environment Variables Setup

### PORT

The `PORT` variable can remain the same as specified in the [.env.example](../.env.example) file. The application will run on the port defined by this variable.

### DATABASE_URL

Parts of the `DATABASE_URL` variable are configured differently depending on the environment (local or cloud) and the database provider (e.g., Supabase, AWS RDS). In any case, the format of the variable is as follows:

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

For a local setup, one common approach includes the following steps:
1. Install [PostgreSQL](https://www.postgresql.org/download/).
2. Create a database named _si-docflow_.
3. Replace the uppercase parts of the URL. Default settings, with the database created using the specified name, result in the following URL:

```
postgresql://postgres:PASSWORD@localhost:5432/si-docflow
```

To create tables and insert initial data, follow these steps:
```
# Clone the si-docflow-admin repository
$ git clone https://github.com/HarisMalisevic/si-docflow-admin.git

# Go into the backend directory
$ cd si-docflow-server/backend

# Install all dependencies
$ npm install

# Rename .env.example to .env
# Set the DATABASE_URL as explained previously

# Place the sso_init.ts file into the backend/src/migrations folder

# Run the following commands
$ npm run migrate
$ npm run seed
```

After this, the database is fully ready for the [si-docflow-server](https://github.com/kanitakadusic/si-docflow-server).

### GOOGLE_CREDENTIALS_BASE64

...

### GOOGLE_APPLICATION_CREDENTIALS

The `GOOGLE_APPLICATION_CREDENTIALS` variable should remain as it is in the [.env.example](../.env.example) file. It points to the location of the _google-credentials.json_ file, which is generated based on the `GOOGLE_CREDENTIALS_BASE64` variable.

```
./google-credentials.json
```

### OPENAI_API_KEY

...

### AI_MODEL_NAME

The `AI_MODEL_NAME` variable specifies the AI model used for image preprocessing, specifically for document recognition within the image. Currently, two options are available:

- A lighter model, faster to process:
```
lcnet100_h_e_bifpn_256_fp32.onnx
```

- A more accurate model, but heavier:
```
fastvit_sa24_h_e_bifpn_256_fp32.onnx
```

### AI_MODEL_DOWNLOAD_URL

The `AI_MODEL_DOWNLOAD_URL` variable specifies the URL from which the AI model will be downloaded when the server starts for the first time. Depending on the chosen model (i.e., the `AI_MODEL_NAME` variable), this variable should be set to one of the following URLs:

- For model _lcnet100_h_e_bifpn_256_fp32.onnx_:
```
https://drive.usercontent.google.com/download?id=1IlbLPkCv-TdaBLOPh_4J97P1_KHYYJ7a&export=download&authuser=0
```

- For model _fastvit_sa24_h_e_bifpn_256_fp32.onnx_:
```
https://drive.usercontent.google.com/download?id=14vUH77v6yGg7zFctUgcT6BzV5Iisg4Dl&export=download&authuser=0
```

### SUPABASE_URL

...

### SUPABASE_SERVICE_ROLE_API_KEY

...
