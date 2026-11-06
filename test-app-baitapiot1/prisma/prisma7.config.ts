// sử dụng file này để lấy thông tin kết nối database khi chạy migration
import 'dotenv/config'; // Nó chỉ yêu cầu chạy phần mã khởi tạo của thư viện dotenv nhằm nạp biến môi trường

// import 2 hàm là defineConfig(): khai báo cấu hình prisma, hỗ trợ kiểm tra dữ liệu và gợi ý code
//  và env() đọc biến môi trường theo tên, báo lỗi nếu biến ko tồn tại
import {defineConfig, env} from 'prisma/config' 

// điền cấu hình vào hàm có sẵn là "defineConfig" rồi export
export default defineConfig({
    // tham số 1
    schema: './schema.prisma', // Cho Prisma biết file định nghĩa cấu trúc cơ sở dữ liệu nằm ở đâu.

    // tham số 2
    migrations: {path: './migrations',}, // Quy định thư mục lưu các bản migration.

    // tham số 3
    datasource: {url: env('DATABASE_URL')} // thiết lập địa chỉ kết nối tới database.

})