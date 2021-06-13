Bạn vào link : https://nodejs.org/dist/v14.17.0/node-v14.17.0-x86.msi tải và cài đặt gói này.
Bạn vào data_raw.xlsx chỉnh sửa và export ra csv hoặc tạo csv từ googlesheet lưu với tên data.csv.
Chạy run.bat, kết quả sẽ là file output.csv gồm những item đã upload thành công.


________________________________________________________________
CÁCH LẤY DESCRIPTION VỚI FORMAT :
-- Tạo description trong trang Add new product.
-- Nhấn nút F12.
-- Chọn tab console.
-- Điền đoạn sau vào và nhấn enter: document.querySelector("#content").value.
-- Copy đoạn text ở giữa hai dấu ngoặc kép ( không lấy dấu ngoặc kép) và dán vào cột Description trong data.csv.
-- Chú ý: cụm title_to_replace là đoạn sẽ được thay đổi thành key chính khi tool chạy.
