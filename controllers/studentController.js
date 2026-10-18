const Student = require('../models/Student');

const getAll = async (req, res) => {
	try {
		const students = await Student.find();

		res.status(200).json({
			data: students,
			message: 'Get student list successfully',
			success: true
		});
	} catch (error) {
		res.status(500).json({
			message: 'Internal server error',
			success: false
		});
	}
};

const getById = async (req, res) => {
	try {
		const student = await Student.findOne({ studentId: req.params.id });

		if (!student) {
			return res.status(404).json({
				message: 'Student not found',
				success: false
			});
		}

		res.status(200).json({
			data: student,
			message: 'Get student by ID successfully',
			success: true
		});
	} catch (error) {
		res.status(500).json({
			message: 'Internal server error',
			success: false
		});
	}
};

const create = async (req, res) => {
	try {
		const { studentId, name, age, gpa } = req.body;

		console.log(req.body);

		const newStudent = await Student.create({
			studentId,
			name,
			age,
			gpa
		});

		res.status(201).json({
			data: newStudent,
			message: 'Create student successfully',
			success: true
		});
	} catch (error) {
		res.status(500).json({
			message: 'Internal server error',
			success: false
		});
	}
};

const update = async (req, res) => {
	try {
		const { studentId, name, age, gpa } = req.body;

		const updatedStudent = await Student.findOneAndUpdate(
			{ studentId: req.params.id },
			{
				studentId,
				name,
				age,
				gpa
			},
			{
				returnDocument: 'after'
			}
		);

		res.status(200).json({
			data: updatedStudent,
			message: 'Update student successfully',
			success: true
		});
	} catch (error) {
		res.status(500).json({
			message: 'Internal server error',
			success: false
		});
	}
};

const remove = async (req, res) => {
	try {
		await Student.findOneAndDelete({ studentId: req.params.id });

		res.status(200).json({
			message: 'Delete student successfully',
			success: true
		});
	} catch (error) {
		res.status(500).json({
			message: 'Internal server error',
			success: false
		});
	}
};

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove
};
