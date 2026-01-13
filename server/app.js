require("dotenv").config(); // Load environment variables from .env file

const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const PORT = process.env.PORT || 5005;

// IMPORT MODELS
const Cohort = require("./models/Cohort.model");
const Student = require("./models/Student.model");

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

// DATABASE CONNECTION
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cohort-tools-api";

mongoose
  .connect(MONGODB_URI)
  .then((x) => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// MIDDLEWARE
// CORS goes first
app.use(
  cors({
    // Add the URLs of allowed origins to this array
    origin: ["http://localhost:5173"],
  })
);
// Then Helmet for security purposes
app.use(helmet());
// Then other middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ROUTES - https://expressjs.com/en/starter/basic-routing.html

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
app.get("/api/cohorts", async (req, res) => {
  try {
    const cohorts = await Cohort.find();
    res.json(cohorts);
  } catch (error) {
    console.error("Error fetching cohorts:", error);
    res.status(500).json({ message: "Error fetching cohorts" });
  }
});

/**
 * @swagger
 * /api/cohorts/{cohortId}:
 *   get:
 *     summary: Get a cohort by ID
 *     description: Retrieve a single cohort by its ID
 *     parameters:
 *       - in: path
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *         description: The cohort ID
 *     responses:
 *       200:
 *         description: A single cohort
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: number
 *                 cohortSlug:
 *                   type: string
 *                 cohortName:
 *                   type: string
 *                 program:
 *                   type: string
 *                 campus:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                 endDate:
 *                   type: string
 *                 inProgress:
 *                   type: boolean
 *                 programManager:
 *                   type: string
 *                 leadTeacher:
 *                   type: string
 *                 totalHours:
 *                   type: number
 *       404:
 *         description: Cohort not found
 */
app.get("/api/cohorts/:cohortId", async (req, res) => {
  const { cohortId } = req.params;

  try {
    const cohort = await Cohort.findById(cohortId);

    if (!cohort) {
      return res.status(404).json({ message: "Cohort not found" });
    }

    res.json(cohort);
  } catch (error) {
    console.error("Error fetching cohort:", error);
    res.status(500).json({ message: "Error fetching cohort" });
  }
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
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().populate("cohort");
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
});

/**
 * @swagger
 * /api/students/cohort/{cohortId}:
 *   get:
 *     summary: Get all students from a specific cohort
 *     description: Retrieve all students belonging to a specific cohort
 *     parameters:
 *       - in: path
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *         description: The cohort ID
 *     responses:
 *       200:
 *         description: A list of students in the cohort
 *       404:
 *         description: No students found for this cohort
 */
app.get("/api/students/cohort/:cohortId", async (req, res) => {
  const { cohortId } = req.params;

  try {
    const students = await Student.find({ cohort: cohortId }).populate("cohort");
    res.json(students);
  } catch (error) {
    console.error("Error fetching students by cohort:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
});

/**
 * @swagger
 * /api/students/{studentId}:
 *   get:
 *     summary: Get a student by ID
 *     description: Retrieve a single student by their ID
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: A single student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: number
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 linkedinUrl:
 *                   type: string
 *                 languages:
 *                   type: array
 *                   items:
 *                     type: string
 *                 program:
 *                   type: string
 *                 background:
 *                   type: string
 *                 image:
 *                   type: string
 *                 cohort:
 *                   type: number
 *                 projects:
 *                   type: array
 *       404:
 *         description: Student not found
 */
app.get("/api/students/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId).populate("cohort");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Error fetching student" });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
