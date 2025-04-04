# ImobiFlex 🏡



Welcome to **ImobiFlex**, a modern and flexible real estate platform where users can post their property listings effortlessly. Built with cutting-edge technologies, ImobiFlex ensures a seamless and efficient experience for both property owners and seekers.

## 🚀 Features

✅ List and manage property advertisements 🏠
✅ User authentication & authorization 🔑
✅ Secure and scalable database management 📊
✅ Fast and optimized API performance ⚡
✅ Containerized with Docker 🐳
✅ Built with TypeScript for better maintainability ✨

## 🛠 Tech Stack

| Technology | Description                            |
| ---------- | -------------------------------------- |
| TypeScript | Strongly typed language for JavaScript |
| Fastify    | High-performance backend framework     |
| Node.js    | Scalable JavaScript runtime            |
| Prisma     | ORM for database interactions          |
| PostgreSQL | Relational database                    |
| Docker     | Containerization for deployment        |

## 📂 Project Structure

```
📦 imobiFlex
 ┣ 📂 prisma
 ┣ 📂 src
 ┃ ┣ 📂 config
 ┃ ┣ 📂 controllers  # Business logic
 ┃ ┣ 📂 db           # Database connection
 ┃ ┣ 📂 repository   # Managing ORM and DB
 ┃ ┣ 📂 routes       # API routes
 ┃ ┣ 📂 services     # External integrations
 ┃ ┣ 📂 utils
 ┃ ┗ server.ts       # Entry point
 ┣ 📄 .env          # Environment variables
 ┣ 📄 docker-compose.yml # Docker setup
 ┣ 📄 package.json  # Project metadata
 ┗ 📄 README.md      # Documentation
```

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
 git clone https://github.com/SrCrow02/Imobis-Backend.git
 cd Imobis-Backend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the root directory and configure your database and other credentials.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

### 4️⃣ Start the Application

```bash
npm run dev
```

## 📌 API Endpoints

| Method | Endpoint          | Description                   |
| ------ | ----------------- | ----------------------------- |
| GET    | `/properties`     | Get all property listings     |
| POST   | `/property`       | Create a new property listing |
| GET    | `/property/:id`   | Get details of a property     |
| PATCH    | `/property/:id` | Update a property listing     |
| DELETE | `/property/:id`   | Delete a property listing     |

## 🤝 Contributing

We welcome contributions! Feel free to fork the repo and submit a pull request.

## 📜 License

This project is licensed under the **MIT License**.
