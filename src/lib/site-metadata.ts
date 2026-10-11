import type {Metadata} from 'next';
import {startupImages} from './startup-images';
export const siteUrl='https://words-for-kids.vercel.app';
export const siteDescription='Thêm bài từ ảnh và từ điển. Học từ vựng, mẫu câu và ôn tiếng Anh mỗi ngày cùng cáo nhỏ.';
const shareImage={url:'/images/words-for-kids-share.png',width:1200,height:630,alt:'Words for Kids – Vui học tiếng Anh mỗi ngày cùng cáo nhỏ.'};
export const brandMetadata:Metadata={
  metadataBase:new URL(siteUrl),
  applicationName:'Words for Kids',
  title:{default:'Words for Kids – Cùng con học tiếng Anh',template:'%s | Words for Kids'},
  description:siteDescription,
  category:'education',
  appleWebApp:{capable:true,title:'Words for Kids',statusBarStyle:'default',startupImage:startupImages},
  icons:{icon:[{url:'/icon.svg',type:'image/svg+xml'},{url:'/favicon.ico',sizes:'16x16 32x32 48x48',type:'image/x-icon'},{url:'/icons/favicon-32.png',sizes:'32x32',type:'image/png'},{url:'/icons/favicon-16.png',sizes:'16x16',type:'image/png'}],apple:[{url:'/icons/apple-touch-icon.png',sizes:'180x180',type:'image/png'}]},
  openGraph:{type:'website',siteName:'Words for Kids',locale:'vi_VN',url:'/welcome',title:'Words for Kids – Cùng con học tiếng Anh',description:siteDescription,images:[shareImage]},
  twitter:{card:'summary_large_image',title:'Words for Kids – Cùng con học tiếng Anh',description:siteDescription,images:[shareImage.url]},
  robots:{index:false,follow:false},
  formatDetection:{telephone:false},
};
export function publicWelcomeMetadata():Metadata{return {title:{absolute:'Words for Kids – Cùng con học tiếng Anh'},alternates:{canonical:'/welcome'},robots:{index:process.env.VERCEL_ENV!=='preview'&&process.env.VERCEL_ENV!=='development',follow:true}};}
