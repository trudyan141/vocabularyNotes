import {mediaRoute} from '@/server/media/route';
export async function POST(request:Request){return mediaRoute(request,'upload');}
