# Stream Tide

A robust video streaming API that empowers users to upload, manage, and share videos.

## Key Features

- 🎥 **Video Uploading:** Easily upload videos to the platform
- 🗑️ **Video Management:** Authenticated users can delete and update their uploaded videos
- 📂 **Playlist Creation:** Organize videos into custom playlists for easy access
- 💬 **Social Interaction:** Like, comment, and engage with other users' content

## Technical Highlights

- 🔄 **Video Transcoding:** Utilizes FFmpeg for efficient video transcoding, ensuring compatibility across devices
- 📡 **Video Streaming:** Employs HLS (HTTP Live Streaming) for smooth and reliable video delivery

## Installation and Setup

### Prerequisites

Ensure you have the following installed:

- [Node.js and npm](https://nodejs.org/) (or yarn)
- [Git](https://git-scm.com/)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/stream-tide.git
   cd stream-tide
   ```
2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configuration Create a .env file in the project root with the following content:**

   ```bash
   DB_URL=your_database_url
   REDIS_URL=your_redis_url
   JWT_SECRET=your_jwt_secret
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   CLOUDINARY_NAME=your_cloudinary_name
   API_KEY=your_api_key
   API_SECRET=your_api_secret
   ENCRYPTION_KEY=your_encryption_key
   EMAIL_API_KEY=your_email_api_key
   PORT=4000
   ```

4. **Running the Server**

   ```bash
   npm start
   ```

## Technologies and Tools

- 🖥️ **Backend**: Node.js, Express.js
- 🗄️ **Database**: MongoDB
- 🚀 **Caching**: Redis
- 🔐 **Authentication**: JSON Web Tokens (JWT)
- 🎬 **Video Processing**: FFmpeg
- ☁️ **Cloud Storage**: Cloudinary
- 📚 **API Documentation**: Swagger
- 🧪 **Testing**: Jest
- 🐳 **Containerization**: Docker
- 📊 **Job Queue**: BullMQ
<!-- CI/CD: GitHub Actions -->
