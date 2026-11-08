const { test } = require('node:test');
const assert = require('node:assert/strict');
const CreateStudentDTO = require('../dtos/CreateStudentDTO');
const UpdateStudentDTO = require('../dtos/UpdateStudentDTO');
const createStudentService = require('../services/studentService');
const createStudentController = require('../controllers/studentController');

const student = { studentId: 'SV001', name: 'An', age: 20, gpa: 3.5 };
const response = () => ({
	status(code) { this.code = code; return this; },
	json(body) { this.body = body; return this; }
});

test('DI: Service works with an in-memory Repository, without MongoDB', async () => {
	const repository = { findByStudentId: async id => id === student.studentId ? student : null };
	const service = createStudentService(repository);
	assert.equal(await service.getById('SV001'), student);
	await assert.rejects(service.getById('missing'), { statusCode: 404, message: 'Student not found' });
	const anotherService = createStudentService({ findByStudentId: async () => null });
	await assert.rejects(anotherService.getById('SV001'), { statusCode: 404 });
	assert.equal(await service.getById('SV001'), student);
});

test('DI: Controller works with a fake Service', async () => {
	const controller = createStudentController({ getAll: async () => [student] });
	const res = response();
	await controller.getAll({}, res);
	assert.equal(res.code, 200);
	assert.deepEqual(res.body.data, [student]);
});

test('Create DTO requires every field and filters unknown fields', () => {
	assert.deepEqual({ ...new CreateStudentDTO({ ...student, admin: true }) }, student);
	for (const field of Object.keys(student)) {
		const input = { ...student };
		delete input[field];
		assert.throws(() => new CreateStudentDTO(input), { statusCode: 400 });
	}
});

test('Update DTO preserves omitted fields and accepts zero', () => {
	assert.deepEqual({ ...new UpdateStudentDTO({ gpa: 0, admin: true }) }, { gpa: 0 });
});

for (const DTO of [CreateStudentDTO, UpdateStudentDTO]) {
	test(`${DTO.name}: rejects invalid bodies and field types`, () => {
		for (const input of [undefined, null, [], 'text', 42, {}, { admin: true }]) {
			assert.throws(() => new DTO(input), { statusCode: 400 });
		}
		for (const invalid of [{ name: ' ' }, { studentId: 12 }, { age: '20' }, { age: null }, { gpa: Infinity }, { gpa: NaN }]) {
			assert.throws(() => new DTO({ ...student, ...invalid }), { statusCode: 400 });
		}
	});
}

for (const action of ['create', 'update']) {
	test(`${action}: invalid DTO returns 400 before calling Service`, async () => {
		let called = false;
		const controller = createStudentController({ [action]: async () => { called = true; } });
		const res = response();
		await controller[action]({ params: { id: 'SV001' }, body: { age: 'invalid' } }, res);
		assert.equal(called, false);
		assert.equal(res.code, 400);
		assert.equal(res.body.success, false);
	});
}

test('Update sends only provided fields through the injected Repository', async () => {
	let received;
	const service = createStudentService({ updateByStudentId: async (id, data) => {
		received = { id, data: { ...data } };
		return { ...student, ...data };
	} });
	const controller = createStudentController(service);
	const res = response();
	await controller.update({ params: { id: 'SV001' }, body: { gpa: 0 } }, res);
	assert.equal(res.code, 200);
	assert.deepEqual(received, { id: 'SV001', data: { gpa: 0 } });
});
