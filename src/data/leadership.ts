export type Leader = {
  name: string
  role: string
  department: 'Ban Chủ nhiệm' | 'Ban Chuyên môn' | 'Ban Truyền thông' | 'Ban Sự kiện' | 'Ban Đối ngoại'
  cohort?: string
  image?: string
}

export const leadership: Leader[] = [
  { name: 'Hoàng Thu Hoài', role: 'Chủ nhiệm', department: 'Ban Chủ nhiệm' },
  { name: 'Đặng Minh Trang', role: 'Phó Chủ nhiệm', department: 'Ban Chủ nhiệm' },
  { name: 'Hoàng Vũ Long', role: 'Phó Chủ nhiệm', department: 'Ban Chủ nhiệm' },
  { name: 'Nguyễn Thị Thanh Thu', role: 'Trưởng ban', department: 'Ban Chuyên môn' },
  { name: 'Dương Minh Tuấn', role: 'Phó ban', department: 'Ban Chuyên môn' },
  { name: 'Trần Như Ngọc', role: 'Trưởng ban', department: 'Ban Truyền thông' },
  { name: 'Lê Thị Duyên', role: 'Phó ban', department: 'Ban Truyền thông' },
  { name: 'Đào Thị Hiền', role: 'Trưởng ban', department: 'Ban Sự kiện' },
  { name: 'Nguyễn Thị Hà', role: 'Phó ban', department: 'Ban Sự kiện' },
  { name: 'Nguyễn Bảo Trâm', role: 'Trưởng ban', department: 'Ban Đối ngoại', cohort: 'D25' },
  { name: 'Trương Khánh Linh', role: 'Phó ban', department: 'Ban Đối ngoại' },
]
