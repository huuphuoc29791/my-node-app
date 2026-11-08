const fields = ['studentId', 'name', 'age', 'gpa'];

const invalid = message => {
	const error = new Error(message);
	error.statusCode = 400;
	throw error;
};

const parseStudentInput = (input, { partial = false } = {}) => {
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		invalid('Student data must be a JSON object');
	}

	const data = {};
	for (const field of fields) {
		if (!Object.hasOwn(input, field)) {
			if (!partial) invalid(`${field} is required`);
			continue;
		}

		const value = input[field];
		if (field === 'studentId' || field === 'name') {
			if (typeof value !== 'string' || value.trim() === '') {
				invalid(`${field} must be a non-empty string`);
			}
		} else if (typeof value !== 'number' || !Number.isFinite(value)) {
			invalid(`${field} must be a finite number`);
		}
		data[field] = value;
	}

	if (partial && Object.keys(data).length === 0) {
		invalid('At least one student field is required');
	}
	return data;
};

module.exports = { parseStudentInput };
