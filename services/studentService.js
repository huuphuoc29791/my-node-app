const createStudentService = studentRepository => {
	const getAll = () => studentRepository.findAll();

	const getById = async id => {
		const student = await studentRepository.findByStudentId(id);
		if (!student) {
			const error = new Error('Student not found');
			error.statusCode = 404;
			throw error;
		}
		return student;
	};

	const create = data => studentRepository.create(data);

	const update = (id, data) => studentRepository.updateByStudentId(id, data);

	const remove = id => studentRepository.deleteByStudentId(id);

	const search = name => studentRepository.findByName(name);

	return {
		getAll,
		getById,
		create,
		update,
		remove,
		search
	};
};

module.exports = createStudentService;
