/**
 * lib/categories.ts
 * Định nghĩa các danh mục bài viết và các tiện ích liên quan.
 */

import type { Category } from './types';

// Danh sách đầy đủ các danh mục của website
export const CATEGORIES: Category[] = [
  {
    slug: 'all',
    name: 'Tất cả',
    description: 'Tổng hợp tất cả tin tức công nghệ mới nhất',
    icon: '🌐',
    color: 'slate',
    keywords: [],
  },
  {
    slug: 'ai',
    name: 'Trí tuệ nhân tạo',
    description: 'AI, Machine Learning, ChatGPT, LLM và tương lai của AI',
    icon: '🤖',
    color: 'purple',
    keywords: [
      'ai', 'artificial intelligence', 'machine learning', 'chatgpt', 'gpt',
      'llm', 'deep learning', 'neural network', 'openai', 'gemini', 'copilot',
      'claude', 'llama', 'stable diffusion', 'generative ai', 'robot',
      'trí tuệ nhân tạo', 'học máy', 'mạng nơ-ron',
    ],
  },
  {
    slug: 'hardware',
    name: 'Phần cứng',
    description: 'Chip, CPU, GPU, laptop, màn hình và thiết bị điện tử',
    icon: '🖥️',
    color: 'blue',
    keywords: [
      'chip', 'processor', 'gpu', 'cpu', 'hardware', 'laptop', 'macbook',
      'nvidia', 'amd', 'intel', 'ram', 'ssd', 'nvme', 'semiconductor',
      'transistor', 'display', 'monitor', 'keyboard', 'mouse', 'peripheral',
      'phần cứng', 'vi xử lý', 'bộ nhớ', 'màn hình',
    ],
  },
  {
    slug: 'programming',
    name: 'Lập trình',
    description: 'Ngôn ngữ lập trình, framework, công cụ developer',
    icon: '💻',
    color: 'green',
    keywords: [
      'programming', 'code', 'developer', 'software', 'javascript', 'python',
      'typescript', 'rust', 'golang', 'java', 'framework', 'react', 'vue',
      'angular', 'nextjs', 'api', 'github', 'open source', 'devops',
      'kubernetes', 'docker', 'cloud', 'aws', 'azure',
      'lập trình', 'phần mềm', 'ứng dụng', 'mã nguồn mở',
    ],
  },
  {
    slug: 'mobile',
    name: 'Di động',
    description: 'Smartphone, tablet, iOS, Android và ứng dụng di động',
    icon: '📱',
    color: 'orange',
    keywords: [
      'smartphone', 'iphone', 'android', 'mobile', 'app', 'ios', 'samsung',
      'pixel', 'oneplus', 'xiaomi', 'oppo', 'vivo', 'tablet', 'ipad',
      'wearable', 'smartwatch', 'apple watch',
      'điện thoại', 'di động', 'ứng dụng',
    ],
  },
  {
    slug: 'security',
    name: 'Bảo mật',
    description: 'An ninh mạng, hacker, privacy và bảo vệ dữ liệu',
    icon: '🔒',
    color: 'red',
    keywords: [
      'security', 'hack', 'vulnerability', 'privacy', 'cybersecurity',
      'breach', 'ransomware', 'phishing', 'malware', 'exploit', 'zero-day',
      'encryption', 'vpn', 'firewall', 'cve', 'ddos',
      'bảo mật', 'an ninh mạng', 'mã độc', 'tấn công mạng',
    ],
  },
  {
    slug: 'science',
    name: 'Khoa học',
    description: 'Nghiên cứu khoa học, vũ trụ, y tế và khám phá mới',
    icon: '🔬',
    color: 'teal',
    keywords: [
      'science', 'research', 'study', 'discovery', 'space', 'nasa', 'spacex',
      'biology', 'physics', 'chemistry', 'medical', 'health', 'quantum',
      'climate', 'astronomy', 'telescope', 'mars', 'moon',
      'khoa học', 'nghiên cứu', 'vũ trụ', 'y tế', 'sức khỏe',
    ],
  },
];

/**
 * Tìm danh mục theo slug
 * @param slug - slug của danh mục (vd: "ai", "hardware")
 * @returns Category object hoặc undefined nếu không tìm thấy
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug);
}

/**
 * Lấy các màu Tailwind CSS tương ứng với từng danh mục
 * @param color - tên màu (vd: "purple", "blue")
 * @returns object chứa các class Tailwind
 */
export function getCategoryColors(color: string): {
  bg: string;
  text: string;
  border: string;
  lightBg: string;
} {
  const colorMap: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    slate:  { bg: 'bg-slate-600',  text: 'text-slate-700',  border: 'border-slate-300', lightBg: 'bg-slate-50'  },
    purple: { bg: 'bg-purple-600', text: 'text-purple-700', border: 'border-purple-300', lightBg: 'bg-purple-50' },
    blue:   { bg: 'bg-blue-600',   text: 'text-blue-700',   border: 'border-blue-300',   lightBg: 'bg-blue-50'   },
    green:  { bg: 'bg-green-600',  text: 'text-green-700',  border: 'border-green-300',  lightBg: 'bg-green-50'  },
    orange: { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-300', lightBg: 'bg-orange-50' },
    red:    { bg: 'bg-red-600',    text: 'text-red-700',    border: 'border-red-300',    lightBg: 'bg-red-50'    },
    teal:   { bg: 'bg-teal-600',   text: 'text-teal-700',   border: 'border-teal-300',   lightBg: 'bg-teal-50'   },
  };
  return colorMap[color] ?? colorMap['slate'];
}
