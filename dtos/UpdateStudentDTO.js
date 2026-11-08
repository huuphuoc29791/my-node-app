const { parseStudentInput } = require('./studentDtoValidation');

class UpdateStudentDTO {
	constructor(input) {
		Object.assign(this, parseStudentInput(input, { partial: true }));
	}
}

module.exports = UpdateStudentDTO;
