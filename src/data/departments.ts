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
    description: 'Phụ trách nội dung học thuật và chuyên môn của CLB.',
    responsibilities: [
      'Xây dựng nội dung học thuật, tài liệu và các chủ đề chuyên môn cho CLB.',
      'Phối hợp phát triển nội dung cho các chương trình, cuộc thi và hoạt động của Khoa.',
      'Hỗ trợ thành viên nâng cao kiến thức và kỹ năng chuyên môn.',
    ],
    icon: BookOpenCheck,
  },
  {
    id: 'truyen-thong',
    name: 'Ban Truyền thông',
    number: '02',
    description: 'Xây dựng hình ảnh và truyền tải các hoạt động của AFC.',
    responsibilities: [
      'Xây dựng nội dung và hình ảnh truyền thông cho các hoạt động của AFC.',
      'Quản lý các kênh truyền thông và duy trì hình ảnh của CLB.',
      'Phụ trách thiết kế, chụp ảnh, quay phim và sản xuất nội dung truyền thông.',
    ],
    icon: Megaphone,
  },
  {
    id: 'su-kien',
    name: 'Ban Sự kiện',
    number: '03',
    description: 'Lên kế hoạch và triển khai các chương trình, sự kiện của CLB.',
    responsibilities: [
      'Lập kế hoạch và triển khai các chương trình, sự kiện của CLB.',
      'Xây dựng kịch bản, timeline và phương án vận hành chương trình.',
      'Phụ trách hậu cần, nhân sự và phối hợp các bộ phận trong quá trình tổ chức.',
    ],
    icon: CalendarCheck2,
  },
  {
    id: 'doi-ngoai',
    name: 'Ban Đối ngoại',
    number: '04',
    description: 'Kết nối đối tác và mở rộng nguồn lực cho các hoạt động của AFC.',
    responsibilities: [
      'Tìm kiếm và kết nối với đối tác, diễn giả và các đơn vị bên ngoài.',
      'Phối hợp xây dựng quyền lợi và duy trì mối quan hệ với các đối tác.',
      'Hỗ trợ huy động nguồn lực cho các chương trình và hoạt động của AFC.',
    ],
    icon: Handshake,
  },
]
