const { test } = require('node:test');
const assert = require('node:assert/strict');
const Student = require('../models/Student');
const createStudentRepository = require('../repositories/studentRepository');
const createStudentService = require('../services/studentService');
const createStudentController = require('../controllers/studentController');
const controller = createStudentController(createStudentService(createStudentRepository(Student)));

const student = { studentId: 'SV001', name: 'An', age: 20, gpa: 3.5 };
const cases = [
	['getAll', 'find', {}, undefined, [], [student], 200, [student]],
	[
		'getById',
		'findOne',
		{ id: 'SV001' },
		undefined,
		[{ studentId: 'SV001' }],
		student,
		200,
		student
	],
	[
		'create',
		'create',
		{},
		{ ...student, admin: true },
		[student],
		student,
		201,
		student
	],
	[
		'update',
		'findOneAndUpdate',
		{ id: 'SV001' },
		{ ...student, admin: true },
		[{ studentId: 'SV001' }, student, { returnDocument: 'after' }],
		student,
		200,
		student
	],
	[
		'remove',
		'findOneAndDelete',
		{ id: 'SV001' },
		undefined,
		[{ studentId: 'SV001' }],
		student,
		200,
		undefined
	],
	[
		'search',
		'find',
		{},
		undefined,
		[{ name: 'An' }],
		[student],
		200,
		[student]
	],
	[
		'getById',
		'findOne',
		{ id: 'missing' },
		undefined,
		[{ studentId: 'missing' }],
		null,
		404,
		undefined
	],
	[
		'update',
		'findOneAndUpdate',
		{ id: 'missing' },
		student,
		[{ studentId: 'missing' }, student, { returnDocument: 'after' }],
		null,
		200,
		null
	],
	[
		'remove',
		'findOneAndDelete',
		{ id: 'missing' },
		undefined,
		[{ studentId: 'missing' }],
		null,
		200,
		undefined
	]
];

for (const [
	index,
	[action, method, params, body, args, result, status, data]
] of cases.entries()) {
	test(`${action}: response and database arguments (${index})`, async t => {
		const mock = t.mock.method(Student, method, async (...actual) => {
			assert.deepEqual(JSON.parse(JSON.stringify(actual)), args);
			return result;
		});
		const res = {
			status(code) {
				this.code = code;
				return this;
			},
			json(payload) {
				this.payload = payload;
			}
		};
		await controller[action]({ params, body, query: { q: 'An' } }, res);
		assert.equal(mock.mock.callCount(), 1);
		assert.equal(res.code, status);
		assert.equal(res.payload.success, status < 400);
		assert.deepEqual(res.payload.data, data);
		if (status === 404)
			assert.equal(res.payload.message, 'Student not found');
	});
}

for (const [action, method, params, body] of cases.slice(0, 6)) {
	test(`${action}: database failures remain private`, async t => {
		t.mock.method(Student, method, async () => {
			throw new Error('private database details');
		});
		const res = {
			status(code) {
				this.code = code;
				return this;
			},
			json(payload) {
				this.payload = payload;
			}
		};
		await controller[action]({ params, body, query: { q: 'An' } }, res);
		assert.equal(res.code, 500);
		assert.deepEqual(res.payload, {
			message: 'Internal server error',
			success: false
		});
	});
}
