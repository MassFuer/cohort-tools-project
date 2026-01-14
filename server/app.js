require("dotenv").config(); // Load environment variables from .env file

const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const PORT = process.env.PORT || 5005;

// IMPORT MODELS
const Cohort = require("./models/Cohort.model");
const Student = require("./models/Student.model");

// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();

// DATABASE CONNECTION
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cohort-tools-api";

mongoose
  .connect(MONGODB_URI)
  .then((x) => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// MIDDLEWARE
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ROUTES

// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Docs route
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

// ==================== COHORT ROUTES ====================

// GET /api/cohorts - Get all cohorts
app.get("/api/cohorts", async (req, res) => {
  try {
    const cohorts = await Cohort.find();
    res.json(cohorts);
  } catch (error) {
    console.error("Error fetching cohorts:", error);
    res.status(500).json({ message: "Error fetching cohorts" });
  }
});

// GET /api/cohorts/:cohortId - Get a cohort by ID
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

// POST /api/cohorts - Create a new cohort
app.post("/api/cohorts", async (req, res) => {
  try {
    const newCohort = await Cohort.create(req.body);
    res.status(201).json(newCohort);
  } catch (error) {
    console.error("Error creating cohort:", error);
    res.status(500).json({ message: "Error creating cohort" });
  }
});

// PUT /api/cohorts/:cohortId - Update a cohort by ID
app.put("/api/cohorts/:cohortId", async (req, res) => {
  const { cohortId } = req.params;

  try {
    const updatedCohort = await Cohort.findByIdAndUpdate(cohortId, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedCohort) {
      return res.status(404).json({ message: "Cohort not found" });
    }

    res.json(updatedCohort);
  } catch (error) {
    console.error("Error updating cohort:", error);
    res.status(500).json({ message: "Error updating cohort" });
  }
});

// DELETE /api/cohorts/:cohortId - Delete a cohort by ID
app.delete("/api/cohorts/:cohortId", async (req, res) => {
  const { cohortId } = req.params;

  try {
    const deletedCohort = await Cohort.findByIdAndDelete(cohortId);

    if (!deletedCohort) {
      return res.status(404).json({ message: "Cohort not found" });
    }

    res.json({ message: "Cohort deleted successfully" });
  } catch (error) {
    console.error("Error deleting cohort:", error);
    res.status(500).json({ message: "Error deleting cohort" });
  }
});

// ==================== STUDENT ROUTES ====================

// GET /api/students - Get all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().populate("cohort");
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
});

// GET /api/students/cohort/:cohortId - Get all students from a specific cohort
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

// GET /api/students/:studentId - Get a student by ID
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

// POST /api/students - Create a new student
app.post("/api/students", async (req, res) => {
  try {
    const newStudent = await Student.create(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Error creating student" });
  }
});

// PUT /api/students/:studentId - Update a student by ID
app.put("/api/students/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(studentId, req.body, {
      new: true,
      runValidators: true
    }).populate("cohort");

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Error updating student" });
  }
});

// DELETE /api/students/:studentId - Delete a student by ID
app.delete("/api/students/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const deletedStudent = await Student.findByIdAndDelete(studentId);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Error deleting student" });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
