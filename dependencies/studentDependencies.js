const Student = require('../models/Student');
const createStudentRepository = require('../repositories/studentRepository');
const createStudentService = require('../services/studentService');
const createStudentController = require('../controllers/studentController');

const studentRepository = createStudentRepository(Student);

const studentService = createStudentService(studentRepository);

const studentController = createStudentController(studentService);

module.exports = { studentController };
