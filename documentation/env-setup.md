# docflow-server

## Environment Variables Setup

> Variables marked with * must be properly set for the application to work correctly. Other variables can remain as they are in the [.env.example](../.env.example) file.

### PORT

The `PORT` variable can remain the same as specified in the [.env.example](../.env.example) file. The application will run on the port defined by this variable.

### DATABASE_URL *

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

### GOOGLE_CREDENTIALS_BASE64 *

Google credentials are required in order to use the Google Vision OCR engine.

#### How to Generate Credentials

1. Create a Google Cloud Project
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click _Select a project_ > _New project_
   - Enter a project name and click _Create_

2. Enable the Vision API
   - Open the _Navigation menu_
   - Go to _APIs & Services_ > _Library_
   - Search for _Cloud Vision API_
   - Select _Cloud Vision API (Google Enterprise API)_ and click _Enable_

3. Create a Service Account
   - Go to _APIs & Services_ > _Credentials_
   - Click _Create Credentials_ > _Service Account_
   - Fill in the service account name and description
   - Click _Create and continue_, then _Done_
  
4. Create a Key File (JSON)
   - Under _Service Accounts_, click your newly created account
   - Go to the _Keys_ tab
   - Click _Add Key_ > _Create new key_, choose JSON, and click _Create_
   - Save the file securely - it contains sensitive credentials
  
#### How to Integrate Credentials

First, rename the generated credentials file to _google-credentials.json_ and place it in the root of the project.

##### Option 1

If running the project locally, the `GOOGLE_CREDENTIALS_BASE64` variable can be left as it is in the [.env.example](../.env.example) file.

##### Option 2

If the project needs to be pushed to a public repository from which it will be deployed to production, the `GOOGLE_CREDENTIALS_BASE64` variable should be set to the base64-encoded content of the credentials file. Naturally, the _.env_ file must not be pushed to a public repository.

To encode the credentials to base64, simply run:
```
node ./src/config/base64.js
```
This will generate a file named _google-credentials-base64.txt_ in the project root. The contents of this file should be used as the value for the `GOOGLE_CREDENTIALS_BASE64` environment variable.

### GOOGLE_APPLICATION_CREDENTIALS

The `GOOGLE_APPLICATION_CREDENTIALS` variable should remain as it is in the [.env.example](../.env.example) file. It points to the location of the _google-credentials.json_ file, which is generated based on the `GOOGLE_CREDENTIALS_BASE64` variable.

```
./google-credentials.json
```

### OPENAI_API_KEY *

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

In the current implementation, Supabase buckets are used as local storage for processed documents. Therefore, the `SUPABASE_URL` variable represents the base URL of the Supabase project.

To obtain the `SUPABASE_URL`, the following steps need to be completed:

1. Access [Supabase](https://supabase.com/)
2. Log in or create an account
3. Create a new organization
4. Create a new project
5. Navigate to _Project Settings_ > _Data API_
6. Locate the _Project URL_, which corresponds to the `SUPABASE_URL`

```
https://PROJECT_ID.supabase.co
```

### SUPABASE_KEY

The `SUPABASE_KEY` variable serves as the authentication key required to access the Supabase project. It is also used for managing local storage of processed documents.

To obtain the `SUPABASE_KEY`, the following steps need to be completed:

1. Navigate to _Project Settings_ > _API Keys_
2. Locate the _service_role_ key, which corresponds to the `SUPABASE_KEY`
