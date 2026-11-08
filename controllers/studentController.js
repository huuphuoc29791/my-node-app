const CreateStudentDTO = require('../dtos/CreateStudentDTO');
const UpdateStudentDTO = require('../dtos/UpdateStudentDTO');

// Dependency được truyền từ bên ngoài để dễ thay thế khi kiểm thử.
const createStudentController = (studentService) => {
	const getAll = async (req, res) => {
		try {
			const students = await studentService.getAll();

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
			const student = await studentService.getById(req.params.id);

			res.status(200).json({
				data: student,
				message: 'Get student by ID successfully',
				success: true
			});
		} catch (error) {
			res.status(error.statusCode === 404 ? 404 : 500).json({
				message:
					error.statusCode === 404
						? error.message
						: 'Internal server error',
				success: false
			});
		}
	};

	const create = async (req, res) => {
		try {
			const newStudent = await studentService.create(new CreateStudentDTO(req.body));

			res.status(201).json({
				data: newStudent,
				message: 'Create student successfully',
				success: true
			});
		} catch (error) {
			res.status(error.statusCode === 400 ? 400 : 500).json({
				message: error.statusCode === 400 ? error.message : 'Internal server error',
				success: false
			});
		}
	};

	const update = async (req, res) => {
		try {
			const updatedStudent = await studentService.update(
				req.params.id,
				new UpdateStudentDTO(req.body)
			);

			res.status(200).json({
				data: updatedStudent,
				message: 'Update student successfully',
				success: true
			});
		} catch (error) {
			res.status(error.statusCode === 400 ? 400 : 500).json({
				message: error.statusCode === 400 ? error.message : 'Internal server error',
				success: false
			});
		}
	};

	const remove = async (req, res) => {
		try {
			await studentService.remove(req.params.id);

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

	// GET /api/students/search?q={keyword}
	const search = async (req, res) => {
		try {
			const students = await studentService.search(req.query.q);

			res.status(200).json({
				data: students,
				message: 'Search student successfully',
				success: true
			});
		} catch (error) {
			res.status(500).json({
				message: 'Internal server error',
				success: false
			});
		}
	};

	return {
		getAll,
		getById,
		create,
		update,
		remove,
		search
	};
};

module.exports = createStudentController;
