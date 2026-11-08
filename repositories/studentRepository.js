const createStudentRepository = Student => {
	const findAll = () => Student.find();

	const findByStudentId = studentId => Student.findOne({ studentId });

	const create = data => Student.create(data);

	const updateByStudentId = (studentId, data) =>
		Student.findOneAndUpdate({ studentId }, data, {
			returnDocument: 'after'
		});

	const deleteByStudentId = studentId =>
		Student.findOneAndDelete({ studentId });

	const findByName = name => Student.find({ name });

	return {
		findAll,
		findByStudentId,
		create,
		updateByStudentId,
		deleteByStudentId,
		findByName
	};
};

module.exports = createStudentRepository;
