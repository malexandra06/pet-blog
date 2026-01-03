# Blog Application

A full-stack blog application built with Node.js, Express, MySQL, and EJS templating. Users can create accounts, publish posts with images, like and comment on posts, and view other users' profiles.

## Screenshots

> Add your screenshots in a `screenshots/` folder

![Home Page](screenshots/home.png)
![Login](screenshots/login.png)
![Create Post](screenshots/create-post.png)
![My Posts](screenshots/my-posts.png)

---

## Features

### Authentication
- User registration with email and username
- Secure login with bcrypt password hashing
- Session management with MySQL session store
- Auto-logout after 5 minutes of inactivity

### Posts
- Create posts with title, content, and image upload
- Edit and delete your own posts
- View all posts on the home feed
- View posts by specific user
- Infinite scroll pagination

### Social
- Like/unlike posts
- Comment on posts
- Delete your own comments
- View like and comment counts

### User Profiles
- View any user's posts via `/:username` route
- Personal dashboard for managing your posts

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** bcrypt.js + express-session
- **Session Store:** express-mysql-session
- **File Upload:** Multer
- **Templating:** EJS

### Frontend
- **Styling:** Custom CSS with gradients and animations
- **JavaScript:** jQuery for AJAX requests
- **Layout:** Bootstrap Carousel for posts
- **Design:** Responsive, mobile-friendly

---

## Project Structure
```
blog/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── userController.js
│   │   │   ├── postController.js
│   │   │   ├── likeController.js
│   │   │   └── commentController.js
│   │   ├── models/
│   │   │   ├── user.js
│   │   │   ├── post.js
│   │   │   ├── like.js
│   │   │   └── comment.js
│   │   ├── routes/
│   │   │   ├── userRoute.js
│   │   │   ├── postRoute.js
│   │   │   ├── likeRoute.js
│   │   │   └── commentRoute.js
│   │   ├── db.js
│   │   ├── middlewares.js
│   │   └── index.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   │   ├── style.css
│   │   │   ├── style-navbar.css
│   │   │   ├── style-footer.css
│   │   │   ├── style-index.css
│   │   │   ├── style-createPost.css
│   │   │   └── likes-comments.css
│   │   ├── js/
│   │   │   ├── script.js
│   │   │   ├── script2.js
│   │   │   └── myPosts.js
│   │   └── uploads/
│   │
│   └── views/
│       ├── partials/
│       │   ├── navbar.ejs
│       │   ├── navbar2.ejs
│       │   └── footer.ejs
│       ├── index.ejs
│       ├── login.ejs
│       ├── register.ejs
│       ├── createPost.ejs
│       ├── myPosts.ejs
│       └── userPosts.ejs
│
└── README.md
```

---

## Database Schema
```sql
CREATE DATABASE blog_users;

USE blog_users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id INT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/posts` | Get all posts (paginated) |
| GET | `/api/posts/post/:id` | Get single post |
| GET | `/api/posts/my-posts` | Get logged user's posts |
| GET | `/api/posts/:username` | Get posts by username |
| POST | `/api/posts/post` | Create new post |
| PUT | `/api/posts/update` | Update post |
| PUT | `/api/posts/update-with-image` | Update post with new image |
| DELETE | `/api/posts/deletePost` | Delete post |

### Likes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/likes/toggle` | Like/unlike a post |
| POST | `/api/likes/batch` | Get likes info for multiple posts |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/:post_id` | Get comments for a post |
| POST | `/api/comments` | Create comment |
| POST | `/api/comments/batch` | Get comment counts for posts |
| DELETE | `/api/comments` | Delete comment |

---

## Installation

### Prerequisites
- Node.js (v14+)
- MySQL (v8+)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/blog-app.git
cd blog-app
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**

Create a `.env` file in the backend folder:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=blog_users
DB_PORT=3306
SESSION_SECRET=your_secret_key
NODE_ENV=development
```

4. **Setup database**
```bash
mysql -u root -p < schema.sql
```

5. **Create uploads folder**
```bash
mkdir -p frontend/public/uploads
```

6. **Start the server**
```bash
npm start
```

7. **Open in browser**
```
http://localhost:3000
```

---

## Usage

1. **Register** a new account at `/register`
2. **Login** at `/login`
3. **Create posts** with images at `/create-post`
4. **View your posts** at `/my-posts`
5. **Browse all posts** on the home page `/`
6. **Visit user profiles** at `/:username`
7. **Like and comment** on posts
8. **Logout** at `/logout`
