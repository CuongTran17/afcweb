import type { LucideIcon } from 'lucide-react'
import { BookOpenCheck, CalendarCheck2, Handshake, Megaphone } from 'lucide-react'

export type Department = {
  id: string
  name: string
  number: string
  description: string
  responsibilities: string[]
  icon: LucideIcon
}

export const departments: Department[] = [
  {
    id: 'chuyen-mon',
    name: 'Ban Chuyên môn',
    number: '01',
    description: 'Nền tảng học thuật của mọi chương trình AFC.',
    responsibilities: [
      'Tìm kiếm, chọn lọc và hệ thống hóa tài liệu chuyên ngành.',
      'Xây dựng nội dung học tập, tài liệu và slide cho thành viên.',
      'Phối hợp xây dựng nội dung chuyên môn cho các chương trình.',
    ],
    icon: BookOpenCheck,
  },
  {
    id: 'truyen-thong',
    name: 'Ban Truyền thông',
    number: '02',
    description: 'Kể câu chuyện và phát triển hình ảnh của CLB.',
    responsibilities: [
      'Quản lý hình ảnh AFC trên các nền tảng truyền thông.',
      'Thực hiện truyền thông trước, trong và sau chương trình.',
      'Thiết kế ấn phẩm, chụp ảnh, quay phim và dựng video.',
    ],
    icon: Megaphone,
  },
  {
    id: 'su-kien',
    name: 'Ban Sự kiện',
    number: '03',
    description: 'Biến ý tưởng thành những trải nghiệm chỉn chu.',
    responsibilities: [
      'Tổ chức và điều phối các sự kiện của CLB.',
      'Xây dựng kịch bản, timeline và kế hoạch triển khai.',
      'Phụ trách hậu cần và điều phối nhân sự chương trình.',
    ],
    icon: CalendarCheck2,
  },
  {
    id: 'doi-ngoai',
    name: 'Ban Đối ngoại',
    number: '04',
    description: 'Mở rộng mạng lưới và nguồn lực cho AFC.',
    responsibilities: [
      'Duy trì quan hệ với đối tác, nhà tài trợ và các CLB.',
      'Tìm kiếm, kết nối và huy động nguồn lực.',
      'Xây dựng hồ sơ tài trợ và trực tiếp làm việc với đối tác.',
    ],
    icon: Handshake,
  },
]
