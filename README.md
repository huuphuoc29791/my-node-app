# Student API

API quản lý sinh viên sử dụng Express và MongoDB (Mongoose).

## Chạy dự án

```sh
npm install
npm start
```

MongoDB cần chạy tại `mongodb://127.0.0.1:27017/student_db`.
Server chạy tại `http://localhost:3000`.

Chạy kiểm thử: `npm test` (không cần MongoDB).
`npm run seed` tạo dữ liệu mẫu nhưng sẽ xóa toàn bộ sinh viên hiện có.

## Kiến trúc

```text
Request → Route → Controller → Service → Repository → Model → MongoDB
```

- **Route** (`routes/studentRoutes.js`): ánh xạ URL và phương thức HTTP tới Controller.
- **Controller** (`controllers/studentController.js`): lấy tham số từ request, gọi Service, trả mã HTTP và JSON. Không truy vấn MongoDB trực tiếp.
- **Service** (`services/studentService.js`): xử lý quy tắc của chức năng và báo lỗi khi lấy sinh viên không tồn tại. Đây là nơi bổ sung quy tắc nghiệp vụ khi cần; không phụ thuộc `req` hay `res`.
- **Repository** (`repositories/studentRepository.js`): tập trung các truy vấn đọc, tạo, sửa và xóa bằng Mongoose. Không quyết định mã HTTP hay định dạng phản hồi.
- **Model** (`models/Student.js`): định nghĩa cấu trúc và ràng buộc dữ liệu.

Ví dụ: `GET /api/students/SV001` đi qua Controller → `studentService.getById('SV001')` → `studentRepository.findByStudentId('SV001')` → `Student.findOne({ studentId: 'SV001' })`. Service báo không tìm thấy nếu kết quả rỗng; Controller chuyển thành phản hồi HTTP 404.

Tách Service giúp dùng lại nghiệp vụ ở nhiều nơi (API, tác vụ nền) và kiểm thử mà không cần HTTP. Tách Repository giúp cô lập truy vấn, giảm mã lặp và giới hạn phạm vi sửa khi thay cách lưu trữ. Khi đổi cơ sở dữ liệu, cần triển khai lại Repository và kiểm tra hợp đồng dữ liệu trả về.

## API

| Phương thức | Đường dẫn | Chức năng |
| --- | --- | --- |
| GET | `/api/students` | Danh sách sinh viên |
| GET | `/api/students/search?q=An` | Tìm theo tên chính xác |
| GET | `/api/students/:id` | Lấy theo `studentId`, không phải MongoDB `_id` |
| POST | `/api/students` | Tạo sinh viên |
| PUT | `/api/students/:id` | Cập nhật sinh viên |
| DELETE | `/api/students/:id` | Xóa sinh viên |

POST/PUT nhận JSON gồm `studentId`, `name`, `age`, `gpa`.

Các quy ước API: GET theo ID không tồn tại trả 404; PUT không tìm thấy trả 200 với `data: null`; DELETE không tìm thấy vẫn trả 200. DTO không hợp lệ trả 400. Lỗi cơ sở dữ liệu trả 500. PUT giữ cách cập nhật hiện có, chưa ép thay thế toàn bộ tài liệu. Chưa có endpoint PATCH.

Kiểm thử kiểm tra luồng Controller → Service → Repository với các lời gọi Model được giả lập: sáu thao tác, lọc trường ngoài danh sách cho phép, trường hợp không tìm thấy và lỗi cơ sở dữ liệu. Kiểm thử này không xác minh kết nối hay hành vi MongoDB thực tế.

## Demo Dependency Injection (DI)

DI là truyền thành phần cần dùng từ bên ngoài vào, thay vì để thành phần tự import một triển khai cụ thể.

```js
const studentRepository = createStudentRepository(Student);
const studentService = createStudentService(studentRepository);
const studentController = createStudentController(studentService);
```

Đoạn lắp ráp thực tế nằm ở `dependencies/studentDependencies.js` (composition root). Route dùng Controller đã được lắp ráp. Controller không import Service cụ thể, Service không import Repository cụ thể; Repository cũng nhận Model qua tham số. Không cần thư viện DI.

Ví dụ giảng trên lớp, chạy từ thư mục gốc dự án:

```js
const createStudentService = require('./services/studentService');

const fakeRepository = {
  findByStudentId: async id => ({ studentId: id, name: 'Demo' })
};

const service = createStudentService(fakeRepository);
service.getById('SV001').then(console.log);
```

Service dùng được với Repository giả mà không cần MongoDB. Mỗi hàm factory trả về một đối tượng mới; không có dependency dùng chung bị thay đổi khi tạo một Service khác. Repository giả cần cung cấp những phương thức mà tình huống demo gọi tới.

## Demo CreateStudentDTO và UpdateStudentDTO

Luồng ghi dữ liệu: JSON → Controller tạo DTO → Service → Repository → Model.

- `dtos/CreateStudentDTO.js`: yêu cầu đủ `studentId`, `name`, `age`, `gpa`.
- `dtos/UpdateStudentDTO.js`: chỉ lấy các trường được gửi; yêu cầu ít nhất một trường được phép cập nhật. Vẫn cho đổi `studentId` theo hành vi API hiện tại.
- `dtos/studentDtoValidation.js`: dùng chung kiểm tra kiểu dữ liệu. Hai trường chuỗi không được rỗng hoặc chỉ có khoảng trắng; `age`, `gpa` phải là số hữu hạn. Không tự đổi chuỗi số thành số; chưa đặt giới hạn tuổi hay thang GPA vì chưa có quy định nghiệp vụ.
- Cả hai DTO bỏ qua trường ngoài danh sách, ví dụ `admin`. Body chỉ có trường lạ bị từ chối vì không có dữ liệu cập nhật hợp lệ.

DTO là đối tượng mang dữ liệu; trong demo này, constructor còn gọi validation để báo lỗi đầu vào sớm. Không truyền `req` hoặc `res` vào DTO. Model vẫn giữ ràng buộc dữ liệu khi lưu.

Tạo sinh viên:

```sh
curl -X POST http://localhost:3000/api/students \
  -H 'Content-Type: application/json' \
  -d '{"studentId":"SV011","name":"Demo","age":20,"gpa":3.5}'
```

Cập nhật riêng GPA, không gửi lại các trường khác:

```sh
curl -X PUT http://localhost:3000/api/students/SV011 \
  -H 'Content-Type: application/json' \
  -d '{"gpa":3.8}'
```

Gửi `{"age":"hai mươi"}` vào PUT sẽ trả 400; Service chưa được gọi. POST thiếu trường cũng trả 400. API giữ PUT cập nhật từng phần để tương thích dự án; nếu chuẩn hóa sau này nên chuyển thao tác cập nhật từng phần sang PATCH và định nghĩa PUT thay thế đầy đủ.

Gợi ý demo: đọc composition root → thay Repository bằng fake như ví dụ → so sánh hai DTO → gửi request hợp lệ và không hợp lệ → chạy `npm test`. Các ví dụ kiểm thử DI và DTO nằm trong `tests/studentDtoAndDi.test.js`, không cần MongoDB.
