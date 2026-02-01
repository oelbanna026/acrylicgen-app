# دليل الانتقال إلى Next.js (للمستقبل)

هذا الدليل يحتوي على الأكواد الجاهزة التي ستحتاجها إذا قررت نقل مشروعك إلى Next.js (App Router) لتحقيق أقصى درجات الأداء والـ Programmatic SEO.

## 1. توليد خريطة الموقع تلقائياً (Dynamic Sitemap)
بدلاً من تحديث `sitemap.xml` يدوياً، Next.js يقوم بذلك برمجياً.

**الملف:** `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://acrylicgen-app.com'
  
  // صفحات ثابتة
  const routes = ['', '/privacy', '/terms'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.5,
  }))

  // مثال: صفحات صناديق يتم توليدها ديناميكياً (Programmatic SEO)
  // const boxes = ['10x10x5', '20x20x10', '30x30x15'];
  // const boxRoutes = boxes.map(slug => ({
  //   url: `${baseUrl}/box/${slug}`,
  //   lastModified: new Date(),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.8,
  // }))

  return [...routes]
}
```

## 2. تحسين محركات البحث للصفحات (Metadata API)
في Next.js، لا تحتاج لملف `index.html` واحد. كل صفحة لها بياناتها الخاصة التي يراها جوجل بوضوح.

**الملف:** `app/layout.tsx` (الإعدادات العامة)

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://acrylicgen-app.com'),
  title: {
    default: 'Acrylic Designer Pro | Free Laser Cutting Generator',
    template: '%s | Acrylic Designer Pro'
  },
  description: 'Generate SVG/DXF files for laser cutting instantly.',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'Acrylic Designer Pro',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
```

## 3. الـ Programmatic SEO (إنشاء ملايين الصفحات)
هذا هو السر لتصدر نتائج البحث بكلمات مثل "صندوق أكريليك 10x10".

**الملف:** `app/box/[slug]/page.tsx`

```tsx
import { Metadata } from 'next'

type Props = {
  params: { slug: string }
}

// 1. توليد SEO Tags ديناميكياً بناءً على الرابط
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // slug = "10x10x5"
  const [w, h, d] = params.slug.split('x')
  
  return {
    title: `تصميم صندوق أكريليك ${w}x${h}x${d} سم | ملف قص ليزر مجاني`,
    description: `حمل ملف SVG/DXF جاهز لقص صندوق أكريليك بأبعاد ${w}سم عرض، ${h}سم طول، و ${d}سم ارتفاع. حساب تلقائي للتداخل (Kerf).`,
    alternates: {
      canonical: `/box/${params.slug}`,
    }
  }
}

// 2. توليد الصفحات المهمة مسبقاً (SSG) لسرعة خرافية
export async function generateStaticParams() {
  // هذه الصفحات ستكون HTML جاهز عند البناء
  return [
    { slug: '10x10x5' },
    { slug: '20x15x10' },
    { slug: '30x20x15' },
  ]
}

// 3. محتوى الصفحة
export default function BoxPage({ params }: Props) {
  const [w, h, d] = params.slug.split('x')
  
  return (
    <main>
      <h1>تصميم صندوق: {w} × {h} × {d} سم</h1>
      <p>استخدم الأداة أدناه لتعديل السماكة وتحميل الملف.</p>
      {/* استدعاء مكون الأداة (Client Component) */}
      {/* <AcrylicEditor initialDims={{ w, h, d }} /> */}
    </main>
  )
}
```
