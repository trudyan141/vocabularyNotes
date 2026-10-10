import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/site-metadata';
export default function robots():MetadataRoute.Robots {
  const preview=process.env.VERCEL_ENV==='preview'||process.env.VERCEL_ENV==='development';
  return {rules:preview?{userAgent:'*',disallow:'/'}:{userAgent:'*',allow:['/','/welcome'],disallow:['/api/','/account','/settings','/capture','/library','/practice','/add','/today','/lessons']},sitemap:`${siteUrl}/sitemap.xml`,host:siteUrl};
}
