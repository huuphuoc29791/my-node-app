const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Student = require('../models/Student');

const seedStudents = async () => {
	try {
		await connectDB();

		await Student.deleteMany();

		const students = [
			{
				studentId: 'SV001',
				name: 'Nguyen Van An',
				age: 20,
				gpa: 3.5
			},
			{
				studentId: 'SV002',
				name: 'Tran Thi Binh',
				age: 21,
				gpa: 3.8
			},
			{
				studentId: 'SV003',
				name: 'Le Hoang Nam',
				age: 19,
				gpa: 2.9
			},
			{
				studentId: 'SV004',
				name: 'Pham Minh Chau',
				age: 20,
				gpa: 3.2
			},
			{
				studentId: 'SV005',
				name: 'Vo Gia Huy',
				age: 22,
				gpa: 3.7
			},
			{
				studentId: 'SV006',
				name: 'Nguyen Minh Anh',
				age: 20,
				gpa: 3.4
			},
			{
				studentId: 'SV007',
				name: 'Tran Hoang Long',
				age: 21,
				gpa: 3.1
			},
			{
				studentId: 'SV008',
				name: 'Le Thi Ngoc',
				age: 19,
				gpa: 3.9
			},
			{
				studentId: 'SV009',
				name: 'Pham Quoc Bao',
				age: 22,
				gpa: 2.8
			},
			{
				studentId: 'SV010',
				name: 'Do Thanh Tung',
				age: 20,
				gpa: 3.6
			}
		];

		await Student.insertMany(students);

		console.log('Seed students successfully');

		mongoose.connection.close();
	} catch (error) {
		console.error('Seeder error:', error);

		mongoose.connection.close();
	}
};

seedStudents();
