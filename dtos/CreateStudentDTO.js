const { parseStudentInput } = require('./studentDtoValidation');

class CreateStudentDTO {
	constructor(input) {
		Object.assign(this, parseStudentInput(input, { partial: false }));
	}
}

module.exports = CreateStudentDTO;
