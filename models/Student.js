const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
	{
		studentId: {
			type: String,
			required: true,
			unique: true
		},
		name: {
			type: String,
			required: true
		},
		age: {
			type: Number,
			required: true
		},
		gpa: {
			type: Number,
			required: true
		}
	},
	{
		timestamps: true
	}
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
