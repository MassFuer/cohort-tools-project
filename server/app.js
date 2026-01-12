require("dotenv").config(); // Load environment variables from .env file

const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const PORT = process.env.PORT || 5005;

// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
const cohortsData = require("./data/cohorts.json");
const studentsData = require("./data/students.json");

// SWAGGER CONFIGURATION
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cohort Tools API",
      version: "1.0.0",
      description: "API for managing cohorts and students",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./app.js"], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();

// MIDDLEWARE
// CORS goes first
app.use(cors());
// Then Helmet for security purposes
app.use(helmet());
// Then other middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...

// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

/**
 * @swagger
 * /api/cohorts:
 *   get:
 *     summary: Get all cohorts
 *     description: Retrieve a list of all cohorts
 *     responses:
 *       200:
 *         description: A list of cohorts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: number
 *                   cohortSlug:
 *                     type: string
 *                   cohortName:
 *                     type: string
 *                   program:
 *                     type: string
 *                   campus:
 *                     type: string
 *                   startDate:
 *                     type: string
 *                   endDate:
 *                     type: string
 *                   inProgress:
 *                     type: boolean
 *                   programManager:
 *                     type: string
 *                   leadTeacher:
 *                     type: string
 *                   totalHours:
 *                     type: number
 */
app.get("/api/cohorts", (req, res) => {
  res.json(cohortsData);
});

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all students
 *     responses:
 *       200:
 *         description: A list of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: number
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   linkedinUrl:
 *                     type: string
 *                   languages:
 *                     type: array
 *                     items:
 *                       type: string
 *                   program:
 *                     type: string
 *                   background:
 *                     type: string
 *                   image:
 *                     type: string
 *                   cohort:
 *                     type: number
 *                   projects:
 *                     type: array
 */
app.get("/api/students", (req, res) => {
  res.json(studentsData);
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
